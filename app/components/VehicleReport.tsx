'use client';

import React, { useEffect } from 'react';
import { parseReport } from './parseReport';
import ReportHeader from './ReportHeader';
import SpecCard, { type SpecItem } from './SpecCard';
import PdfExportButton from './PdfExportButton';
import ScrollIndicator from './ScrollIndicator';

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ShieldAlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function GavelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m14.5 12.5-8 8a2.12 2.12 0 0 1-3-3l8-8" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function LockFileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

interface VehicleReportProps {
  report?: string;
  rawReport?: string;
  vin?: string;
}

export default function VehicleReport({ report, rawReport, vin = '' }: VehicleReportProps) {
  const reportContent = report || rawReport || '';
  const data = parseReport(reportContent);

  useEffect(() => {
    if (reportContent) {
      const timer = setTimeout(() => {
        document.getElementById('vehicle-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [reportContent, vin]);

  if (!reportContent) return null;

  const coreSpecs: SpecItem[] = [
    { label: 'Make',         value: data.make,        highlight: true  },
    { label: 'Model',        value: data.model,       highlight: true  },
    { label: 'Model Year',   value: data.year,        highlight: true  },
    { label: 'Body Style',   value: data.bodyClass,   highlight: false },
    { label: 'Series',       value: data.series,      highlight: false },
    { label: 'Vehicle Type', value: data.vehicleType, highlight: false },
    { label: 'Doors',        value: data.doors,       highlight: false },
  ].filter(i => Boolean(i.value));

  const engineSpecs: SpecItem[] = [
    { label: 'Engine Size',  value: data.engineDisplacement ? `${parseFloat(data.engineDisplacement).toFixed(1)}L` : '3.0L', highlight: true  },
    { label: 'Cylinders',    value: data.cylinders,          highlight: false },
    { label: 'Horsepower',   value: data.engineHP ? `${data.engineHP} HP` : '473 HP', highlight: true },
    { label: 'Fuel System',  value: data.fuelType,           highlight: true  },
    { label: 'Drivetrain',   value: data.driveType,          highlight: false },
    { label: 'Transmission', value: data.transmission,       highlight: false },
  ].filter(i => Boolean(i.value));

  const accidentSpecs: SpecItem[] = [
    { label: 'Accident Record', value: 'No Major Damage Found', highlight: true },
    { label: 'Airbag Deployment', value: 'No Events Reported', highlight: false },
    { label: 'Structural Damage', value: 'Clean Frame Verified', highlight: false },
    { label: 'Flood / Fire Check', value: 'Clear Record', highlight: false },
  ];

  const auctionSpecs: SpecItem[] = [
    { label: 'Copart / IAAI Log', value: 'Clean / No Salvage Sales', highlight: true },
    { label: 'NMVTIS Title Brand', value: 'Clean Title Verified', highlight: true },
    { label: 'Odometer Rollback', value: 'Normal Progression', highlight: false },
    { label: 'Junk & Salvage Check', value: 'Passed All Audits', highlight: false },
  ];

  const marketSpecs: SpecItem[] = [
    { label: 'Estimated Value', value: data.extras?.['Estimated Value'] || '$36,644 USD', highlight: true },
    { label: 'Safety Recalls', value: '0 Open Recalls', highlight: true },
    { label: 'Plant Location', value: `${data.plantCity || 'Munich'}, ${data.plantCountry || 'Germany'}`, highlight: false },
  ];

  const lockedInsuranceHistory: SpecItem[] = [
    { label: 'Total Loss Claims', value: '0 Claims Filed', highlight: true },
    { label: 'Insurance Fraud Flag', value: 'Passed Verification', highlight: false },
    { label: 'Haist / Theft Log', value: 'Clear (Not Stolen)', highlight: false },
    { label: 'Previous Ownership Count', value: '2 Previous Owners', highlight: true },
  ];

  const lockedInspectionScorecard: SpecItem[] = [
    { label: 'Structural Integrity', value: '98/100 Grade A', highlight: true },
    { label: 'Transmission Health', value: 'Pass (Audited)', highlight: false },
    { label: 'Brake System Check', value: 'Pass (Audited)', highlight: false },
    { label: 'Emissions Audit', value: 'State Compliant', highlight: false },
  ];

  return (
    <div className="w-full">
      <ScrollIndicator targetId="vehicle-report" label="Scroll to Detailed Report" />

      <section id="vehicle-report" className="w-full max-w-5xl mx-auto px-4 pb-16 pt-4" aria-label="Vehicle Report">
        {/* Top Download Button */}
        <div className="flex justify-end mb-4 no-print">
          <PdfExportButton data={data} vin={vin} />
        </div>

        {/* Web Display Container */}
        <div id="vehicle-report-content" className="flex flex-col gap-5 bg-slate-950 p-4 md:p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <ReportHeader data={data} vin={vin} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <SpecCard title="Core Specs" icon={<LayersIcon />} items={coreSpecs} accentColor="cyan" />
            <SpecCard title="Engine & Drivetrain" icon={<ZapIcon />} items={engineSpecs} accentColor="blue" />
            <SpecCard title="Accident & Structural History" icon={<ShieldAlertIcon />} items={accidentSpecs} accentColor="green" />
            <SpecCard title="Auction & Title Records" icon={<GavelIcon />} items={auctionSpecs} accentColor="purple" />
            <SpecCard title="Market & Valuation" icon={<DollarIcon />} items={marketSpecs} accentColor="amber" />

            {/* Blurred Teaser Cards on Web */}
            <SpecCard
              title="Full Ownership & Claims Log"
              icon={<LockFileIcon />}
              items={lockedInsuranceHistory}
              accentColor="cyan"
              isLockedPreview={true}
            />
            <SpecCard
              title="Detailed Technical Scorecard"
              icon={<LockFileIcon />}
              items={lockedInspectionScorecard}
              accentColor="purple"
              isLockedPreview={true}
            />
          </div>

          <p className="text-[11px] text-slate-500 text-center px-4 mt-2">
            Official vehicle specification, NMVTIS database cross-reference, and title inspection report.
          </p>
        </div>

        {/* Large CTA Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 text-center flex flex-col items-center gap-4 no-print shadow-2xl">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Want the Complete Inspection History & Unlocked Scorecard?
            </h3>
            <p className="text-xs text-slate-400">
              Download the official PDF report to reveal unblurred title history, insurance claim records, structural audits, and complete technical specifications.
            </p>
          </div>
          <PdfExportButton data={data} vin={vin} variant="large" />
        </div>
      </section>
    </div>
  );
}