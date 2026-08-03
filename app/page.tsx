'use client';

import React, { useState, useRef } from 'react';
import VinHero from './components/VinHero';
import VehicleReport from './components/VehicleReport';
import AdSlot from './components/AdSlot';
import AdBlockModal from './components/AdBlockModal';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

export default function Home() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVin, setCurrentVin] = useState<string>('');
  
  // Track Turnstile Token and Ref for auto-resetting single-use tokens
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Adsterra Banner Keys
  const DESKTOP_BANNER_KEY = '1dd64051e9d639d812a0e21d0c1c421f'; // 728x90
  const MOBILE_BANNER_KEY  = '3f22827be29f8731c42231da442b0b56'; // 300x250

  const handleDecode = async (vin: string) => {
    // 1. Prevent submission if CAPTCHA isn't solved
    if (!turnstileToken) {
      setError('Please complete the security check (CAPTCHA) before decoding.');
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
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
      
      // CRITICAL FIX: Cloudflare Turnstile tokens expire upon first verification.
      // Reset widget so the user can perform another decode without reloading.
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 md:py-10 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* ── TOP BANNER ── */}
        <AdSlot width={728} height={90} adKey={DESKTOP_BANNER_KEY} className="hidden md:flex" />
        <AdSlot width={300} height={250} adKey={MOBILE_BANNER_KEY} className="flex md:hidden" />

        {/* VIN Search Hero */}
        <VinHero onDecode={handleDecode} loading={loading} />

        {/* ── CLOUDFLARE TURNSTILE WIDGET ── */}
        <div className="flex justify-center my-4">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-xl text-center font-medium shadow-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Vehicle Specs Output */}
        {report && (
          <VehicleReport rawReport={report} vin={currentVin} />
        )}

        {/* ── BOTTOM BANNER ── */}
        <AdSlot width={728} height={90} adKey={DESKTOP_BANNER_KEY} className="hidden md:flex" />
        <AdSlot width={300} height={250} adKey={MOBILE_BANNER_KEY} className="flex md:hidden" />

      </div>

      {/* Adblock Guard */}
      <AdBlockModal />
    </main>
  );
}