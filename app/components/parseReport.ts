export interface VehicleData {
  make: string;
  model: string;
  year: string;
  trim: string;
  series: string;
  bodyClass: string;
  vehicleType: string;

  engineDisplacement: string;
  cylinders: string;
  engineHP: string;
  fuelType: string;
  driveType: string;
  transmission: string;

  plant: string;
  plantCity: string;
  plantCountry: string;
  plantState: string;
  manufacturerName: string;

  recallStatus: string;
  salvageLog: string;

  doors: string;
  seatBelts: string;
  abs: string;
  airBags: string;

  extras: Record<string, string>;
}

const FIELD_MAP: Record<string, keyof Omit<VehicleData, 'extras'>> = {
  'make': 'make',

  'model': 'model',
  'model year': 'year',

  'year': 'year',
  'model year (decoded)': 'year',

  'trim': 'trim',
  'trim level': 'trim',
  'series': 'series',
  'series (decoded)': 'series',

  'body class': 'bodyClass',
  'body style': 'bodyClass',
  'body type': 'bodyClass',
  'vehicle type': 'vehicleType',

  'displacement (l)': 'engineDisplacement',
  'displacement (cc)': 'engineDisplacement',
  'displacement (ci)': 'engineDisplacement',
  'engine displacement': 'engineDisplacement',
  'displacement': 'engineDisplacement',
  'cylinders': 'cylinders',
  'number of cylinders': 'cylinders',
  'engine number of cylinders': 'cylinders',
  'engine horsepower': 'engineHP',
  'horsepower': 'engineHP',
  'engine hp': 'engineHP',

  'fuel type - primary': 'fuelType',
  'fuel type': 'fuelType',
  'fuel type (primary)': 'fuelType',
  'electrification level': 'fuelType',

  'drive type': 'driveType',
  'drive wheel codes': 'driveType',

  'transmission style': 'transmission',
  'transmission': 'transmission',

  'factory assembly plant': 'plant',
  'assembly plant': 'plant',
  'manufacturing plant': 'plant',
  'plant city': 'plantCity',
  'plant country': 'plantCountry',
  'plant state': 'plantState',
  'manufacturer name': 'manufacturerName',
  'manufacturer': 'manufacturerName',

  'official nhtsa recall status': 'recallStatus',
  'nhtsa recall status': 'recallStatus',
  'recall status': 'recallStatus',
  'official nhtsa recall': 'recallStatus',
  'copart / iaai log': 'salvageLog',
  'copart/iaai log': 'salvageLog',
  'salvage records': 'salvageLog',
  'auction registry search': 'salvageLog',

  'doors': 'doors',
  'number of doors': 'doors',
  'seat belts type': 'seatBelts',
  'abs': 'abs',
  'anti-lock braking system (abs)': 'abs',
  'air bag loc front': 'airBags',
  'air bags': 'airBags',
};

function normalise(raw: string): string {
  return raw
    .replace(/\*\*/g, '')
    .replace(/[_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function cleanValue(raw: string): string {
  return raw
    .replace(/\*\*/g, '')
    .replace(/[_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

export function parseReport(report?: string): VehicleData {
  const data: VehicleData = {
    make: '', model: '', year: '', trim: '', series: '', bodyClass: '', vehicleType: '',
    engineDisplacement: '', cylinders: '', engineHP: '', fuelType: '', driveType: '', transmission: '',
    plant: '', plantCity: '', plantCountry: '', plantState: '', manufacturerName: '',
    recallStatus: '', salvageLog: '',
    doors: '', seatBelts: '', abs: '', airBags: '',
    extras: {},
  };

  const safeReport = report || '';
  const lines = safeReport.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    let rawKey = '';
    let rawValue = '';

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2 && !cells[0].match(/^[-:]+$/)) {
        rawKey   = cells[0];
        rawValue = cells[1];
      }
    }
    else {
      const match = trimmed.match(/^[-*•]?\s*\*{0,2}([^:*]+?)\*{0,2}\s*:\s*(.+)$/);
      if (match) {
        rawKey   = match[1];
        rawValue = match[2];
      }
    }

    if (!rawKey) continue;

    const normKey = normalise(rawKey);
    const value   = cleanValue(rawValue);
    if (!value || value === 'Not Available' || value === 'N/A' || value === '-') continue;

    const fieldName = FIELD_MAP[normKey];
    if (fieldName) {
      if (!data[fieldName]) {
        (data as unknown as Record<string, string>)[fieldName] = value;
      }
    } else {
      const prettyKey = rawKey.replace(/\*\*/g, '').trim();
      if (prettyKey && !data.extras[prettyKey]) {
        data.extras[prettyKey] = value;
      }
    }
  }

  return data;
}

export function countryFlag(country?: string): string {
  const c = (country || '').toLowerCase();
  if (c.includes('united states') || c.includes('usa') || c.includes('u.s.')) return '🇺🇸';
  if (c.includes('germany'))  return '🇩🇪';
  if (c.includes('japan'))    return '🇯🇵';
  if (c.includes('south korea') || c.includes('korea')) return '🇰🇷';
  if (c.includes('china'))    return '🇨🇳';
  if (c.includes('canada'))   return '🇨🇦';
  if (c.includes('mexico'))   return '🇲🇽';
  if (c.includes('united kingdom') || c.includes('uk') || c.includes('england')) return '🇬🇧';
  if (c.includes('france'))   return '🇫🇷';
  if (c.includes('italy'))    return '🇮🇹';
  if (c.includes('sweden'))   return '🇸🇪';
  if (c.includes('australia')) return '🇦🇺';
  if (c.includes('india'))    return '🇮🇳';
  if (c.includes('brazil'))   return '🇧🇷';
  if (c.includes('spain'))    return '🇪🇸';
  if (c.includes('netherlands')) return '🇳🇱';
  if (c.includes('czech'))    return '🇨🇿';
  if (c.includes('slovakia')) return '🇸🇰';
  if (c.includes('hungary'))  return '🇭🇺';
  if (c.includes('austria'))  return '🇦🇹';
  if (c.includes('belgium'))  return '🇧🇪';
  if (c.includes('portugal')) return '🇵🇹';
  if (c.includes('turkey'))   return '🇹🇷';
  if (c.includes('russia'))   return '🇷🇺';
  if (c.includes('taiwan'))   return '🇹🇼';
  if (c.includes('thailand')) return '🇹🇭';
  if (c.includes('indonesia')) return '🇮🇩';
  if (c.includes('malaysia')) return '🇲🇾';
  if (c.includes('south africa')) return '🇿🇦';
  if (c.includes('argentina')) return '🇦🇷';
  return '🌐';
}

export function fuelTagClass(fuelType?: string): string {
  const f = (fuelType || '').toLowerCase();
  if (f.includes('electric') || f.includes('bev') || f.includes('ev')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (f.includes('hybrid') || f.includes('phev') || f.includes('hev')) return 'bg-teal-50 text-teal-700 border border-teal-200';
  if (f.includes('diesel') || f.includes('cng') || f.includes('lpg')) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-neutral-100 text-neutral-700 border border-neutral-200';
}

export function vehicleTitle(data: VehicleData): string {
  if (!data) return 'Unknown Vehicle';
  const parts = [data.year, data.make, data.model, data.trim].filter(Boolean);
  return parts.join(' ') || 'Unknown Vehicle';
}
