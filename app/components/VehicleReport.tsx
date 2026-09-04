'use client';

import React, { useEffect } from 'react';
import { parseReport } from './parseReport';
import ReportHeader from './ReportHeader';
import SpecCard, { type SpecItem } from './SpecCard';
import PdfExportButton from './PdfExportButton';

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function FactoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M6 18h.01M10 18h.01M14 18h.01M18 18h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

  // Real decoded fields only — missing values are dropped, not faked.
  const coreSpecs: SpecItem[] = [
    { label: 'Make',         value: data.make,        highlight: true  },
    { label: 'Model',        value: data.model,       highlight: true  },
    { label: 'Model Year',   value: data.year,        highlight: true  },
    { label: 'Body Style',   value: data.bodyClass,   highlight: false },
    { label: 'Series',       value: data.series,      highlight: false },
    { label: 'Trim',         value: data.trim,        highlight: false },
    { label: 'Vehicle Type', value: data.vehicleType, highlight: false },
    { label: 'Doors',        value: data.doors,       highlight: false },
  ].filter(i => Boolean(i.value));

  const engineSpecs: SpecItem[] = [
    { label: 'Engine Size',  value: data.engineDisplacement, highlight: true  },
    { label: 'Cylinders',    value: data.cylinders,          highlight: false },
    { label: 'Horsepower',   value: data.engineHP,           highlight: true  },
    { label: 'Fuel Type',    value: data.fuelType,           highlight: true  },
    { label: 'Drive Type',   value: data.driveType,          highlight: false },
    { label: 'Transmission', value: data.transmission,       highlight: false },
  ].filter(i => Boolean(i.value));

  const manufacturingSpecs: SpecItem[] = [
    { label: 'Assembly Plant', value: data.plant || [data.plantCity, data.plantState, data.plantCountry].filter(Boolean).join(', '), highlight: false },
    { label: 'Manufacturer',   value: data.manufacturerName, highlight: false },
  ].filter(i => Boolean(i.value));

  const disclaimer = data.extras?.['Market Value Disclaimer'];
  const hasRecords = Boolean(data.recallStatus || data.salvageLog);

  return (
    <div className="w-full">
      <section id="vehicle-report" className="w-full max-w-5xl mx-auto px-1 sm:px-4 pb-12 pt-2" aria-label="Vehicle Report">
        {/* Top Download Button */}
        <div className="flex justify-end mb-3 no-print">
          <PdfExportButton data={data} vin={vin} />
        </div>

        {/* Report body */}
        <div id="vehicle-report-content" className="flex flex-col gap-4 bg-card p-4 md:p-6 rounded-2xl border border-border">
          <ReportHeader data={data} vin={vin} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreSpecs.length > 0 && (
              <SpecCard title="Core Specs" icon={<LayersIcon />} items={coreSpecs} />
            )}
            {engineSpecs.length > 0 && (
              <SpecCard title="Engine & Drivetrain" icon={<ZapIcon />} items={engineSpecs} />
            )}
            {manufacturingSpecs.length > 0 && (
              <SpecCard title="Manufacturing" icon={<FactoryIcon />} items={manufacturingSpecs} />
            )}
          </div>

          {/* Records & safety — real NHTSA recall + web salvage index results only */}
          {hasRecords && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center gap-2.5 border-b border-border pb-3 mb-4">
                <span className="text-accent"><ShieldIcon /></span>
                <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-600">
                  Records &amp; Safety
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                {data.recallStatus && (
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-muted">NHTSA Recall Check</span>
                    <span className="text-sm text-foreground break-words">{data.recallStatus}</span>
                  </div>
                )}
                {data.salvageLog && (
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-muted">Public Salvage / Auction Index</span>
                    <span className="text-sm text-foreground whitespace-pre-line break-words">{data.salvageLog}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted text-center px-4 mt-1">
            Specifications decoded from the official NHTSA vPIC database. Recall status and
            salvage results are retrieved live from public records at lookup time.
          </p>
          {disclaimer && (
            <p className="text-[11px] text-muted text-center px-4">{disclaimer}</p>
          )}
        </div>

        {/* Download CTA — truthful copy; the PDF mirrors the verified data above */}
        <div className="mt-6 p-6 rounded-2xl bg-neutral-50 border border-border text-center flex flex-col items-center gap-4 no-print">
          <div className="max-w-xl">
            <h3 className="text-base font-semibold text-foreground mb-1">
              Save this report
            </h3>
            <p className="text-xs text-muted">
              Download a formatted PDF of the verified specifications and record checks above.
            </p>
          </div>
          <PdfExportButton data={data} vin={vin} variant="large" />
        </div>
      </section>
    </div>
  );
}
