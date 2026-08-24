import React from 'react';
import { IncaPatternBanner } from './IncaPatternBanner';

interface AndeanDividerProps {
  label?: string;
  className?: string;
}

export const AndeanDivider: React.FC<AndeanDividerProps> = ({
  label,
  className = ''
}) => {
  return (
    <div className={`relative w-full my-3 sm:my-4 select-none ${className}`}>
      <div className="relative w-full h-8 sm:h-10 rounded-full overflow-hidden shadow-lg border-2 border-amber-400/70">
        <IncaPatternBanner height="100%" opacity={1} />
        {/* Dark overlay for solid contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70 pointer-events-none" />
        {label && (
          <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
            <span className="text-[10px] sm:text-xs font-serif-craft font-extrabold text-amber-200 uppercase tracking-wider drop-shadow-md flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/60 shadow-md">
              <span className="text-amber-400">✦</span> {label}
            </span>
            <span className="text-[10px] sm:text-xs font-serif-craft font-extrabold text-amber-200 uppercase tracking-wider drop-shadow-md hidden sm:flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/60 shadow-md">
              Apurímac <span className="text-amber-400">✦</span> Uberris
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
