'use client';

import { useState, useRef } from 'react';
import VinHero from './components/VinHero';
import VehicleReport from './components/VehicleReport';
import AdSlot from './components/AdSlot';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

// CAPTCHA only kicks in when a site key is configured, so the app still works
// in dev / preview without one.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Home() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVin, setCurrentVin] = useState('');

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleDecode = async (vin: string) => {
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the security check before decoding.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setCurrentVin(vin);

    try {
      const res = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to decode VIN.');
      } else {
        setReport(data.report);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
      // Turnstile tokens are single-use, so reset for the next lookup.
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-6 md:py-10 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        <AdSlot width={728} height={90} className="hidden md:flex" />
        <AdSlot width={300} height={250} className="flex md:hidden" />

        <VinHero onDecode={handleDecode} loading={loading} />

        {TURNSTILE_SITE_KEY && (
          <div className="flex justify-center items-center my-4 min-h-[65px]">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center font-medium text-sm">
            {error}
          </div>
        )}

        {report && <VehicleReport rawReport={report} vin={currentVin} />}

        <AdSlot width={728} height={90} className="hidden md:flex" />
        <AdSlot width={300} height={250} className="flex md:hidden" />
      </div>
    </main>
  );
}
