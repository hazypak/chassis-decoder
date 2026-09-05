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
}

export default function SpecCard({ title, icon, items }: SpecCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center gap-2.5 border-b border-border pb-3 mb-4">
        <span className="text-accent">{icon}</span>
        <h3 className="text-xs font-semibold tracking-wider uppercase text-neutral-600">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-muted">{item.label}</span>
            <span className={`text-sm leading-snug break-words ${item.highlight ? 'text-foreground font-semibold' : 'text-neutral-700'}`}>
              {item.value || 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
