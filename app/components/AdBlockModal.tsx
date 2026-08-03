'use client';

/**
 * AdBlockModal.tsx
 *
 * Lightweight client-side AdBlock detector using the "bait element" technique.
 *
 * How it works:
 *   1. On mount, a hidden <div> is injected with class names that common
 *      ad-blockers (uBlock Origin, AdBlock Plus, etc.) target in their filter
 *      lists (e.g. "ad-banner", "adsbox", "doubleclick").
 *   2. After a short delay (300ms), the element is inspected. If it has been
 *      hidden (offsetHeight === 0 or display: none), an adblocker is active.
 *   3. A non-intrusive modal is shown asking the user to disable their blocker.
 *
 * False-positive rate: Very low. The 300ms delay and dual-check (offsetHeight
 * + getComputedStyle) minimise false positives on slow connections.
 */

import React, { useEffect, useRef, useState } from 'react';

// ── Icons ──────────────────────────────────────────────────────
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
         stroke="none" className="text-red-400">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ShieldOffIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
         className="text-amber-400">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────
export default function AdBlockModal() {
  const [detected, setDetected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const baitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check sessionStorage — don't re-show if user already dismissed this session
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem('adblock-notice-dismissed') === '1') return;
    }

    // Delay detection to allow page + adblocker to fully initialise
    const timer = setTimeout(() => {
      const bait = baitRef.current;
      if (!bait) return;

      const isHidden =
        bait.offsetHeight === 0 ||
        bait.offsetWidth  === 0 ||
        bait.offsetParent === null ||
        window.getComputedStyle(bait).display === 'none' ||
        window.getComputedStyle(bait).visibility === 'hidden';

      if (isHidden) {
        setDetected(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  function handleRefresh() {
    window.location.reload();
  }

  function handleDismiss() {
    setDismissed(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('adblock-notice-dismissed', '1');
    }
  }

  return (
    <>
      {/*
        ── Bait element ──────────────────────────────────────────
        These class names are in common adblocker filter lists.
        The element is visually hidden but NOT display:none so that
        the browser still renders it — adblockers will then hide it.
      */}
      <div
        ref={baitRef}
        className="ad-banner adsbox doubleclick ad-placement"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── Modal overlay ─────────────────────────────────────── */}
      {detected && !dismissed && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-[rgba(2,6,23,0.85)] backdrop-blur-sm
            animate-fade-in
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="adblock-modal-title"
          aria-describedby="adblock-modal-desc"
        >
          <div
            className="
              glass-card relative w-full max-w-md mx-4 p-8
              border-amber-500/30
              animate-fade-in-up
            "
            style={{ boxShadow: '0 0 40px rgba(245, 158, 11, 0.15)' }}
          >
            {/* Dismiss (×) button — soft dismiss, modal can reappear next session */}
            <button
              onClick={handleDismiss}
              className="
                absolute top-4 right-4
                p-1.5 rounded-lg text-slate-500
                hover:text-slate-300 hover:bg-slate-700/60
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-slate-500/50
              "
              aria-label="Dismiss notice"
            >
              <XIcon />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="
                w-16 h-16 rounded-2xl
                bg-amber-500/10 border border-amber-500/30
                flex items-center justify-center
              ">
                <ShieldOffIcon />
              </div>
            </div>

            {/* Title */}
            <h2
              id="adblock-modal-title"
              className="text-xl font-bold text-slate-100 text-center mb-3"
            >
              AdBlocker Detected
            </h2>

            {/* Body */}
            <p
              id="adblock-modal-desc"
              className="text-sm text-slate-400 text-center leading-relaxed mb-2"
            >
              It looks like you&apos;re using an ad blocker. We keep our VIN decoder
              <strong className="text-slate-300"> 100% free</strong> through
              non-intrusive ads — no pop-ups, no auto-play videos.
            </p>
            <p className="text-sm text-slate-400 text-center leading-relaxed mb-6">
              Please disable your AdBlocker for this site to support the tool and
              help us keep it free for everyone.
            </p>

            {/* Support note */}
            <div className="
              flex items-center gap-2 justify-center
              text-xs text-slate-500 mb-6
            ">
              <HeartIcon />
              <span>Your support means the world to us — thank you!</span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRefresh}
                className="
                  flex-1 flex items-center justify-center gap-2
                  btn-primary py-3 px-6 rounded-xl text-sm font-semibold
                "
              >
                <RefreshIcon />
                I&apos;ve Disabled It — Refresh
              </button>
              <button
                onClick={handleDismiss}
                className="
                  flex-1 py-3 px-6 rounded-xl text-sm font-semibold
                  text-slate-400 border border-slate-700/60
                  hover:border-slate-600 hover:text-slate-300
                  transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-slate-500/40
                "
              >
                Continue Anyway
              </button>
            </div>

            {/* Fine print */}
            <p className="mt-4 text-[10px] text-slate-600 text-center">
              We only show Google AdSense ads — no malware, no trackers beyond Google&apos;s
              standard ad network.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
