export type LegType = 'ARR' | 'DEP';
export type DistributionMode = 'Uniform' | 'Peak';
export type TimezoneMode = 'Local' | 'UTC';

export interface Flight {
  'Airline': string;
  'Operator Flight Number': number;
  'Station': string;
  'STAD': string; // DD/MM/YYYY HH:mm:ss
  'Flight Service Type': string;
  _pairId: string;
  _legType: LegType;
  _home: string;
}

export interface FlightGeneratorConfig {
  // Date Range
  startDatetime: Date;
  endDatetime: Date;
  timezoneMode: TimezoneMode;
  
  // Airport
  homeAirport: string; // IATA code, 3 letters
  
  // Flight Generation
  numberOfPairs: number; // 1-10,000
  
  // Airlines
  airlines: string[]; // Array of airline codes
  
  // Flight Numbers
  flightNumberMin: number;
  flightNumberMax: number;
  
  // Remote Stations
  remoteStations: string[]; // IATA codes
  
  // Service Types
  serviceTypes: string[];
  
  // Distribution
  distributionMode: DistributionMode;
  
  // Ground Time (minutes)
  minGroundTime: number;
  maxGroundTime: number;
  
  // Seed
  seed?: string;
  
  // Preview
  previewLimit: number;
}

export interface APIPostConfig {
  enabled: boolean;
  endpoint: string;
  bearerToken: string;
  batchSize: number;
}

