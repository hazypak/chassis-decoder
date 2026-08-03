'use client';

import React from 'react';

interface AdSlotProps {
  width: number;
  height: number;
  adKey: string;
  className?: string; // Fixes TypeScript error
}

export default function AdSlot({
  width,
  height,
  adKey,
  className = '',
}: AdSlotProps) {
  if (!adKey || adKey.includes('PASTE_')) return null;

  // Explicit https:// fixed here so iframe srcDoc can fetch the ad script
  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`flex flex-col items-center justify-center overflow-hidden my-3 w-full max-w-full ${className}`}>
      <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">
        Advertisement
      </div>
      <div className="max-w-full overflow-x-auto flex justify-center min-h-[90px]">
        <iframe
          srcDoc={adHtml}
          width={width}
          height={height}
          className="border-0 overflow-hidden max-w-full"
          scrolling="no"
          title="Advertisement"
        />
      </div>
    </div>
  );
}