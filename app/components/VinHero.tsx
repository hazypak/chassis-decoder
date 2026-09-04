'use client';

import React, { useRef, useState } from 'react';

// Checksum-valid sample VINs used by the "Try" buttons.
const SAMPLE_VINS = [
  { label: 'Sample Mustang', vin: '1ZVBP8AM2C5281209' },
  { label: 'Sample Tesla',   vin: '5YJ3E1EA5KF328931' },
];

// Inline icons, so we don't pull in an icon library.
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
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

function LoaderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
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

interface VinHeroProps {
  onDecode: (vin: string) => void;
  loading: boolean;
}

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

  // Decode button contents, shared between the desktop (inline) and mobile buttons.
  const decodeLabel = loading ? (
    <>
      <LoaderIcon />
      Decoding…
    </>
  ) : (
    'Decode'
  );

  return (
    <section className="w-full max-w-2xl mx-auto pt-8 pb-4 md:pt-14 md:pb-6 flex flex-col items-center">
      {/* Headline */}
      <h1 className="text-center font-semibold tracking-tight text-3xl md:text-4xl text-foreground mb-3">
        Decode any vehicle VIN
      </h1>
      <p className="text-center text-muted text-sm md:text-base max-w-md mb-8">
        Enter a 17-character VIN to retrieve verified specs, engine data, and
        manufacturing details — free.
      </p>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={`
            relative flex items-center rounded-xl border bg-card transition-colors duration-150
            ${focused ? 'border-accent ring-2 ring-accent/20' : 'border-border'}
          `}
        >
          <span className="pl-4 text-muted flex-shrink-0">
            <SearchIcon />
          </span>

          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="e.g. 1HGBH41JXMN109186"
            value={vin}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={MAX_LEN}
            className="flex-1 min-w-0 bg-transparent px-3 py-3.5 text-foreground placeholder-neutral-400 font-mono text-base tracking-wider focus:outline-none"
            aria-label="VIN input"
          />

          {/* Character counter */}
          <span
            className={`
              flex-shrink-0 text-xs font-mono font-medium px-1.5
              ${vin.length === 0 ? 'text-neutral-400' : isValid ? 'text-accent' : 'text-muted'}
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
              className="flex-shrink-0 mr-1.5 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
              aria-label="Clear VIN input"
            >
              <XIcon />
            </button>
          )}

          {/* Decode button (desktop — inside input) */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="hidden md:inline-flex flex-shrink-0 items-center gap-2 mr-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decode VIN"
          >
            {decodeLabel}
          </button>
        </div>

        {/* Decode button (mobile — below input) */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="md:hidden mt-3 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Decode VIN"
        >
          {decodeLabel}
        </button>

        {/* VIN format hint */}
        <p className="mt-2.5 text-center text-xs text-muted">
          Letters A–H, J–N, P–Z and digits 0–9 (no I, O, or Q).
          {remaining > 0 && remaining < MAX_LEN && (
            <span className="ml-1">
              {remaining} character{remaining !== 1 ? 's' : ''} to go.
            </span>
          )}
        </p>
      </form>

      {/* Sample VIN buttons */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="text-xs text-muted self-center mr-1">Try:</span>
        {SAMPLE_VINS.map(({ label, vin: sampleVin }) => (
          <button
            key={sampleVin}
            type="button"
            onClick={() => handleSample(sampleVin)}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 border border-border hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
