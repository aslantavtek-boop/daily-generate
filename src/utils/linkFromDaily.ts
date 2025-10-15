import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type DailyRow = {
  Airline: string; // FLC
  'Operator Flight Number': number; // FLN
  'Flight Suffix'?: string; // FLX (optional)
  Station: string; // ORG-DST
  SDT: string; // YYYYMMDD
  STA?: string; // HH:mm (ARR)
  STD?: string; // HH:mm (DEP)
  REG?: string;
};

export type LinkedRow = {
  ARR_FLC: string;
  ARR_FLN: number;
  ARR_FLX: string;
  ARR_SDT: string;
  ARR_STA: string;
  REG: string;
  DEP_FLC: string;
  DEP_FLN: number;
  DEP_FLX: string;
  DEP_SDT: string;
  DEP_STD: string;
};

export type LinkStats = {
  totalArr: number;
  totalDep: number;
  matched: number;
  skippedArr: number;
  skippedDep: number;
  warnings: string[];
};

interface ArrivalFlight {
  row: DailyRow;
  timestamp: dayjs.Dayjs;
  key: string;
  remote: string;
}

interface DepartureFlight {
  row: DailyRow;
  timestamp: dayjs.Dayjs;
  key: string;
  remote: string;
  consumed: boolean;
}

function normalizeFlightSuffix(suffix?: string): string {
  if (!suffix || suffix.trim() === '') return 'O';
  return suffix.trim().toUpperCase();
}

function normalizeReg(reg?: string): string {
  if (!reg) return '';
  return reg.trim().toUpperCase();
}

function parseFlightTime(sdt: string, time?: string): dayjs.Dayjs | null {
  if (!time) return null;
  
  // Handle both HH:mm and HH:mm:ss formats
  const timeFormats = ['HH:mm', 'HH:mm:ss'];
  const sdtFormat = 'YYYYMMDD';
  
  // Parse SDT (date)
  const date = dayjs(sdt, sdtFormat);
  if (!date.isValid()) return null;
  
  // Parse time
  let parsedTime: dayjs.Dayjs | null = null;
  for (const format of timeFormats) {
    const parsed = dayjs(time, format);
    if (parsed.isValid()) {
      parsedTime = parsed;
      break;
    }
  }
  
  if (!parsedTime) return null;
  
  // Combine date and time
  return date
    .hour(parsedTime.hour())
    .minute(parsedTime.minute())
    .second(parsedTime.second() || 0);
}

function extractRemoteStation(station: string, home: string): string | null {
  const parts = station.split('-').map(p => p.trim().toUpperCase());
  if (parts.length !== 2) return null;
  
  const [org, dst] = parts;
  
  // For arrivals: XXX-HOME -> remote is XXX
  if (dst === home.toUpperCase()) return org;
  
  // For departures: HOME-XXX -> remote is XXX
  if (org === home.toUpperCase()) return dst;
  
  return null;
}

function isArrival(station: string, home: string): boolean {
  const parts = station.split('-').map(p => p.trim().toUpperCase());
  if (parts.length !== 2) return false;
  return parts[1] === home.toUpperCase();
}

function isDeparture(station: string, home: string): boolean {
  const parts = station.split('-').map(p => p.trim().toUpperCase());
  if (parts.length !== 2) return false;
  return parts[0] === home.toUpperCase();
}

