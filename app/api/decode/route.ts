import { NextResponse } from 'next/server';

// Validates the VIN's 9th-position check digit per ISO 3779.
function isValidVINChecksum(vin: string): boolean {
  if (vin.length !== 17) return false;
  if (/[IOQ]/i.test(vin)) return false; // I, O and Q are never valid in a VIN

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const transliteration: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
    '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  };

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i].toUpperCase();
    const val = transliteration[char];
    if (val === undefined) return false;
    sum += val * weights[i];
  }

  const remainder = sum % 11;
  const expectedCheckDigit = remainder === 10 ? 'X' : remainder.toString();
  return vin[8].toUpperCase() === expectedCheckDigit;
}

// Accepts a single key or a comma-separated list.
const parseApiKeys = (envVar?: string): string[] => {
  if (!envVar) return [];
  return envVar
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
};

const rawGroq = process.env.GROQ_API_KEYS || [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_FALLBACK].filter(Boolean).join(',');
const GROQ_API_KEYS = parseApiKeys(rawGroq);

const rawSerper = process.env.SERPER_API_KEYS || process.env.SERPER_API_KEY;
const SERPER_API_KEYS = parseApiKeys(rawSerper);

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { vin, turnstileToken } = await request.json();

    // Verify the Turnstile token, but only if a secret is configured.
    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'CAPTCHA verification missing. Please complete the security check.' },
          { status: 400 }
        );
      }

      const turnstileRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        }
      );

      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        return NextResponse.json(
          { error: 'Security check failed. Automated bot traffic detected.' },
          { status: 403 }
        );
      }
    }

    if (!vin || typeof vin !== 'string' || vin.trim().length !== 17) {
      return NextResponse.json(
        { error: 'Invalid VIN. Please provide a valid 17-character VIN.' },
        { status: 400 }
      );
    }

    const cleanVin = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    if (cleanVin.length !== 17) {
      return NextResponse.json(
        { error: 'Invalid VIN syntax. ISO standard VINs cannot contain letters I, O, or Q.' },
        { status: 400 }
      );
    }

    if (!isValidVINChecksum(cleanVin)) {
      return NextResponse.json(
        { error: 'Invalid VIN Checksum: This VIN is mathematically invalid or mistyped. Please double-check your input.' },
        { status: 400 }
      );
    }

    // Decode the VIN against NHTSA's vPIC database.
    const nhtsaRes = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${cleanVin}?format=json`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );

    if (!nhtsaRes.ok) {
      throw new Error(`NHTSA API responded with status ${nhtsaRes.status}`);
    }

    const nhtsaData = await nhtsaRes.json();
    const results = nhtsaData.Results?.[0] || {};

    // Check for open recalls.
    let recallStatus = 'No open safety recalls found';
    try {
      const recallRes = await fetch(
        `https://api.nhtsa.gov/recalls/recallsByVin/${cleanVin}?format=json`,
        { headers: { Accept: 'application/json' }, cache: 'no-store' }
      );

      if (recallRes.ok) {
        const recallData = await recallRes.json();
        const count = recallData.count || recallData.results?.length || 0;
        if (count > 0) {
          recallStatus = `${count} open safety recall(s) on record`;
        }
      }
    } catch {
      recallStatus = 'Recall database unavailable';
    }

    // Optional: look up public salvage/auction records via Serper.
    let webAuctionResults: string[] = [];
    if (SERPER_API_KEYS.length > 0) {
      const searchQuery = `"${cleanVin}" salvage OR accident OR auction OR copart OR iaai OR bidfax`;

      for (const apiKey of SERPER_API_KEYS) {
        try {
          const searchRes = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: searchQuery, num: 5 }),
          });

          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const hits = searchData.organic || [];
            if (hits.length > 0) {
              webAuctionResults = hits
                .slice(0, 3)
                .map(
                  (item: { title: string; snippet: string; link: string }) =>
                    `Record found on ${new URL(item.link).hostname}: "${item.title}" - ${item.snippet} (${item.link})`
                );
            }
            break;
          }
        } catch {
          // try the next key
        }
      }
    }

    const make = results.Make || 'N/A';
    const model = results.Model || 'N/A';
    const year = results.ModelYear || 'N/A';

    const plantLocation =
      [results.PlantCity, results.PlantState, results.PlantCountry]
        .filter(Boolean)
        .join(', ') || 'N/A';

    const formattedFields: Record<string, string> = {
      'Make': make,
      'Model': model,
      'Model Year': year,
      'Body Style': results.BodyClass || 'N/A',
      'Vehicle Type': results.VehicleType || 'N/A',
      'Trim': results.Trim || 'N/A',
      'Series': results.Series || 'N/A',
      'Displacement (L)': results.DisplacementL ? `${results.DisplacementL}L` : 'N/A',
      'Engine HP': results.EngineHP ? `${results.EngineHP} HP` : 'N/A',
      'Cylinders': results.EngineConfiguration || results.EngineCylinders || 'N/A',
      'Fuel Type': results.FuelTypePrimary || 'N/A',
      'Drive Type': results.DriveType || 'N/A',
      'Transmission': results.TransmissionStyle || 'N/A',
      'Manufacturer': results.Manufacturer || 'N/A',
      'Factory Assembly Plant': plantLocation,
      'Doors': results.Doors || 'N/A',
      'Official NHTSA Recall Status': recallStatus,
      'Copart / IAAI Log':
        webAuctionResults.length > 0
          ? webAuctionResults.join('\n')
          : 'No Web-Indexed Public Salvage Records Found',
      'Market Value Disclaimer':
        'Resale values vary significantly based on vehicle mileage, title status, and physical condition. Consult live regional market listings for accurate pricing.',
    };

    let markdownReport = `### Vehicle Detailed Specification & History Report\n\n`;
    for (const [key, val] of Object.entries(formattedFields)) {
      if (val) {
        markdownReport += `**${key}:** ${val}\n`;
      }
    }

    // Optional: let Groq normalise the markdown formatting.
    if (GROQ_API_KEYS.length > 0) {
      for (const apiKey of GROQ_API_KEYS) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: `You are a strict automotive data formatting proxy. Convert the provided raw vehicle specs into clean Markdown.

STRICT ACCURACY INSTRUCTIONS:
- DO NOT invent dollar values, price estimates, or damage guarantees.
- Preserve all URLs provided in "Copart / IAAI Log".
- Keep EVERY single key provided in the payload (including Doors, Trim, Cylinders, Transmission, and Disclaimers).
- Format fields strictly as bold title key-value pairs: "**Key:** Value".`,
                },
                {
                  role: 'user',
                  content: `Reformat and structure this vehicle report:\n${markdownReport}`,
                },
              ],
              temperature: 0,
            }),
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const aiContent = groqData.choices?.[0]?.message?.content;
            if (aiContent) {
              markdownReport = aiContent;
              break; 
            }
          }
        } catch {
          // try the next key
        }
      }
    }

    return NextResponse.json({ report: markdownReport });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to decode VIN';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}