import { NextResponse } from 'next/server';

const parseApiKeys = (envVar?: string): string[] => {
  if (!envVar) return [];
  return envVar.split(',').map((key) => key.trim()).filter(Boolean);
};

const rawGroq = process.env.GROQ_API_KEYS || [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_FALLBACK].filter(Boolean).join(',');
const GROQ_API_KEYS = parseApiKeys(rawGroq);

const rawSerper = process.env.SERPER_API_KEYS || process.env.SERPER_API_KEY;
const SERPER_API_KEYS = parseApiKeys(rawSerper);

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { vin, turnstileToken } = await request.json();

    // ── 1. CAPTCHA VERIFICATION ──
    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return NextResponse.json({ error: 'Security check missing. Please complete the CAPTCHA.' }, { status: 400 });
      }
      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: turnstileToken }),
      });
      const turnstileData = await turnstileRes.json();
      if (!turnstileData.success) {
        return NextResponse.json({ error: 'Security check failed. Automated bot traffic detected.' }, { status: 403 });
      }
    }

    // ── 2. VALIDATE VIN ──
    if (!vin || typeof vin !== 'string' || vin.trim().length !== 17) {
      return NextResponse.json({ error: 'Invalid VIN. Please provide a valid 17-character VIN.' }, { status: 400 });
    }
    const cleanVin = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    // ── 3. NHTSA API ──
    const nhtsaRes = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${cleanVin}?format=json`, { cache: 'no-store' });
    if (!nhtsaRes.ok) throw new Error(`NHTSA API responded with status ${nhtsaRes.status}`);
    const nhtsaData = await nhtsaRes.json();
    const results = nhtsaData.Results?.[0] || {};

    // ── 4. MULTI-KEY SERPER WEB SEARCH WITH DIAGNOSTICS ──
    let webAuctionResults: string[] = [];
    let serperDebugLog = "Serper search did not run.";

    if (SERPER_API_KEYS.length === 0) {
      serperDebugLog = "❌ FAILED: No Serper API Keys found in environment variables. Check Vercel settings.";
    } else {
      const searchQuery = `"${cleanVin}" salvage OR accident OR auction OR copart OR iaai OR bidfax`;
      serperDebugLog = `🔍 Attempting search with ${SERPER_API_KEYS.length} key(s)...`;

      for (const apiKey of SERPER_API_KEYS) {
        try {
          const searchRes = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: searchQuery, num: 5 }),
          });

          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const hits = searchData.organic || [];
            
            serperDebugLog = `✅ SUCCESS: Serper API connected. Found ${hits.length} Google search results.`;

            if (hits.length > 0) {
              webAuctionResults = hits.slice(0, 3).map((item: { title: string; snippet: string; link: string }) =>
                `• **${item.title}**: ${item.snippet} ([View Listing](${item.link}))`
              );
            }
            break;
          } else {
            const errorText = await searchRes.text();
            serperDebugLog = `❌ FAILED: Serper API responded with HTTP ${searchRes.status} - ${errorText}`;
          }
        } catch (err: any) {
          serperDebugLog = `❌ FAILED: Network error connecting to Serper - ${err.message}`;
        }
      }
    }

    // ── 5. BUILD BASE DATA PAYLOAD ──
    const formattedFields: Record<string, string> = {
      'Make': results.Make || 'N/A',
      'Model': results.Model || 'N/A',
      'Model Year': results.ModelYear || 'N/A',
      'Engine HP': results.EngineHP ? `${results.EngineHP} HP` : 'N/A',
      'Auction & Salvage Web Check': webAuctionResults.length > 0
          ? `Potential Public Records Found Online:\n${webAuctionResults.join('\n')}`
          : 'No public salvage auction records detected via search index',
    };

    let markdownReport = `### Vehicle Detailed Specification & History Report\n\n`;
    for (const [key, val] of Object.entries(formattedFields)) {
      if (val) markdownReport += `**${key}:** ${val}\n`;
    }

    // ── 6. MULTI-KEY GROQ AI FORMATTING ──
    if (GROQ_API_KEYS.length > 0) {
      for (const apiKey of GROQ_API_KEYS) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert automotive inspection engineer. Reformat the provided vehicle specs and search data into clean Markdown. Do NOT remove any auction links.`,
                },
                { role: 'user', content: `Reformat and structure this vehicle report:\n${markdownReport}` },
              ],
              temperature: 0.1,
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
        } catch { /* Move to next key */ }
      }
    }

    // ── 7. APPEND DIAGNOSTICS TO FINAL RENDER ──
    // This bypasses Groq so the AI cannot accidentally delete your debug logs.
    const finalRender = `${markdownReport}\n\n---\n### 🔧 System Diagnostic Logs\n**Serper API Status:** ${serperDebugLog}`;

    return NextResponse.json({ report: finalRender });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to decode VIN' }, { status: 500 });
  }
}