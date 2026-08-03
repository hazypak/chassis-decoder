import { NextResponse } from 'next/server';

// Helper to safely parse single or comma-separated API keys from environment variables
const parseApiKeys = (envVar?: string): string[] => {
  if (!envVar) return [];
  return envVar
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
};

// Extracts multiple Groq & Serper keys (supports comma-separated values or legacy variables)
const rawGroq = process.env.GROQ_API_KEYS || [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_FALLBACK].filter(Boolean).join(',');
const GROQ_API_KEYS = parseApiKeys(rawGroq);

const rawSerper = process.env.SERPER_API_KEYS || process.env.SERPER_API_KEY;
const SERPER_API_KEYS = parseApiKeys(rawSerper);

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { vin, turnstileToken } = await request.json();

    // ── 1. CLOUDFLARE TURNSTILE CAPTCHA VERIFICATION ──
    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Security check missing. Please complete the CAPTCHA.' },
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

    // ── 2. VALIDATE VIN INPUT & SYNTAX ──
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

    // ── 3. FETCH OFFICIAL SPECS FROM NHTSA VPIC API ──
    const nhtsaRes = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${cleanVin}?format=json`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );

    if (!nhtsaRes.ok) {
      throw new Error(`NHTSA API responded with status ${nhtsaRes.status}`);
    }

    const nhtsaData = await nhtsaRes.json();
    const results = nhtsaData.Results?.[0] || {};

    // ── 4. FETCH LIVE RECALLS FROM NHTSA API ──
    let recallStatus = 'Check Complete: No Open Safety Recalls Identified';
    try {
      const recallRes = await fetch(
        `https://api.nhtsa.gov/recalls/recallsByVin/${cleanVin}?format=json`,
        { headers: { Accept: 'application/json' }, cache: 'no-store' }
      );

      if (recallRes.ok) {
        const recallData = await recallRes.json();
        const count = recallData.count || recallData.results?.length || 0;
        if (count > 0) {
          recallStatus = `⚠️ ${count} Open Safety Recall(s) Found on Record`;
        }
      }
    } catch {
      recallStatus = 'NHTSA Recall Database Temporarily Unavailable';
    }

    // ── 5. MULTI-KEY SERPER WEB SEARCH FALLBACK LOOP ──
    let webAuctionResults: string[] = [];
    if (SERPER_API_KEYS.length > 0) {
      // Optimized query to accurately find public salvage/auction listings
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
                    `• **${item.title}**: ${item.snippet} ([View Listing](${item.link}))`
                );
            }
            break; // Exit loop on first working key
          }
        } catch {
          // Automatic fallback to next key if fetch fails
        }
      }
    }

    // ── 6. BUILD BASE DATA PAYLOAD ──
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
      'Auction & Salvage Web Check':
        webAuctionResults.length > 0
          ? `Potential Public Records Found Online:\n${webAuctionResults.join('\n')}`
          : 'No public salvage auction records detected via search index',
      'Market Value Disclaimer':
        'Resale values vary significantly based on vehicle mileage, title status, and physical condition. Consult live regional market listings for accurate pricing.',
    };

    let markdownReport = `### Vehicle Detailed Specification & History Report\n\n`;
    for (const [key, val] of Object.entries(formattedFields)) {
      if (val) {
        markdownReport += `**${key}:** ${val}\n`;
      }
    }

    // ── 7. MULTI-KEY GROQ AI FORMATTING LOOP ──
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
                  content: `You are an expert automotive inspection engineer. Reformat the provided vehicle specs and search data into clean Markdown.

CRITICAL ACCURACY & FORMATTING INSTRUCTIONS:
- You MUST preserve all links and snippets provided under "Auction & Salvage Web Check".
- If "Auction & Salvage Web Check" contains web results, create a dedicated section titled "### 🔍 Online Salvage & Auction Records Found" and output the exact markdown links and snippets provided.
- Do NOT make up specific dollar prices or fake accident guarantees.
- Ensure "Factory Assembly Plant" is clearly stated as where the vehicle was originally manufactured.
- Format fields into clean bold key-value pairs e.g. "**Make:** Ford".`,
                },
                {
                  role: 'user',
                  content: `Reformat and structure this vehicle report:\n${markdownReport}`,
                },
              ],
              temperature: 0.1,
            }),
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const aiContent = groqData.choices?.[0]?.message?.content;
            if (aiContent) {
              markdownReport = aiContent;
              break; // Exit loop on successful response
            }
          }
        } catch {
          // Automatic fallback to next Groq key if rate-limited
        }
      }
    }

    return NextResponse.json({ report: markdownReport });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to decode VIN';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}