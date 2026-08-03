'use client';

/**
 * AdSlot.tsx
 *
 * Google AdSense-ready placeholder ad slot component.
 *
 * Usage:
 *   <AdSlot id="ad-slot-top"    label="Top Banner"   minHeight={90}  />
 *   <AdSlot id="ad-slot-middle" label="In-Feed Ad"   minHeight={250} />
 *   <AdSlot id="ad-slot-bottom" label="Bottom Banner" minHeight={90} sticky />
 *
 * To activate real AdSense ads:
 *   1. Add your AdSense script to app/layout.tsx (or _document.tsx).
 *   2. Replace the inner <div> with your <ins class="adsbygoogle" ...> tag.
 *   3. Remove the placeholder styling.
 *
 * The outer wrapper always maintains `minHeight` to prevent Cumulative Layout
 * Shift (CLS) regardless of whether the ad has loaded.
 */

import React, { useEffect, useRef } from 'react';

// ── Props ──────────────────────────────────────────────────────
interface AdSlotProps {
  /** Unique slot identifier — also used as the element `id`. */
  id: string;
  /** Human-readable label shown in the placeholder (dev/preview only). */
  label?: string;
  /** Minimum height in pixels — prevents CLS. Default: 90. */
  minHeight?: number;
  /** Maximum width in pixels. Default: unconstrained. */
  maxWidth?: number;
  /** If true, renders as a sticky bottom banner. */
  sticky?: boolean;
  /** Your AdSense publisher ID, e.g. "ca-pub-XXXXXXXXXXXXXXXX". */
  publisherId?: string;
  /** Your AdSense ad slot ID for this placement. */
  adSlotId?: string;
  /** Extra CSS class names for the outer wrapper. */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────
export default function AdSlot({
  id,
  label = 'Advertisement',
  minHeight = 90,
  maxWidth,
  sticky = false,
  publisherId,
  adSlotId,
  className = '',
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);

  // Push AdSense ad when publisher + slot IDs are provided
  useEffect(() => {
    if (!publisherId || !adSlotId) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as unknown as Record<string, unknown>).adsbygoogle =
        (window as unknown as Record<string, unknown>).adsbygoogle || []) as unknown[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as unknown as Record<string, unknown>).adsbygoogle as unknown[]).push({});
    } catch {
      // Silently ignore if AdSense is blocked
    }
  }, [publisherId, adSlotId]);

  const hasRealAd = !!(publisherId && adSlotId);

  // ── Sticky bottom wrapper ────────────────────────────────────
  if (sticky) {
    return (
      <div
        id={id}
        className={`
          no-print fixed bottom-0 left-0 right-0 z-40
          flex items-center justify-center
          bg-[rgba(2,6,23,0.92)] backdrop-blur-md
          border-t border-[rgba(6,182,212,0.15)]
          ${className}
        `}
        style={{ minHeight }}
        aria-label={label}
        role="complementary"
      >
        {hasRealAd ? (
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight }}
            data-ad-client={publisherId}
            data-ad-slot={adSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <AdPlaceholder label={label} minHeight={minHeight} maxWidth={maxWidth} />
        )}
      </div>
    );
  }

  // ── Standard inline slot ─────────────────────────────────────
  return (
    <div
      id={id}
      className={`
        no-print ad-slot-wrapper w-full
        ${className}
      `}
      style={{ minHeight }}
      aria-label={label}
      role="complementary"
    >
      {hasRealAd ? (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight, width: '100%' }}
          data-ad-client={publisherId}
          data-ad-slot={adSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <AdPlaceholder label={label} minHeight={minHeight} maxWidth={maxWidth} />
      )}
    </div>
  );
}

// ── Placeholder (shown when no real AdSense IDs are configured) ─
function AdPlaceholder({
  label,
  minHeight,
  maxWidth,
}: {
  label: string;
  minHeight: number;
  maxWidth?: number;
}) {
  return (
    <div
      className="
        w-full flex flex-col items-center justify-center gap-1
        border border-dashed border-[rgba(148,163,184,0.1)]
        rounded-lg bg-[rgba(15,23,42,0.3)]
        text-slate-600 text-[10px] font-medium tracking-wider uppercase
        select-none
      "
      style={{
        minHeight,
        maxWidth: maxWidth ?? '100%',
      }}
      aria-hidden="true"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
           className="opacity-40">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <span className="opacity-50">{label}</span>
    </div>
  );
}
