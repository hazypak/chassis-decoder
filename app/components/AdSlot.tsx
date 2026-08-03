'use client';

import React, { useEffect, useRef } from 'react';

interface AdSlotProps {
  id: string;
  sticky?: boolean;
}

export default function AdSlot({ id, sticky = false }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Clear previous contents on re-render
    adRef.current.innerHTML = '';

    const container = adRef.current;

    // 1. Configure options
    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.text = `
      atOptions = {
        'key' : '1dd64051e9d639d812a0e21d0c1c421f',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    // 2. Invoke script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = '//www.highperformanceformat.com/1dd64051e9d639d812a0e21d0c1c421f/invoke.js';

    container.appendChild(confScript);
    container.appendChild(invokeScript);
  }, []);

  return (
    <div
      className={`
        w-full flex flex-col items-center justify-center my-4 overflow-hidden
        ${sticky ? 'sticky bottom-0 z-50 bg-slate-950/90 backdrop-blur-md py-2 border-t border-slate-800' : ''}
      `}
    >
      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
        Advertisement
      </div>
      <div
        ref={adRef}
        id={id}
        className="min-h-[90px] min-w-[300px] md:min-w-[728px] flex items-center justify-center rounded-lg"
      />
    </div>
  );
}