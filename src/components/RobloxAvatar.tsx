import React, { useState, useEffect } from 'react';
import { fetchRobloxAvatarUrl } from '../services/robloxApi';

interface RobloxAvatarProps {
  username: string;
  customUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 3D Blocky Roblox Avatar SVG Fallback Renders with iconic Roblox faces and hairs
export const BlockyRobloxAvatar: React.FC<{ username: string; className?: string }> = ({ username, className = "w-full h-full" }) => {
  // Generate deterministic style based on username
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const faceTypes = ['smile', 'chill', 'man', 'cool', 'woman'];
  const hairTypes = ['spiky', 'cap', 'headphones', 'crown', 'beanie'];
  const bgColors = ['#E2E8F0', '#CBD5E1', '#D1D5DB', '#94A3B8', '#B1B3B8'];
  const shirtColors = ['#0F172A', '#1E293B', '#111827', '#2563EB', '#0D9488', '#DC2626'];

  const faceType = faceTypes[hash % faceTypes.length];
  const hairType = hairTypes[(hash + 2) % hairTypes.length];
  const bgColor = bgColors[hash % bgColors.length];
  const shirtColor = shirtColors[(hash + 1) % shirtColors.length];

  return (
    <div className={`relative overflow-hidden rounded-full flex items-center justify-center select-none ${className}`} style={{ backgroundColor: bgColor }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`headGrad-${hash}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE0BD" />
            <stop offset="100%" stopColor="#F5C492" />
          </linearGradient>
          <linearGradient id={`shirtGrad-${hash}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={shirtColor} />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>

        {/* Roblox Torso / Shirt Collar */}
        <path d="M 15 82 L 85 82 L 85 100 L 15 100 Z" fill={`url(#shirtGrad-${hash})`} />
        {/* Neck */}
        <rect x="42" y="65" width="16" height="18" fill="#F5C492" />

        {/* Roblox Blocky Head (Rounded Rect) */}
        <rect x="26" y="24" width="48" height="46" rx="8" fill={`url(#headGrad-${hash})`} stroke="#E2A670" strokeWidth="1.5" />

        {/* FACES */}
        {faceType === 'smile' && (
          <g>
            {/* Classic Roblox Smile */}
            <circle cx="38" cy="42" r="3.5" fill="#1E1B18" />
            <circle cx="62" cy="42" r="3.5" fill="#1E1B18" />
            <path d="M 38 52 Q 50 62 62 52" fill="none" stroke="#1E1B18" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {faceType === 'chill' && (
          <g>
            {/* Chill Face */}
            <path d="M 33 41 Q 38 38 43 41" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 57 41 Q 62 38 67 41" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="38" cy="43" r="2" fill="#1E1B18" />
            <circle cx="62" cy="43" r="2" fill="#1E1B18" />
            <path d="M 40 54 Q 52 58 60 52" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {faceType === 'cool' && (
          <g>
            {/* Cool Sunglasses */}
            <polygon points="30,38 70,38 66,48 34,48" fill="#000000" />
            <line x1="30" y1="41" x2="70" y2="41" stroke="#333333" strokeWidth="1.5" />
            <polygon points="34,40 45,40 38,46" fill="#FFFFFF" opacity="0.4" />
            <path d="M 38 55 Q 50 62 62 55" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {faceType === 'man' && (
          <g>
            {/* Man Face */}
            <ellipse cx="37" cy="41" rx="3" ry="4" fill="#1E1B18" />
            <ellipse cx="63" cy="41" rx="3" ry="4" fill="#1E1B18" />
            <path d="M 32 35 L 42 37" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
            <path d="M 68 35 L 58 37" stroke="#1E1B18" strokeWidth="2" strokeLinecap="round" />
            <path d="M 42 53 Q 50 56 60 50" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {faceType === 'woman' && (
          <g>
            {/* Woman Face with eyelashes */}
            <circle cx="37" cy="42" r="3.5" fill="#1E1B18" />
            <circle cx="63" cy="42" r="3.5" fill="#1E1B18" />
            <path d="M 33 38 L 36 40" stroke="#1E1B18" strokeWidth="1.5" />
            <path d="M 67 38 L 64 40" stroke="#1E1B18" strokeWidth="1.5" />
            <path d="M 38 52 Q 50 62 62 52" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="57" r="2.5" fill="#FF6B81" opacity="0.6" />
          </g>
        )}

        {/* ACCESSORIES & HAIR */}
        {hairType === 'spiky' && (
          <path d="M 23 28 Q 28 10 40 18 Q 50 8 60 18 Q 72 10 77 28 Z" fill="#2A1B12" />
        )}

        {hairType === 'cap' && (
          <g>
            <path d="M 23 28 Q 50 15 77 28 L 84 32 L 20 32 Z" fill="#1E293B" />
            <rect x="22" y="26" width="56" height="6" fill="#DC2626" />
          </g>
        )}

        {hairType === 'headphones' && (
          <g>
            <path d="M 22 36 Q 50 12 78 36" fill="none" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
            <rect x="20" y="34" width="8" height="16" rx="3" fill="#DC2626" />
            <rect x="72" y="34" width="8" height="16" rx="3" fill="#DC2626" />
          </g>
        )}

        {hairType === 'crown' && (
          <polygon points="25,26 33,12 42,22 50,8 58,22 67,12 75,26" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
        )}

        {hairType === 'beanie' && (
          <path d="M 24 28 C 24 14 76 14 76 28 Z" fill="#3B82F6" />
        )}
      </svg>
    </div>
  );
};

export const RobloxAvatar: React.FC<RobloxAvatarProps> = ({
  username,
  customUrl,
  className = "w-full h-full",
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(customUrl || '');
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    if (customUrl && customUrl.trim().length > 5 && !customUrl.includes('unsplash.com')) {
      setAvatarUrl(customUrl);
      setImageError(false);
      return;
    }

    setImageError(false);

    fetchRobloxAvatarUrl(username).then((url) => {
      if (isMounted) {
        setAvatarUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [username, customUrl]);

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={`${username} Avatar`}
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className={`object-cover bg-[#F2F4F5] ${className}`}
      />
    );
  }

  return <BlockyRobloxAvatar username={username} className={className} />;
};
