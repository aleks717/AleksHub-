import React, { useState, useEffect } from 'react';
import { fetchRobloxAvatarUrl, getFallbackRobloxAvatar } from '../services/robloxApi';

interface RobloxAvatarProps {
  username: string;
  customUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RobloxAvatar: React.FC<RobloxAvatarProps> = ({
  username,
  customUrl,
  className = "w-full h-full",
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    if (customUrl && customUrl.trim().length > 5 && !customUrl.includes('unsplash.com')) {
      return customUrl;
    }
    return '';
  });
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    if (customUrl && customUrl.trim().length > 5 && !customUrl.includes('unsplash.com')) {
      setAvatarUrl(customUrl);
      setHasLoaded(true);
      return;
    }

    // Attempt to load from service
    fetchRobloxAvatarUrl(username).then((url) => {
      if (isMounted && url) {
        setAvatarUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [username, customUrl]);

  const handleImageError = () => {
    if (fallbackAttempt === 0) {
      // First fallback: Direct Roblox headshot thumbnail endpoint
      setFallbackAttempt(1);
      setAvatarUrl(getFallbackRobloxAvatar(username));
    } else if (fallbackAttempt === 1) {
      // Second fallback: Alternative roblox cdn
      setFallbackAttempt(2);
      setAvatarUrl(`https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png`);
    } else {
      setFallbackAttempt(3);
    }
  };

  const finalSrc = avatarUrl || getFallbackRobloxAvatar(username);

  return (
    <div className={`relative overflow-hidden bg-[#E3E5E8] dark:bg-zinc-800 flex items-center justify-center select-none ${className}`}>
      {/* Skeleton / Placeholder while loading */}
      {!hasLoaded && (
        <div className="absolute inset-0 bg-[#E3E5E8] dark:bg-zinc-800 animate-pulse" />
      )}
      
      <img
        src={finalSrc}
        alt={`${username} Avatar`}
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => setHasLoaded(true)}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          hasLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
