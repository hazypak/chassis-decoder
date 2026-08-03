/**
 * parseReport.ts
 *
 * Parses the Markdown / plain-text report string returned by /api/decode
 * into a structured VehicleData object.
 *
 * The parser is intentionally flexible — it handles multiple common formats:
 *   - "**Key:** Value"          (bold Markdown key)
 *   - "Key: Value"              (plain key-value)
 *   - "| Key | Value |"         (Markdown table row)
 *   - "- **Key:** Value"        (list item with bold key)
 *
 * Any field not recognised is placed in `extras` for graceful fallback rendering.
 */

export interface VehicleData {
  // Header / identity
  make: string;
  model: string;
  year: string;
  trim: string;
  series: string;
  bodyClass: string;
  vehicleType: string;

  // Engine & drivetrain
  engineDisplacement: string;
  cylinders: string;
  engineHP: string;
  fuelType: string;
  driveType: string;
  transmission: string;

  // Manufacturing
  plantCity: string;
  plantCountry: string;
  plantState: string;
  manufacturerName: string;

  // Safety / misc
  doors: string;
  seatBelts: string;
  abs: string;
  airBags: string;

  // Raw extras for any unrecognised fields
  extras: Record<string, string>;
}

// ── Field alias map ────────────────────────────────────────────
// Maps normalised lowercase keys → VehicleData field names.
const FIELD_MAP: Record<string, keyof Omit<VehicleData, 'extras'>> = {
  // Make
  'make': 'make',
  'manufacturer': 'make',

  // Model
  'model': 'model',
  'model year': 'year',

  // Year
  'year': 'year',
  'model year (decoded)': 'year',

  // Trim / Series
  'trim': 'trim',
  'trim level': 'trim',
  'series': 'series',
  'series (decoded)': 'series',

  // Body
  'body class': 'bodyClass',
  'body style': 'bodyClass',
  'body type': 'bodyClass',
  'vehicle type': 'vehicleType',

  // Engine
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

  // Fuel
  'fuel type - primary': 'fuelType',
  'fuel type': 'fuelType',
  'fuel type (primary)': 'fuelType',
  'electrification level': 'fuelType',

  // Drive
  'drive type': 'driveType',
  'drive wheel codes': 'driveType',

  // Transmission
  'transmission style': 'transmission',
  'transmission': 'transmission',

  // Manufacturing
  'plant city': 'plantCity',
  'plant country': 'plantCountry',
  'plant state': 'plantState',
  'manufacturer name': 'manufacturerName',

  // Safety
  'doors': 'doors',
  'number of doors': 'doors',
  'seat belts type': 'seatBelts',
  'abs': 'abs',
  'anti-lock braking system (abs)': 'abs',
  'air bag loc front': 'airBags',
  'air bags': 'airBags',
};

// ── Normalise a raw key string ─────────────────────────────────
function normalise(raw: string): string {
  return raw
    .replace(/\*\*/g, '')        // strip Markdown bold markers
    .replace(/[_`]/g, '')        // strip other Markdown
    .replace(/\s+/g, ' ')        // collapse whitespace
    .trim()
    .toLowerCase();
}

// ── Strip Markdown formatting from a value ─────────────────────
function cleanValue(raw: string): string {
  return raw
    .replace(/\*\*/g, '')
    .replace(/[_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) → text
    .trim();
}

// ── Main parser ────────────────────────────────────────────────
export function parseReport(report?: string): VehicleData {
  const data: VehicleData = {
    make: '', model: '', year: '', trim: '', series: '', bodyClass: '', vehicleType: '',
    engineDisplacement: '', cylinders: '', engineHP: '', fuelType: '', driveType: '', transmission: '',
    plantCity: '', plantCountry: '', plantState: '', manufacturerName: '',
    doors: '', seatBelts: '', abs: '', airBags: '',
    extras: {},
  };

  // Safe split check: prevent undefined.split() runtime errors
  const safeReport = report || '';
  const lines = safeReport.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    let rawKey = '';
    let rawValue = '';

    // ── Markdown table row: | Key | Value | ──────────────────
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2 && !cells[0].match(/^[-:]+$/)) {
        rawKey   = cells[0];
        rawValue = cells[1];
      }
    }
    // ── Key: Value (with optional leading list marker / bold) ──
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
      // Only set if not already populated (first match wins)
      if (!data[fieldName]) {
      (data as unknown as Record<string, string>)[fieldName] = value;
      }
    } else {
      // Store in extras with cleaned key
      const prettyKey = rawKey.replace(/\*\*/g, '').trim();
      if (prettyKey && !data.extras[prettyKey]) {
        data.extras[prettyKey] = value;
      }
    }
  }

  return data;
}

// ── Derived helpers ────────────────────────────────────────────

/** Returns a country flag emoji for a given country name. */
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

/** Returns a CSS class name for the fuel type tag. */
export function fuelTagClass(fuelType?: string): string {
  const f = (fuelType || '').toLowerCase();
  if (f.includes('electric') || f.includes('bev') || f.includes('ev')) return 'tag-fuel-ev';
  if (f.includes('hybrid') || f.includes('phev') || f.includes('hev')) return 'tag-fuel-hybrid';
  if (f.includes('diesel') || f.includes('cng') || f.includes('lpg')) return 'tag-fuel-diesel';
  return 'tag-fuel-gas';
}

/** Returns a human-readable vehicle title. */
export function vehicleTitle(data: VehicleData): string {
  if (!data) return 'Unknown Vehicle';
  const parts = [data.year, data.make, data.model, data.trim].filter(Boolean);
  return parts.join(' ') || 'Unknown Vehicle';
}