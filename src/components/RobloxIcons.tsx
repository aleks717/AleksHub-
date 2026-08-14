import React from 'react';

// Roblox official tilted square logo
export const RobloxLogoIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <polygon points="18,0 100,22 82,100 0,78" />
    <polygon points="43,38 61,43 57,62 39,57" fill="#ffffff" />
  </svg>
);

// Robux Official Hexagonal Icon (1:1 Exact Match for IMG_0379.png)
export const RobuxIcon: React.FC<{ className?: string; color?: string }> = ({ 
  className = "h-5 w-5", 
  color = "currentColor" 
}) => (
  <svg 
    viewBox="0 0 200 200" 
    className={`${className} inline-block shrink-0 align-middle`} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Dark Hexagon with rounded corners */}
    <path 
      d="M100 8 L183 53 A 6 6 0 0 1 186 58 L186 142 A 6 6 0 0 1 183 147 L100 192 A 6 6 0 0 1 97 192 L14 147 A 6 6 0 0 1 11 142 L11 58 A 6 6 0 0 1 14 53 L97 8 A 6 6 0 0 1 100 8 Z" 
      fill="#393B3D" 
    />
    
    {/* White Hexagonal Inset Gap Border */}
    <path 
      d="M100 28 L168 65 L168 135 L100 172 L32 135 L32 65 Z" 
      stroke="#FFFFFF" 
      strokeWidth="11" 
      strokeLinejoin="round" 
      fill="none" 
    />
    
    {/* Inner Dark Hexagon Body */}
    <path 
      d="M100 36 L160 69 L160 131 L100 164 L40 131 L40 69 Z" 
      fill="#393B3D" 
    />
    
    {/* Center White Upright Square Cutout */}
    <rect 
      x="74" 
      y="74" 
      width="52" 
      height="52" 
      fill="#FFFFFF" 
      rx="2" 
    />
  </svg>
);

// Simple compact Robux inline icon for list view
export const RobuxHexIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 8 L90 28 L90 72 L50 92 L10 72 L10 28 Z" fill="none" stroke="currentColor" strokeWidth="12" />
    <path d="M50 25 L75 39 L75 61 L50 75 L25 61 L25 39 Z" fill="currentColor" />
    <rect x="42" y="42" width="16" height="16" fill="#FFFFFF" transform="rotate(10 50 50)" />
  </svg>
);

// Roblox Official Verified Blue Checkmark Badge (1:1 Exact Match for IMG_0363.png)
export const VerifiedBadge: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={`${className} inline-block shrink-0 align-middle ml-1`} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Tilted Blue Square (IMG_0363.png) */}
    <g transform="rotate(-13 50 50)">
      <rect x="12" y="12" width="76" height="76" rx="2" fill="#0066FF" />
      {/* Thick rounded white checkmark */}
      <path 
        d="M29 51 L44 66 L72 34" 
        stroke="#FFFFFF" 
        strokeWidth="13.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </g>
  </svg>
);

// Roblox Official Premium Tilted P Shield Badge
export const RobloxPremiumBadge: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} inline-block shrink-0 align-middle ml-1`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#393B3D" />
    <path d="M7 5H14C16.2091 5 18 6.79086 18 9C18 11.2091 16.2091 13 14 13H10V19H7V5ZM10 8V10H14C14.5523 10 15 9.55228 15 9C15 8.44772 14.5523 8 14 8H10Z" fill="white" />
  </svg>
);

// Roblox Plus Official Extension Hexagon Logo (1:1 Pixel-Perfect Match for IMG_0364.png)
export const RobloxPlusBadge: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg 
    className={`${className} inline-block shrink-0 align-middle ml-1 text-[#191919] dark:text-white`} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Continuous stylized single-line geometric hexagon loop exactly matching IMG_0364.png */}
    <path 
      d="M 31 71 C 27 68 24 64 24 58 L 24 33 L 50 14 L 76 33 L 76 67 L 50 86 L 38 77 L 38 35 L 60 35 L 60 59 L 48 59" 
      stroke="currentColor" 
      strokeWidth="8.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none" 
    />
  </svg>
);

