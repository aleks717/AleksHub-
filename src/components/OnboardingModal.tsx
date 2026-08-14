import React, { useState } from 'react';
import { RobloxLogoIcon, VerifiedBadge } from './RobloxIcons';
import { RobloxAvatar } from './RobloxAvatar';
import { Search, CheckCircle2, Loader2, ArrowRight, User } from 'lucide-react';
import { fetchRobloxUserInfo } from '../services/robloxApi';

interface OnboardingModalProps {
  isOpen: boolean;
  onLogin: (userData: { username: string; displayName: string; avatarUrl?: string; hasVerifiedBadge?: boolean }) => void;
  onContinueAsGuest: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onLogin, onContinueAsGuest }) => {
  const [inputUsername, setInputUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundAccount, setFoundAccount] = useState<{
    username: string;
    displayName: string;
    avatarUrl?: string;
    hasVerifiedBadge: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleSearchAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputUsername.trim();
    if (!clean) return;

    setLoading(true);

    try {
      const info = await fetchRobloxUserInfo(clean);
      if (info) {
        setFoundAccount({
          username: info.username || clean,
          displayName: info.displayName || clean,
          avatarUrl: info.avatarUrl,
          hasVerifiedBadge: !!info.hasVerifiedBadge,
        });
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Error fetching onboarding avatar:', err);
    }

    setFoundAccount({
      username: clean,
      displayName: clean,
      hasVerifiedBadge: false,
    });
    setLoading(false);
  };

  const handleConfirmLogin = async () => {
    const clean = inputUsername.trim();
    if (!clean) {
      onContinueAsGuest();
      return;
    }

    if (foundAccount) {
      onLogin(foundAccount);
    } else {
      setLoading(true);
      const info = await fetchRobloxUserInfo(clean);
      onLogin({
        username: info?.username || clean,
        displayName: info?.displayName || clean,
        avatarUrl: info?.avatarUrl,
        hasVerifiedBadge: !!info?.hasVerifiedBadge,
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#191919] text-[#191919] dark:text-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E3E5E8] dark:border-zinc-800 p-6 md:p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Roblox Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl shadow-md">
            <RobloxLogoIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Enter Username</h1>
          <p className="text-xs text-[#656668] dark:text-zinc-400 font-medium">
            Enter your Roblox username to load your profile & avatar:
          </p>
        </div>

        {/* Username Search Form */}
        <form onSubmit={handleSearchAccount} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => {
                setInputUsername(e.target.value);
                setFoundAccount(null);
              }}
              placeholder="e.g. SpyderAleks, FMLY_ALEKS, Roblox..."
              autoFocus
              className="w-full pl-4 pr-11 py-3 bg-[#F2F4F5] dark:bg-zinc-800 border border-[#E3E5E8] dark:border-zinc-700 rounded-2xl text-sm font-bold text-[#191919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A2FF] transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputUsername.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00A2FF] hover:bg-[#0084DD] text-white rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
              title="Search account"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Account Found Preview Card */}
        {foundAccount && (
          <div className="p-3.5 bg-[#F2F4F5] dark:bg-zinc-800/80 rounded-2xl border border-[#00A2FF]/40 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-zinc-700 border-2 border-[#00A2FF] shrink-0 shadow-xs">
                <RobloxAvatar username={foundAccount.username} customUrl={foundAccount.avatarUrl} />
              </div>
              <div className="text-left">
                <div className="text-sm font-black flex items-center space-x-1">
                  <span>{foundAccount.displayName}</span>
                  {foundAccount.hasVerifiedBadge && <VerifiedBadge className="w-4 h-4" />}
                </div>
                <div className="text-xs text-[#656668] dark:text-zinc-400 font-semibold">
                  @{foundAccount.username}
                </div>
              </div>
            </div>

            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleConfirmLogin}
            disabled={loading || !inputUsername.trim()}
            className="w-full py-3.5 bg-[#00A2FF] hover:bg-[#0084DD] active:scale-[0.99] disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <span>Continue as {inputUsername.trim() || 'User'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full py-3 bg-[#F2F4F5] dark:bg-zinc-800 hover:bg-[#E3E5E8] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold rounded-2xl transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#656668] dark:text-zinc-400" />
            <span>Continue as Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
