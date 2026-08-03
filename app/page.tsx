'use client';

import React, { useState } from 'react';
import VinHero from './components/VinHero';
import VehicleReport from './components/VehicleReport';
import AdSlot from './components/AdSlot';
import NativeAdSlot from './components/NativeAdSlot';
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
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 md:py-10 flex flex-col items-center relative">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* 1. Top Leaderboard Banner (728x90) */}
        <AdSlot width={728} height={90} adKey="1dd64051e9d639d812a0e21d0c1c421f" />

        {/* Hero VIN Search Section */}
        <VinHero onDecode={handleDecode} loading={loading} />

        {/* Error Notification */}
        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-xl text-center font-medium shadow-lg">
            ⚠️ {error}
          </div>
        )}

        {/* 2. Middle Native Banner Ad */}
        <NativeAdSlot />

        {/* Render Vehicle Report */}
        {report && (
          <VehicleReport rawReport={report} vin={currentVin} />
        )}
      </div>

      {/* Anti-Adblock Detector Modal */}
      <AdBlockModal />
    </main>
  );
}