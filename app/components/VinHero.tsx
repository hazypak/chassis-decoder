'use client';

import React, { useRef, useState } from 'react';

// ── Sample VINs ────────────────────────────────────────────────
const SAMPLE_VINS = [
  { label: 'Try Sample Mustang VIN', vin: '1ZVBP8AM4C5281209', icon: '🐎' },
  { label: 'Try Sample Tesla VIN',   vin: '5YJ3E1EA7KF328931', icon: '⚡' },
];

// ── Icons (inline SVG to avoid extra deps) ─────────────────────
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function ShieldCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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

function ZapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────
interface VinHeroProps {
  onDecode: (vin: string) => void;
  loading: boolean;
}

// ── Component ──────────────────────────────────────────────────
export default function VinHero({ onDecode, loading }: VinHeroProps) {
  const [vin, setVin] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_LEN = 17;
  const remaining = MAX_LEN - vin.length;
  const isValid = vin.length === MAX_LEN;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    setVin(raw.slice(0, MAX_LEN));
  }

  function handleClear() {
    setVin('');
    inputRef.current?.focus();
  }

  function handleSample(sampleVin: string) {
    setVin(sampleVin);
    inputRef.current?.focus();
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (isValid && !loading) onDecode(vin);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <section className="relative w-full py-16 md:py-24 px-4 flex flex-col items-center">
      {/* Background decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                        bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Official badge */}
      <div className="badge-official animate-fade-in mb-6 relative z-10">
        <ShieldCheckIcon />
        Official Global VIN &amp; Chassis Inspector
      </div>

      {/* Headline */}
      <h1 className="relative z-10 text-center font-extrabold tracking-tight leading-tight
                     text-4xl md:text-5xl lg:text-6xl text-slate-100 mb-4 animate-fade-in stagger-1">
        Decode Any{' '}
        <span className="accent-gradient-text">Vehicle Chassis</span>
        <br className="hidden md:block" />
        {' '}in Seconds
      </h1>

      <p className="relative z-10 text-center text-slate-400 text-base md:text-lg max-w-xl
                    mb-10 animate-fade-in stagger-2">
        Enter a 17-character VIN to instantly retrieve full vehicle specs, manufacturing
        data, engine details, and more — completely free.
      </p>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl animate-fade-in stagger-3"
      >
        {/* Input wrapper */}
        <div
          className={`
            relative flex items-center rounded-2xl border transition-all duration-200
            ${focused
              ? 'border-cyan-500 shadow-[0_0_0_3px_rgba(6,182,212,0.18),0_0_24px_rgba(6,182,212,0.35)]'
              : 'border-[rgba(6,182,212,0.22)] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            }
            bg-[rgba(15,23,42,0.72)] backdrop-blur-xl
          `}
        >
          {/* Search icon */}
          <span className="pl-5 text-slate-500 flex-shrink-0">
            <SearchIcon />
          </span>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Enter 17-character VIN (e.g. 1HGBH41JXMN109186)"
            value={vin}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={MAX_LEN}
            className="
              flex-1 bg-transparent px-4 py-4 text-slate-100 placeholder-slate-600
              font-mono text-base md:text-lg tracking-widest
              focus:outline-none
            "
            aria-label="VIN input"
          />

          {/* Character counter */}
          <span
            className={`
              flex-shrink-0 text-xs font-mono font-semibold px-2 transition-colors duration-150
              ${vin.length === 0 ? 'text-slate-600' : isValid ? 'text-cyan-400' : 'text-slate-400'}
            `}
            aria-live="polite"
            aria-label={`${vin.length} of ${MAX_LEN} characters`}
          >
            {vin.length}/{MAX_LEN}
          </span>

          {/* Clear button */}
          {vin.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="
                flex-shrink-0 mr-2 p-1.5 rounded-lg text-slate-500
                hover:text-slate-300 hover:bg-slate-700/60
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50
              "
              aria-label="Clear VIN input"
            >
              <XIcon />
            </button>
          )}

          {/* Decode button (desktop — inside input) */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="
              hidden md:flex flex-shrink-0 items-center gap-2
              btn-primary px-6 py-3 mr-2 rounded-xl text-sm font-semibold
              disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
            "
            aria-label="Decode Chassis"
          >
            {loading ? (
              <>
                <LoaderIcon />
                Decoding…
              </>
            ) : (
              <>
                <ZapIcon />
                Decode Chassis
              </>
            )}
          </button>
        </div>

        {/* Decode button (mobile — below input) */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="
            md:hidden mt-3 w-full flex items-center justify-center gap-2
            btn-primary px-6 py-4 rounded-xl text-base font-semibold
            disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
          "
          aria-label="Decode Chassis"
        >
          {loading ? (
            <>
              <LoaderIcon />
              Decoding…
            </>
          ) : (
            <>
              <ZapIcon />
              Decode Chassis
            </>
          )}
        </button>

        {/* VIN format hint */}
        <p className="mt-2 text-center text-xs text-slate-600">
          VINs use only letters A–H, J–N, P–Z and digits 0–9 (no I, O, or Q).
          {remaining > 0 && remaining < MAX_LEN && (
            <span className="ml-1 text-slate-500">
              {remaining} character{remaining !== 1 ? 's' : ''} remaining.
            </span>
          )}
        </p>
      </form>

      {/* Sample VIN buttons */}
      <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-3 animate-fade-in stagger-4">
        <span className="text-xs text-slate-600 self-center mr-1">Quick test:</span>
        {SAMPLE_VINS.map(({ label, vin: sampleVin, icon }) => (
          <button
            key={sampleVin}
            type="button"
            onClick={() => handleSample(sampleVin)}
            disabled={loading}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              text-xs font-semibold text-slate-300
              bg-[rgba(15,23,42,0.6)] border border-[rgba(148,163,184,0.12)]
              hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-[rgba(6,182,212,0.06)]
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-cyan-500/40
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-8 animate-fade-in stagger-5">
        {[
          { value: '100%', label: 'Free Lookups' },
          { value: '17-Char', label: 'Standard VIN' },
          { value: 'Global', label: 'Coverage' },
          { value: 'Instant', label: 'Results' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-lg font-bold accent-gradient-text">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
