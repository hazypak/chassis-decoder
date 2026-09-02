'use client';

import React, { useState } from 'react';
import type { VehicleData } from './parseReport';

// --------------------------------------------------------------------------
// MONETIZATION: Your Active Adsterra Smartlink / Direct Link
// --------------------------------------------------------------------------
const AD_REDIRECT_URL = 'https://www.effectivecpmnetwork.com/hveqs89m?key=a849ea2b58bdb362d84b129feda796de';

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
         className="animate-spin">
      <line x1="12" y1="2"  x2="12" y2="6"  />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93"   x2="7.76" y2="7.76"   />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6"  y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76"  y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"  />
    </svg>
  );
}

interface PdfExportButtonProps {
  data: VehicleData;
  vin: string;
  variant?: 'default' | 'large';
}

export default function PdfExportButton({
  data,
  vin,
  variant = 'default',
}: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateNativeVectorPdf() {
    if (isGenerating) return;

    // 1. Trigger Monetization Ad Link in a new browser tab
    if (AD_REDIRECT_URL) {
      try {
        window.open(AD_REDIRECT_URL, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Ad pop-up blocked:', e);
      }
    }

    setIsGenerating(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const PAGE_W = 210;
      const MARGIN = 14;
      const CONTENT_W = PAGE_W - MARGIN * 2;
      let y = MARGIN;

      // --- BRAND HEADER ---
      doc.setFillColor(15, 23, 42); // Dark navy header band
      doc.rect(0, 0, PAGE_W, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('VEHICLE SPECIFICATION REPORT', MARGIN, 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`VIN: ${vin || 'UNKNOWN'}`, MARGIN, 18);

      y = 32;

      // --- VEHICLE TITLE SUMMARY ---
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(MARGIN, y, CONTENT_W, 20, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      const title = [data.year, data.make, data.model].filter(Boolean).join(' ').trim() || 'Vehicle Report';
      doc.text(title.toUpperCase(), MARGIN + 5, y + 9);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const subParts = [
        data.bodyClass && `Body: ${data.bodyClass}`,
        data.fuelType && `Fuel: ${data.fuelType}`,
        data.driveType && `Drive: ${data.driveType}`,
      ].filter(Boolean).join('   |   ') || 'Decoded from NHTSA vPIC';
      doc.text(subParts, MARGIN + 5, y + 15.5);

      y += 26;

      // --- HELPER: DRAW A KEY/VALUE TABLE ---
      const drawTable = (sectionTitle: string, rows: [string, string][], startY: number): number => {
        doc.setFillColor(30, 41, 59);
        doc.rect(MARGIN, startY, CONTENT_W, 7, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(sectionTitle.toUpperCase(), MARGIN + 4, startY + 5);

        let currY = startY + 7;
        doc.setFontSize(8.5);

        rows.forEach(([label, val], idx) => {
          doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
          doc.rect(MARGIN, currY, CONTENT_W, 6.5, 'F');

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(label, MARGIN + 4, currY + 4.5);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(String(val || 'N/A'), MARGIN + (CONTENT_W / 2) + 6, currY + 4.5);

          doc.setDrawColor(241, 245, 249);
          doc.line(MARGIN, currY + 6.5, MARGIN + CONTENT_W, currY + 6.5);
          currY += 6.5;
        });

        doc.setDrawColor(203, 213, 225);
        doc.rect(MARGIN, startY, CONTENT_W, currY - startY, 'D');
        return currY + 6;
      };

      // --- HELPER: DRAW A WRAPPED TEXT BLOCK (for long record strings) ---
      const drawBlock = (sectionTitle: string, entries: [string, string][], startY: number): number => {
        doc.setFillColor(30, 41, 59);
        doc.rect(MARGIN, startY, CONTENT_W, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(sectionTitle.toUpperCase(), MARGIN + 4, startY + 5);

        let currY = startY + 11;
        entries.forEach(([label, val]) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(label, MARGIN + 2, currY);
          currY += 4.5;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          const lines = doc.splitTextToSize(String(val || 'Not available'), CONTENT_W - 4) as string[];
          lines.forEach((ln) => {
            doc.text(ln, MARGIN + 2, currY);
            currY += 4.2;
          });
          currY += 2.5;
        });
        return currY + 4;
      };

      // --- SECTION 1: FACTORY SPECIFICATIONS (real values only) ---
      const engineParts = [data.engineDisplacement, data.engineHP, data.cylinders && `${data.cylinders} cyl`]
        .filter(Boolean)
        .join('  ·  ');

      y = drawTable('Factory Specifications', [
        ['Make / Model', [data.make, data.model].filter(Boolean).join(' ') || 'N/A'],
        ['Model Year', data.year || 'N/A'],
        ['Body Style', data.bodyClass || 'N/A'],
        ['Engine', engineParts || 'N/A'],
        ['Fuel Type', data.fuelType || 'N/A'],
        ['Transmission / Drive', `${data.transmission || 'N/A'} / ${data.driveType || 'N/A'}`],
        ['Assembly Plant', data.plant || 'N/A'],
        ['Manufacturer', data.manufacturerName || 'N/A'],
      ], y);

      // --- SECTION 2: RECORDS (real recall + salvage lookups only) ---
      if (data.recallStatus || data.salvageLog) {
        y = drawBlock('Records & Safety Checks', [
          ['NHTSA Recall Check', data.recallStatus || 'Not available'],
          ['Public Salvage / Auction Index', data.salvageLog || 'Not available'],
        ], y);
      }

      // --- FOOTER ---
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      const footer = 'Specifications decoded from the official NHTSA vPIC database. Recall and salvage results reflect public records available at the time of lookup.';
      doc.text(doc.splitTextToSize(footer, CONTENT_W) as string[], MARGIN, 286);

      const safeVin = (vin || 'REPORT').replace(/[^A-Z0-9]/gi, '').toUpperCase();
      doc.save(`Vehicle_Report_${safeVin}.pdf`);

    } catch (err) {
      console.error('Vector PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  const isLarge = variant === 'large';

  return (
    <button
      onClick={generateNativeVectorPdf}
      disabled={isGenerating}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-opacity
        focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer disabled:opacity-50
        ${
          isLarge
            ? 'w-full md:w-auto px-8 py-3.5 text-sm bg-accent text-accent-foreground hover:opacity-90'
            : 'px-4 py-2 text-xs bg-white border border-border text-foreground hover:border-accent hover:text-accent'
        }
      `}
    >
      {isGenerating ? (
        <>
          <LoaderIcon />
          <span>Building PDF…</span>
        </>
      ) : (
        <>
          <DownloadIcon />
          <span>{isLarge ? 'Download PDF report' : 'Download PDF'}</span>
        </>
      )}
    </button>
  );
}
