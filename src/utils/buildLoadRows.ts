export type DailyRow = {
  Airline: string;
  'Operator Flight Number': number;
  Station: string;   // ORG-DST
  SDT: string;       // YYYYMMDD
  REG?: string;
  'Flight Service Type'?: string;
};

export type BuildOpts = {
  home: string;                  // default 'ADB'
  minTotal: number;              // default 50
  maxTotal: number;              // default 180
  childRatioMin: number;         // default 0  (yüzde)
  childRatioMax: number;         // default 40 (yüzde)
  defaultFST: string;            // default 'J'
};

export type LoadRow = {
  Date: string;                      // DD/MM/YYYY
  'Operator Flight Number': number;
  'Origin Station': string;
  'Destination Station': string;
  Reg: string;
  'Flight Service Type': string;
  totalpax: number;
  child: number;
  adult: number;
};

export type LoadStats = {
  total: number;
  skipped: number;
};

/**
 * Convert YYYYMMDD to DD/MM/YYYY
 */
function formatDateDDMMYYYY(sdt: string): string {
  if (!sdt || sdt.length !== 8) return '';
  const yyyy = sdt.substring(0, 4);
  const mm = sdt.substring(4, 6);
  const dd = sdt.substring(6, 8);
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if station is ARR (XXX-HOME)
 */
function isArrival(station: string, home: string): boolean {
  const parts = station.split('-').map(p => p.trim().toUpperCase());
  if (parts.length !== 2) return false;
  return parts[1] === home.toUpperCase();
}

/**
 * Check if station is DEP (HOME-XXX)
 */
function isDeparture(station: string, home: string): boolean {
  const parts = station.split('-').map(p => p.trim().toUpperCase());
  if (parts.length !== 2) return false;
  return parts[0] === home.toUpperCase();
}

/**
 * Extract origin and destination from station
 */
function extractOriginDestination(
  station: string,
  home: string
): { origin: string; destination: string } | null {
  const parts = station.split('-').map(p => p.trim().toUpperCase());
  if (parts.length !== 2) return null;
  
  const [org, dst] = parts;
  const homeUpper = home.toUpperCase();
  
  // ARR: XXX-HOME -> Origin=XXX, Destination=HOME
  if (dst === homeUpper) {
    return { origin: org, destination: homeUpper };
  }
  
  // DEP: HOME-XXX -> Origin=HOME, Destination=XXX
  if (org === homeUpper) {
    return { origin: homeUpper, destination: dst };
  }
  
  return null;
}

/**
 * Build Load rows from Daily rows
 */
export function buildLoadRows(
  daily: DailyRow[],
  opts: BuildOpts
): { rows: LoadRow[]; stats: LoadStats } {
  const rows: LoadRow[] = [];
  let skipped = 0;

  for (const d of daily) {
    // Validate required fields
    if (!d.SDT || !d['Operator Flight Number'] || !d.Station) {
      skipped++;
      continue;
    }

    // Parse station
    const odPair = extractOriginDestination(d.Station, opts.home);
    if (!odPair) {
      skipped++;
      continue;
    }

    // Format date
    const date = formatDateDDMMYYYY(d.SDT);
    if (!date) {
      skipped++;
      continue;
    }

    // REG is required
    const reg = (d.REG || '').trim();
    if (!reg) {
      skipped++;
      continue;
    }

    // Flight Service Type
    const fst = d['Flight Service Type'] || opts.defaultFST;

    // Generate random pax
    const totalpax = randomInt(opts.minTotal, opts.maxTotal);
    
    // Random child ratio percentage
    const childRatioPct = randomInt(opts.childRatioMin, opts.childRatioMax);
    const child = Math.round((totalpax * childRatioPct) / 100);
    const adult = totalpax - child;

    // Create Load row
    const loadRow: LoadRow = {
      Date: date,
      'Operator Flight Number': d['Operator Flight Number'],
      'Origin Station': odPair.origin,
      'Destination Station': odPair.destination,
      Reg: reg,
      'Flight Service Type': fst,
      totalpax,
      child,
      adult,
    };

    rows.push(loadRow);
  }

  return {
    rows,
    stats: {
      total: daily.length,
      skipped,
    },
  };
}

