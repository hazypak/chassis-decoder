'use client';

import React, { useEffect, useRef } from 'react';

export default function NativeAdSlot() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset container contents to prevent duplicate scripts on route changes
    containerRef.current.innerHTML = '';

    // 1. Create target div required by Adsterra
    const targetDiv = document.createElement('div');
    targetDiv.id = 'container-9620ddf71c44ba853eeda9040e3dad30';

    // 2. Create the script element
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl30666227.effectivecpmnetwork.com/9620ddf71c44ba853eeda9040e3dad30/invoke.js';

    // Append both to wrapper
    containerRef.current.appendChild(targetDiv);
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-6">
      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
        Sponsored Content
      </div>
      <div 
        ref={containerRef} 
        className="w-full max-w-3xl min-h-[120px] bg-slate-900/30 rounded-xl border border-slate-800/50 p-2 flex items-center justify-center"
      />
    </div>
  );
}