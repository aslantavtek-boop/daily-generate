import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { v4 as uuidv4 } from 'uuid';
import { Flight, FlightGeneratorConfig } from '../types/flight';

dayjs.extend(utc);
dayjs.extend(timezone);

// Seeded random number generator (mulberry32)
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

// Generate a random time in the given range with distribution mode
function generateArrivalTime(
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
  distributionMode: 'Uniform' | 'Peak',
  rng: SeededRandom
): dayjs.Dayjs {
  const startMs = start.valueOf();
  const endMs = end.valueOf();
  const rangeMs = endMs - startMs;

  if (distributionMode === 'Uniform') {
    const randomMs = startMs + rng.next() * rangeMs;
    return dayjs(randomMs);
  } else {
    // Peak distribution: 06:00-10:00 and 17:00-22:00 have higher weight
    // We'll generate a random time and then adjust to peak hours with higher probability
    const randomMs = startMs + rng.next() * rangeMs;
    let timestamp = dayjs(randomMs);

    // 60% chance to place in peak hours
    if (rng.next() < 0.6) {
      const hour = timestamp.hour();
      // If not in peak hours, adjust to peak
      if (!((hour >= 6 && hour < 10) || (hour >= 17 && hour < 22))) {
        // Randomly choose morning or evening peak
        const useMorningPeak = rng.next() < 0.5;
        if (useMorningPeak) {
          // Morning peak: 06:00-10:00
          timestamp = timestamp.hour(rng.nextInt(6, 9)).minute(rng.nextInt(0, 59)).second(rng.nextInt(0, 59));
        } else {
          // Evening peak: 17:00-22:00
          timestamp = timestamp.hour(rng.nextInt(17, 21)).minute(rng.nextInt(0, 59)).second(rng.nextInt(0, 59));
        }
      }
    }

    // Ensure we're still within bounds
    if (timestamp.isBefore(start)) timestamp = start;
    if (timestamp.isAfter(end)) timestamp = end;

    return timestamp;
  }
}

export function generateFlights(config: FlightGeneratorConfig): Flight[] {
  const {
    startDatetime,
    endDatetime,
    timezoneMode,
    homeAirport,
    numberOfPairs,
    airlines,
    flightNumberMin,
    flightNumberMax,
    remoteStations: rawRemoteStations,
    serviceTypes,
    distributionMode,
    minGroundTime,
    maxGroundTime,
    seed,
  } = config;

  // Filter out home airport from remote stations
  const remoteStations = rawRemoteStations.filter(
    station => station.toUpperCase() !== homeAirport.toUpperCase()
  );

  if (remoteStations.length === 0) {
    throw new Error('No valid remote stations available');
  }

  // Initialize random number generator
  const rng = seed ? new SeededRandom(seed) : new SeededRandom(Date.now().toString() + Math.random().toString());

  const flights: Flight[] = [];
  const start = timezoneMode === 'UTC' ? dayjs(startDatetime).utc() : dayjs(startDatetime);
  const end = timezoneMode === 'UTC' ? dayjs(endDatetime).utc() : dayjs(endDatetime);

  for (let i = 0; i < numberOfPairs; i++) {
    const pairId = uuidv4();
    
    // Random selections for this pair
    const airline = rng.choice(airlines);
    const remoteStation = rng.choice(remoteStations);
    const serviceType = rng.choice(serviceTypes);
    const flightNumber = rng.nextInt(flightNumberMin, flightNumberMax);
    
    // Generate arrival time
    let arrivalTime: dayjs.Dayjs;
    let departureTime: dayjs.Dayjs;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      arrivalTime = generateArrivalTime(start, end, distributionMode, rng);
      const groundTime = rng.nextInt(minGroundTime, maxGroundTime);
      departureTime = arrivalTime.add(groundTime, 'minute');
      attempts++;

      if (attempts >= maxAttempts) {
        // If we can't find a valid pair, skip this one
        console.warn(`Could not generate valid pair ${i + 1} after ${maxAttempts} attempts`);
        break;
      }
    } while (departureTime.isAfter(end));

    if (attempts >= maxAttempts) continue;

    // Format: DD/MM/YYYY HH:mm:ss
    const formatDate = (date: dayjs.Dayjs): string => {
      return date.format('DD/MM/YYYY HH:mm:ss');
    };

    // Create ARR flight (XXX -> HOME)
    const arrFlight: Flight = {
      'Airline': airline,
      'Operator Flight Number': flightNumber,
      'Station': `${remoteStation}-${homeAirport}`,
      'STAD': formatDate(arrivalTime),
      'Flight Service Type': serviceType,
      _pairId: pairId,
      _legType: 'ARR',
      _home: homeAirport,
    };

    // Create DEP flight (HOME -> XXX)
    const depFlight: Flight = {
      'Airline': airline,
      'Operator Flight Number': flightNumber,
      'Station': `${homeAirport}-${remoteStation}`,
      'STAD': formatDate(departureTime),
      'Flight Service Type': serviceType,
      _pairId: pairId,
      _legType: 'DEP',
      _home: homeAirport,
    };

    flights.push(arrFlight, depFlight);
  }

  return flights;
}

export function validateConfig(config: Partial<FlightGeneratorConfig>): string[] {
  const errors: string[] = [];

  if (!config.startDatetime || !config.endDatetime) {
    errors.push('Start and end datetime are required');
  } else if (config.startDatetime >= config.endDatetime) {
    errors.push('Start datetime must be before end datetime');
  } else {
    // Check if range is more than 31 days
    const diffDays = dayjs(config.endDatetime).diff(dayjs(config.startDatetime), 'day');
    if (diffDays > 31) {
      errors.push('Date range must not exceed 31 days');
    }
  }

  if (!config.homeAirport) {
    errors.push('Home airport is required');
  } else if (config.homeAirport.length !== 3) {
    errors.push('Home airport must be exactly 3 letters (IATA code)');
  }

  if (!config.numberOfPairs || config.numberOfPairs < 1 || config.numberOfPairs > 10000) {
    errors.push('Number of pairs must be between 1 and 10,000');
  }

  if (!config.airlines || config.airlines.length === 0) {
    errors.push('At least one airline must be selected');
  }

  if (!config.remoteStations || config.remoteStations.length === 0) {
    errors.push('At least one remote station is required');
  } else {
    const invalidStations = config.remoteStations.filter(s => s.length !== 3);
    if (invalidStations.length > 0) {
      errors.push(`Invalid remote stations (must be 3 letters): ${invalidStations.join(', ')}`);
    }
  }

  if (!config.serviceTypes || config.serviceTypes.length === 0) {
    errors.push('At least one service type must be selected');
  }

  if (!config.minGroundTime || config.minGroundTime < 30) {
    errors.push('Minimum ground time must be at least 30 minutes');
  }

  if (!config.maxGroundTime || config.maxGroundTime < config.minGroundTime!) {
    errors.push('Maximum ground time must be greater than minimum ground time');
  }

  if (config.flightNumberMin && config.flightNumberMax && config.flightNumberMin > config.flightNumberMax) {
    errors.push('Minimum flight number must be less than or equal to maximum');
  }

  return errors;
}

