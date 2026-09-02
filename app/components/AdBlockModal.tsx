'use client';

import React, { useEffect, useState } from 'react';

export default function AdBlockModal() {
  const [isAdBlockActive, setIsAdBlockActive] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const detectAdBlocker = async () => {
    setIsChecking(true);
    let blocked = false;

    // 1. DOM Bait Test (Detects element hiding/filtering rules)
    const bait = document.createElement('div');
    bait.className = 'adsbygoogle ad-unit ad-zone banner-ad ad-container google-ad';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.top = '-9999px';
    bait.style.height = '1px';
    bait.style.width = '1px';
    document.body.appendChild(bait);

    const computedStyle = window.getComputedStyle(bait);
    if (
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      computedStyle.display === 'none' ||
      computedStyle.visibility === 'hidden'
    ) {
      blocked = true;
    }
    document.body.removeChild(bait);

    // 2. Network Fetch Probe (Detects DNS/Network level blockers like Pi-hole, Brave, uBlock)
    if (!blocked) {
      try {
        await fetch('https://www.highperformanceformat.com/invoke.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
        });
      } catch (err) {
        // If network request fails, the ad provider domain is blocked
        blocked = true;
      }
    }

    setIsAdBlockActive(blocked);
    setIsChecking(false);
  };

  useEffect(() => {
    // Brief delay to let extensions execute before running detection
    const timer = setTimeout(() => {
      detectAdBlocker();
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Do not render anything if still checking or if no AdBlocker is present
  if (isChecking || !isAdBlockActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-5">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-3xl">
          🛡️
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-900">
            Ad Blocker Detected
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            We rely on advertising to keep this Chassis & VIN decoder free for everyone. Please turn off your ad blocker to access the tool.
          </p>
        </div>

        {/* Instructions Box */}
        <div className="bg-neutral-50 p-3.5 rounded-xl border border-border text-xs text-muted space-y-1.5 text-left">
          <p className="font-semibold text-neutral-700">How to continue:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted">
            <li>Click your AdBlocker or Shield icon in your browser.</li>
            <li>Select <strong>Pause on this site</strong> or toggle off.</li>
            <li>Click the refresh button below.</li>
          </ol>
        </div>

        {/* Refresh Action Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          I&apos;ve Disabled It — Refresh Page
        </button>
      </div>
    </div>
  );
}