export function buildLinkedRowsFromDaily(
  dailyRows: DailyRow[],
  home = 'ADB',
  minGroundMin = 30
): { linked: LinkedRow[]; stats: LinkStats } {
  const stats: LinkStats = {
    totalArr: 0,
    totalDep: 0,
    matched: 0,
    skippedArr: 0,
    skippedDep: 0,
    warnings: [],
  };

  const arrivals: ArrivalFlight[] = [];
  const departures: DepartureFlight[] = [];

  // Step 1: Parse and categorize flights
  for (const row of dailyRows) {
    // Validate REG
    const reg = normalizeReg(row.REG);
    if (!reg) {
      stats.warnings.push(`Skipping flight ${row.Airline}${row['Operator Flight Number']}: missing REG`);
      continue;
    }

    const flx = normalizeFlightSuffix(row['Flight Suffix']);
    const flc = row.Airline?.trim().toUpperCase() || '';
    const fln = row['Operator Flight Number'];
    
    if (!flc || !fln) {
      stats.warnings.push(`Skipping flight: missing Airline or Flight Number`);
      continue;
    }

    // Check if arrival or departure
    if (isArrival(row.Station, home)) {
      const remote = extractRemoteStation(row.Station, home);
      if (!remote) {
        stats.warnings.push(`Invalid station format for ARR: ${row.Station}`);
        continue;
      }

      const timestamp = parseFlightTime(row.SDT, row.STA);
      if (!timestamp) {
        stats.warnings.push(`Invalid time for ARR ${flc}${fln}: SDT=${row.SDT}, STA=${row.STA}`);
        continue;
      }

      const key = `${reg}|${flc}|${fln}|${flx}|${remote}`;
      arrivals.push({ row, timestamp, key, remote });
      stats.totalArr++;
    } else if (isDeparture(row.Station, home)) {
      const remote = extractRemoteStation(row.Station, home);
      if (!remote) {
        stats.warnings.push(`Invalid station format for DEP: ${row.Station}`);
        continue;
      }

      const timestamp = parseFlightTime(row.SDT, row.STD);
      if (!timestamp) {
        stats.warnings.push(`Invalid time for DEP ${flc}${fln}: SDT=${row.SDT}, STD=${row.STD}`);
        continue;
      }

      const key = `${reg}|${flc}|${fln}|${flx}|${remote}`;
      departures.push({ row, timestamp, key, remote, consumed: false });
      stats.totalDep++;
    }
  }

  // Step 2: Sort arrivals and departures by time
  arrivals.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());
  departures.sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

  // Step 3: Build index for departures by key
  const departuresByKey = new Map<string, DepartureFlight[]>();
  for (const dep of departures) {
    if (!departuresByKey.has(dep.key)) {
      departuresByKey.set(dep.key, []);
    }
    departuresByKey.get(dep.key)!.push(dep);
  }

  // Step 4: Match arrivals with departures
  const linked: LinkedRow[] = [];

  for (const arr of arrivals) {
    const candidates = departuresByKey.get(arr.key);
    if (!candidates || candidates.length === 0) {
      stats.skippedArr++;
      continue;
    }

    // Find the earliest valid departure (not consumed, time constraints met)
    let bestDep: DepartureFlight | null = null;
    
    for (const dep of candidates) {
      if (dep.consumed) continue;
      
      // Check time constraint: DEP must be after ARR
      if (dep.timestamp.isBefore(arr.timestamp) || dep.timestamp.isSame(arr.timestamp)) {
        continue;
      }
      
      // Check ground time
      const groundTimeMin = dep.timestamp.diff(arr.timestamp, 'minute');
      if (groundTimeMin < minGroundMin) {
        continue;
      }
      
      // This is a valid candidate
      bestDep = dep;
      break; // Take the earliest one
    }

    if (!bestDep) {
      stats.skippedArr++;
      continue;
    }

    // Mark departure as consumed
    bestDep.consumed = true;

    // Create linked row
    const linkedRow: LinkedRow = {
      ARR_FLC: arr.row.Airline.trim().toUpperCase(),
      ARR_FLN: arr.row['Operator Flight Number'],
      ARR_FLX: normalizeFlightSuffix(arr.row['Flight Suffix']),
      ARR_SDT: arr.row.SDT,
      ARR_STA: arr.row.STA || '',
      REG: normalizeReg(arr.row.REG),
      DEP_FLC: bestDep.row.Airline.trim().toUpperCase(),
      DEP_FLN: bestDep.row['Operator Flight Number'],
      DEP_FLX: normalizeFlightSuffix(bestDep.row['Flight Suffix']),
      DEP_SDT: bestDep.row.SDT,
      DEP_STD: bestDep.row.STD || '',
    };

    linked.push(linkedRow);
    stats.matched++;
  }

  // Step 5: Count unconsumed departures
  for (const dep of departures) {
    if (!dep.consumed) {
      stats.skippedDep++;
    }
  }

  return { linked, stats };
}

