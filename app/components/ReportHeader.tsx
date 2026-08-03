'use client';

import React from 'react';
import { type VehicleData, countryFlag, fuelTagClass, vehicleTitle } from './parseReport';

interface ReportHeaderProps {
  data: VehicleData;
  vin: string;
}

export default function ReportHeader({ data, vin }: ReportHeaderProps) {
  const title = vehicleTitle(data);
  const flag = countryFlag(data.plantCountry || data.plantState);
  const fuelClass = fuelTagClass(data.fuelType);

  return (
    <div className="glass-card p-6 md:p-8 relative overflow-hidden border-cyan-500/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge-verified">Verified VIN</span>
            {data.fuelType && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${fuelClass}`}>
                {data.fuelType}
              </span>
            )}
            {flag && <span className="text-lg" title={data.plantCountry}>{flag}</span>}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            {title}
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-2">
            VIN: <span className="text-cyan-400 font-bold">{vin || 'N/A'}</span>
          </p>
        </div>

        {data.manufacturerName && (
          <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Manufacturer</p>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">{data.manufacturerName}</p>
            {(data.plantCity || data.plantCountry) && (
              <p className="text-xs text-slate-400 mt-0.5">
                {[data.plantCity, data.plantState, data.plantCountry].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}