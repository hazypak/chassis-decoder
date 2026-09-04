interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
}

// Placeholder ad slot. Reserves the banner's footprint without loading any
// third-party ad scripts.
export default function AdSlot({ width, height, className = '' }: AdSlotProps) {
  return (
    <div className={`flex justify-center my-3 w-full ${className}`}>
      <div
        className="flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-neutral-50 text-[11px] uppercase tracking-widest text-neutral-400"
        style={{ maxWidth: width, minHeight: height }}
      >
        Ad space
      </div>
    </div>
  );
}
