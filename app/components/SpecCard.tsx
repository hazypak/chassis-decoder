'use client';

import React from 'react';

export interface SpecItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SpecCardProps {
  title: string;
  icon: React.ReactNode;
  items: SpecItem[];
  accentColor?: 'cyan' | 'blue' | 'purple' | 'green' | 'amber';
  isLockedPreview?: boolean;
}

export default function SpecCard({
  title,
  icon,
  items,
  accentColor = 'cyan',
  isLockedPreview = false,
}: SpecCardProps) {
  const borderAccents = {
    cyan: 'border-cyan-500/30 group-hover:border-cyan-500/60',
    blue: 'border-blue-500/30 group-hover:border-blue-500/60',
    purple: 'border-purple-500/30 group-hover:border-purple-500/60',
    green: 'border-emerald-500/30 group-hover:border-emerald-500/60',
    amber: 'border-amber-500/30 group-hover:border-amber-500/60',
  };

  const textAccents = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`group relative rounded-2xl bg-slate-900/80 border ${borderAccents[accentColor]} p-5 backdrop-blur-md transition-all duration-300 shadow-xl overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3 mb-4">
        <span className={textAccents[accentColor]}>{icon}</span>
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">{title}</h3>
      </div>

      {/* Grid Content with full text-wrapping (NO CUT-OFFS) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 ${isLockedPreview ? 'pdf-unlock-blur filter blur-[4px] select-none opacity-40' : ''}`}>
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-slate-400">{item.label}</span>
            <span className={`text-xs font-semibold leading-snug break-words ${item.highlight ? 'text-slate-100 font-bold' : 'text-slate-300'}`}>
              {item.value || 'N/A'}
            </span>
          </div>
        ))}
      </div>

      {/* Locked Teaser Overlay */}
      {isLockedPreview && (
        <div className="pdf-hide-overlay absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/70 backdrop-blur-[2px]">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2 mb-1.5">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide">Included in Full PDF</span>
          </div>
          <span className="text-[10px] text-slate-400 text-center">Click Download below to unlock full report details</span>
        </div>
      )}
    </div>
  );
}