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
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 md:py-12 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        {/* Top Ad Slot */}
        <AdSlot id="ad-slot-top" />

        {/* Hero Input Section */}
        <VinHero onDecode={handleDecode} isLoading={loading} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-xl text-center font-medium shadow-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Middle In-Feed Ad Slot */}
        <AdSlot id="ad-slot-middle" />

        {/* Render Vehicle Report */}
        {report && (
          <VehicleReport rawReport={report} vin={currentVin} />
        )}

        {/* Bottom Sticky Ad Slot */}
        <AdSlot id="ad-slot-bottom" sticky />
      </div>

      {/* Anti-Adblock Modal Detector */}
      <AdBlockModal />
    </main>
  );
}