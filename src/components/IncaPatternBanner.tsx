import React from 'react';

interface IncaPatternBannerProps {
  className?: string;
  height?: number | string;
  opacity?: number;
}

export const IncaPatternBanner: React.FC<IncaPatternBannerProps> = ({
  className = '',
  height = '100%',
  opacity = 1
}) => {
  return (
    <div 
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`} 
      style={{ height, opacity }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Authentic Andean Manto Textile Pattern based on traditional Apurímac / Cusco weaving */}
          <pattern id="mantoAndinoPatternFull" x="0" y="0" width="300" height="150" patternUnits="userSpaceOnUse">
            {/* Deep Slate / Midnight Blue Background */}
            <rect width="300" height="150" fill="#0f172a" />

            {/* BAND 1: Purple with White Greek Meander Key (Grecas) */}
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="35" height="150" fill="#6b21a8" />
              <path 
                d="M 6,5 H 28 V 28 H 15 V 15 H 22 V 20 M 6,40 H 28 V 63 H 15 V 50 H 22 V 55 M 6,75 H 28 V 98 H 15 V 85 H 22 V 90 M 6,110 H 28 V 133 H 15 V 120 H 22 V 125" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="3" 
                strokeLinecap="square"
              />
            </g>

            {/* BAND 2: Bright Gold & Orange Lines */}
            <rect x="35" y="0" width="8" height="150" fill="#facc15" />
            <rect x="43" y="0" width="5" height="150" fill="#f97316" />

            {/* BAND 3: Royal Blue with Checkerboard & Diamond Motifs */}
            <g transform="translate(48, 0)">
              <rect x="0" y="0" width="35" height="150" fill="#1d4ed8" />
              <g fill="#ffffff">
                <rect x="13" y="10" width="8" height="8" />
                <rect x="5" y="20" width="8" height="8" />
                <rect x="21" y="20" width="8" height="8" />
                <rect x="13" y="30" width="8" height="8" fill="#ec4899" />
                
                <rect x="13" y="60" width="8" height="8" />
                <rect x="5" y="70" width="8" height="8" />
                <rect x="21" y="70" width="8" height="8" />
                <rect x="13" y="80" width="8" height="8" fill="#ec4899" />

                <rect x="13" y="110" width="8" height="8" />
                <rect x="5" y="120" width="8" height="8" />
                <rect x="21" y="120" width="8" height="8" />
                <rect x="13" y="130" width="8" height="8" fill="#ec4899" />
              </g>
            </g>

            {/* BAND 4: Red & Yellow ZigZag (Chevron) */}
            <g transform="translate(83, 0)">
              <rect x="0" y="0" width="32" height="150" fill="#dc2626" />
              <path d="M 0,0 L 16,18 L 32,0 L 32,10 L 16,28 L 0,10 Z" fill="#facc15" />
              <path d="M 0,15 L 16,33 L 32,15 L 32,23 L 16,41 L 0,23 Z" fill="#ffffff" />
              <path d="M 0,40 L 16,58 L 32,40 L 32,50 L 16,68 L 0,50 Z" fill="#facc15" />
              <path d="M 0,55 L 16,73 L 32,55 L 32,63 L 16,81 L 0,63 Z" fill="#ffffff" />
              <path d="M 0,80 L 16,98 L 32,80 L 32,90 L 16,108 L 0,90 Z" fill="#facc15" />
              <path d="M 0,95 L 16,113 L 32,95 L 32,103 L 16,121 L 0,103 Z" fill="#ffffff" />
            </g>

            {/* BAND 5: Pink Accent */}
            <rect x="115" y="0" width="7" height="150" fill="#ec4899" />

            {/* BAND 6: Cyan Sky Blue with X-Crosses */}
            <g transform="translate(122, 0)">
              <rect x="0" y="0" width="28" height="150" fill="#0284c7" />
              <path d="M 5,5 L 23,25 M 23,5 L 5,25" stroke="#ffffff" strokeWidth="4" strokeLinecap="square" />
              <path d="M 5,42 L 23,62 M 23,42 L 5,62" stroke="#facc15" strokeWidth="4" strokeLinecap="square" />
              <path d="M 5,80 L 23,100 M 23,80 L 5,100" stroke="#ffffff" strokeWidth="4" strokeLinecap="square" />
              <path d="M 5,117 L 23,137 M 23,117 L 5,137" stroke="#facc15" strokeWidth="4" strokeLinecap="square" />
            </g>

            {/* BAND 7: Deep Violet Divider */}
            <rect x="150" y="0" width="8" height="150" fill="#4c1d95" />

            {/* BAND 8: Crimson Red with Stepped Diamond Tocapu */}
            <g transform="translate(158, 0)">
              <rect x="0" y="0" width="38" height="150" fill="#be123c" />
              <polygon points="19,2 35,20 19,38 3,20" fill="#ffffff" />
              <polygon points="19,8 29,20 19,32 9,20" fill="#be123c" />
              <polygon points="19,13 24,20 19,27 14,20" fill="#facc15" />

              <polygon points="19,52 35,70 19,88 3,70" fill="#ffffff" />
              <polygon points="19,58 29,70 19,82 9,70" fill="#be123c" />
              <polygon points="19,63 24,70 19,77 14,70" fill="#facc15" />

              <polygon points="19,102 35,120 19,138 3,120" fill="#ffffff" />
              <polygon points="19,108 29,120 19,132 9,120" fill="#be123c" />
              <polygon points="19,113 24,120 19,127 14,120" fill="#facc15" />
            </g>

            {/* BAND 9: Yellow & Orange */}
            <rect x="196" y="0" width="8" height="150" fill="#eab308" />
            <rect x="204" y="0" width="5" height="150" fill="#f97316" />

            {/* BAND 10: Emerald Green with Chakana / Inca Cross motif */}
            <g transform="translate(209, 0)">
              <rect x="0" y="0" width="36" height="150" fill="#059669" />
              {/* Stepped Inca Cross Chakana */}
              <path d="M 12,5 H 24 V 10 H 29 V 22 H 24 V 27 H 12 V 22 H 7 V 10 H 12 Z" fill="#ffffff" />
              <rect x="14" y="12" width="8" height="8" fill="#059669" />

              <path d="M 12,55 H 24 V 60 H 29 V 72 H 24 V 77 H 12 V 72 H 7 V 60 H 12 Z" fill="#ffffff" />
              <rect x="14" y="62" width="8" height="8" fill="#059669" />

              <path d="M 12,105 H 24 V 110 H 29 V 122 H 24 V 127 H 12 V 122 H 7 V 110 H 12 Z" fill="#ffffff" />
              <rect x="14" y="112" width="8" height="8" fill="#059669" />
            </g>

            {/* BAND 11: Royal Blue Stripe */}
            <rect x="245" y="0" width="10" height="150" fill="#1d4ed8" />

            {/* BAND 12: Magenta Edge */}
            <g transform="translate(255, 0)">
              <rect x="0" y="0" width="45" height="150" fill="#a21caf" />
              <path d="M 0,0 L 22,20 L 45,0 L 45,12 L 22,32 L 0,12 Z" fill="#facc15" />
              <path d="M 0,40 L 22,60 L 45,40 L 45,52 L 22,72 L 0,52 Z" fill="#ffffff" />
              <path d="M 0,80 L 22,100 L 45,80 L 45,92 L 22,112 L 0,92 Z" fill="#facc15" />
              <path d="M 0,120 L 22,140 L 45,120 L 45,132 L 22,152 L 0,132 Z" fill="#ffffff" />
            </g>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#mantoAndinoPatternFull)" />
      </svg>
    </div>
  );
};
