export type DailyRow = {
  Airline: string;                         // FLC
  'Operator Flight Number': number;        // FLN
  'Flight Suffix'?: string;                // FLX
  Station: string;                         // ORG-DST
  SDT: string;                             // YYYYMMDD
  STA?: string;                            // HH:mm (ARR)
  STD?: string;                            // HH:mm (DEP)
  REG?: string;
};

export type AutoLinkedRow = {
  ARR_FLC: string;
  ARR_FLN: number | '';
  ARR_FLX: string;
  ARR_SDT: string;
  ARR_STA: string;
  REG: string;
  DEP_FLC: string;
  DEP_FLN: number | '';
  DEP_FLX: string;
  DEP_SDT: string;
  DEP_STD: string;
};

export type AutoLinkStats = {
  total: number;
  arr: number;
  dep: number;
  skipped: number;
};

function normalizeFlx(v?: string): string {
  return (v && v.trim()) ? v.trim() : 'O';
}

function z2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function normTimeHHmm(v?: string): string {
  if (!v) return '';
  const m = v.match(/^(\d{1,2}):(\d{1,2})/);
  if (!m) return '';
  return `${z2(+m[1])}:${z2(+m[2])}`;
}

export function buildAutoLinkedRowsFromDaily(
  daily: DailyRow[],
  home = 'ADB'
): { rows: AutoLinkedRow[]; stats: AutoLinkStats } {
  const rows: AutoLinkedRow[] = [];
  let arr = 0, dep = 0, skipped = 0;

  for (const d of daily) {
    const flx = normalizeFlx(d['Flight Suffix']);
    const reg = (d.REG ?? '').trim();
    const station = (d.Station ?? '').toUpperCase();
    const homeUpper = home.toUpperCase();
    
    const isArr = station.endsWith(`-${homeUpper}`);
    const isDep = station.startsWith(`${homeUpper}-`);

    if (!isArr && !isDep) {
      skipped++;
      continue;
    }

    if (isArr) {
      arr++;
      rows.push({
        ARR_FLC: d.Airline ?? '',
        ARR_FLN: d['Operator Flight Number'] ?? '',
        ARR_FLX: flx,
        ARR_SDT: d.SDT ?? '',
        ARR_STA: normTimeHHmm(d.STA),
        REG: reg,
        DEP_FLC: '',
        DEP_FLN: '',
        DEP_FLX: '',
        DEP_SDT: '',
        DEP_STD: '',
      });
    } else {
      dep++;
      rows.push({
        ARR_FLC: '',
        ARR_FLN: '',
        ARR_FLX: '',
        ARR_SDT: '',
        ARR_STA: '',
        REG: reg,
        DEP_FLC: d.Airline ?? '',
        DEP_FLN: d['Operator Flight Number'] ?? '',
        DEP_FLX: flx,
        DEP_SDT: d.SDT ?? '',
        DEP_STD: normTimeHHmm(d.STD),
      });
    }
  }

  return {
    rows,
    stats: {
      total: daily.length,
      arr,
      dep,
      skipped,
    },
  };
}

