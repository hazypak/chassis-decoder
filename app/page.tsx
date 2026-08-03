'use client';

import React, { useState } from 'react';
import VinHero from './components/VinHero';
import VehicleReport from './components/VehicleReport';
import AdSlot from './components/AdSlot';
import AdBlockModal from './components/AdBlockModal';

export default function Home() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVin, setCurrentVin] = useState<string>('');

  // Adsterra Banner Keys
  const DESKTOP_BANNER_KEY = '1dd64051e9d639d812a0e21d0c1c421f'; // 728x90
  const MOBILE_BANNER_KEY  = '3f22827be29f8731c42231da442b0b56'; // 300x250

  const handleDecode = async (vin: string) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setCurrentVin(vin);

    try {
      const res = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to decode VIN.');
      } else {
        setReport(data.report);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
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