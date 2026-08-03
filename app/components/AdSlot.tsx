'use client';

import React from 'react';

interface AdSlotProps {
  sticky?: boolean;
  width?: number;
  height?: number;
  adKey?: string;
}

export default function AdSlot({
  sticky = false,
  width = 728,
  height = 90,
  adKey = '1dd64051e9d639d812a0e21d0c1c421f',
}: AdSlotProps) {
  // Isolated HTML shell so global atOptions variables don't overwrite each other
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
        <script type="text/javascript" src="//www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

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
      <iframe
        srcDoc={adHtml}
        width={width}
        height={height}
        className="border-0 overflow-hidden"
        scrolling="no"
        title="Advertisement"
      />
    </div>
  );
}