// Render of Goldene Krone von Ozymandias (1:1 3D Rotating Mesh matching video & IMG_0381.jpeg)
export const CrownGraphic: React.FC<{ className?: string; isAnimated?: boolean }> = ({ 
  className = "w-48 h-48",
  isAnimated = true
}) => (
  <div className={`relative flex items-center justify-center select-none ${className} [perspective:900px]`}>
    <div className={`w-full h-full flex items-center justify-center ${isAnimated ? 'animate-crown-3d' : ''}`}>
      <svg viewBox="0 0 360 260" className="w-full h-full filter drop-shadow-xl overflow-visible">
        <defs>
          {/* Rich multi-stop metallic gold & brass gradients */}
          <linearGradient id="ozyGoldMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFCE0" />
            <stop offset="25%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="75%" stopColor="#AA820A" />
            <stop offset="100%" stopColor="#5E4300" />
          </linearGradient>
          <linearGradient id="ozyGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FFEAA7" />
            <stop offset="70%" stopColor="#DFB15B" />
            <stop offset="100%" stopColor="#966B09" />
          </linearGradient>
          <linearGradient id="ozyGoldDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6C4E04" />
            <stop offset="50%" stopColor="#9C7811" />
            <stop offset="100%" stopColor="#4A3402" />
          </linearGradient>
          <linearGradient id="ozySilverHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F1F5F9" />
            <stop offset="80%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <radialGradient id="ozyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFEAA7" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Halo Glow */}
        <ellipse cx="180" cy="130" rx="140" ry="50" fill="url(#ozyGlow)" />

        {/* Back Half of Spikes (Upward and Downward) */}
        <g opacity="0.85">
          {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 180 + Math.sin(rad) * 105;
            const cy = 120 - Math.cos(rad) * 22;
            const topH = 50 + Math.cos(rad) * 15;
            const botH = 25 + Math.cos(rad) * 10;
            return (
              <g key={`back-${i}`}>
                {/* Back Upward Spike */}
                <polygon
                  points={`${cx - 2},${cy} ${cx + 2},${cy} ${cx},${cy - topH}`}
                  fill="url(#ozyGoldDark)"
                />
                {/* Back Downward Spike */}
                <polygon
                  points={`${cx - 2},${cy} ${cx + 2},${cy} ${cx},${cy + botH}`}
                  fill="url(#ozyGoldDark)"
                />
              </g>
            );
          })}
        </g>

        {/* Back Ring Band */}
        <ellipse
          cx="180"
          cy="125"
          rx="105"
          ry="24"
          fill="none"
          stroke="url(#ozyGoldDark)"
          strokeWidth="6"
        />

        {/* Middle Support Ring */}
        <ellipse
          cx="180"
          cy="130"
          rx="108"
          ry="26"
          fill="none"
          stroke="url(#ozyGoldMain)"
          strokeWidth="4"
        />

        {/* Front Spikes: Intricate 3D Faceted Spikes Upward & Downward */}
        {[-85, -70, -55, -40, -25, -10, 5, 20, 35, 50, 65, 80].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 180 + Math.sin(rad) * 110;
          const cy = 135 + Math.cos(rad) * 24;
          const topH = 75 - Math.abs(deg) * 0.2;
          const botH = 38 - Math.abs(deg) * 0.12;

          return (
            <g key={`front-${i}`}>
              {/* Upper Tall Spikes (Left Facet) */}
              <polygon
                points={`${cx - 3.5},${cy} ${cx},${cy} ${cx},${cy - topH}`}
                fill={i % 2 === 0 ? "url(#ozySilverHighlight)" : "url(#ozyGoldLight)"}
              />
              {/* Upper Tall Spikes (Right Facet) */}
              <polygon
                points={`${cx},${cy} ${cx + 3.5},${cy} ${cx},${cy - topH}`}
                fill={i % 2 === 0 ? "url(#ozyGoldMain)" : "url(#ozyGoldDark)"}
              />
              {/* Center Ridge Highlight */}
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - topH}
                stroke="#FFF"
                strokeWidth="0.75"
                opacity="0.8"
              />

              {/* Lower Spikes (Left Facet) */}
              <polygon
                points={`${cx - 3},${cy} ${cx},${cy} ${cx},${cy + botH}`}
                fill="url(#ozyGoldLight)"
              />
              {/* Lower Spikes (Right Facet) */}
              <polygon
                points={`${cx},${cy} ${cx + 3},${cy} ${cx},${cy + botH}`}
                fill="url(#ozyGoldDark)"
              />

              {/* Connecting Joint Bead */}
              <circle
                cx={cx}
                cy={cy}
                r="3.5"
                fill="url(#ozyGoldLight)"
                stroke="#6C4E04"
                strokeWidth="0.75"
              />
            </g>
          );
        })}

        {/* Front Ring Band with Metallic Sheen */}
        <path
          d="M 72 135 Q 180 166 288 135 Q 180 156 72 135 Z"
          fill="url(#ozyGoldLight)"
          stroke="#8B6508"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  </div>
);
