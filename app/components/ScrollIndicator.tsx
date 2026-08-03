'use client';

import React, { useState } from 'react';

interface ScrollIndicatorProps {
  targetId: string;
  label?: string;
}

export default function ScrollIndicator({ targetId, label = 'Scroll to Detailed Report' }: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClick = () => {
    setIsVisible(false); // Hides the arrow as soon as it's clicked
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-6 no-print animate-bounce">
      <button
        onClick={handleClick}
        className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-900/90 border border-cyan-500/50 text-cyan-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-400 shadow-xl shadow-cyan-950/60 backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 cursor-pointer"
        aria-label={label}
      >
        <span className="text-xs font-bold tracking-wider uppercase">{label}</span>
        <svg
          className="w-4 h-4 transition-transform group-hover:translate-y-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  );
}