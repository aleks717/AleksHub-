import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, User, Plus, Trash2, RotateCcw, Sun, Moon, Info, AlertTriangle, Loader2, Search, Globe } from 'lucide-react';
import { UserSettings, RobloxFriend } from '../types';
import { RobuxIcon, VerifiedBadge, RobloxPlusBadge } from './RobloxIcons';
import { RobloxAvatar } from './RobloxAvatar';
import { fetchRobloxUserInfo } from '../services/robloxApi';
import { LANGUAGES } from '../utils/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  friends: RobloxFriend[];
  onAddFriend: (friend: RobloxFriend) => void;
  onRemoveFriend: (id: string) => void;
  onResetToDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  onUpdateSettings,
  friends,
  onAddFriend,
  onRemoveFriend,
  onResetToDefaults,
}) => {
  const [username, setUsername] = useState(userSettings.username);
  const [robuxCount, setRobuxCount] = useState(userSettings.robuxCount.toString());
  const [hasVerifiedBadge, setHasVerifiedBadge] = useState(userSettings.hasVerifiedBadge);
  const [isRobloxPlus, setIsRobloxPlus] = useState(userSettings.isRobloxPlus);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(userSettings.customAvatarUrl || '');
  const [theme, setTheme] = useState<'light' | 'dark'>(userSettings.theme || 'light');
  const [language, setLanguage] = useState<string>(userSettings.language || 'en');
  const [langSearchQuery, setLangSearchQuery] = useState<string>('');
  const [limitedItemDays, setLimitedItemDays] = useState<string>((userSettings.limitedItemDays ?? 18).toString());
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  // Add friend state
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'disclaimer'>('profile');

  // Sync state whenever modal opens or userSettings prop changes
  useEffect(() => {
    if (isOpen) {
      setUsername(userSettings.username);
      setRobuxCount(userSettings.robuxCount.toString());
      setHasVerifiedBadge(userSettings.hasVerifiedBadge);
      setIsRobloxPlus(userSettings.isRobloxPlus);
      setCustomAvatarUrl(userSettings.customAvatarUrl || '');
      setTheme(userSettings.theme || 'light');
      setLanguage(userSettings.language || 'en');
      setLimitedItemDays((userSettings.limitedItemDays ?? 18).toString());
    }
  }, [isOpen, userSettings]);

  if (!isOpen) return null;

  const handleSelectTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // Instant live preview
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearchQuery.toLowerCase())
  );

  const handleFetchRobloxAvatar = async () => {
    if (!username.trim()) return;
    setIsFetchingPreview(true);
    try {
      const info = await fetchRobloxUserInfo(username.trim());
      setCustomAvatarUrl(info.avatarUrl);
      if (info.hasVerifiedBadge) {
        setHasVerifiedBadge(true);
      }
    } catch (err) {
      console.warn('Failed to fetch avatar preview:', err);
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleSave = async () => {
    const trimmedUsername = username.trim() || 'Guest';
    const numRobux = parseInt(robuxCount, 10);
    const usernameChanged = trimmedUsername !== userSettings.username;

    setIsSaving(true);

    let finalAvatarUrl = customAvatarUrl.trim();
    let finalDisplayName = trimmedUsername;
    let finalVerified = hasVerifiedBadge;

    // If username changed and not Guest, fetch the new user's real avatar & display name from Roblox CDN
    if (usernameChanged && trimmedUsername.toLowerCase() !== 'guest') {
      try {
        const info = await fetchRobloxUserInfo(trimmedUsername);
        // Unless user typed a custom non-roblox HTTP image URL, use the fetched avatar URL
        const isCustomExternalImg = finalAvatarUrl &&
          !finalAvatarUrl.includes('rbxcdn.com') &&
          !finalAvatarUrl.includes('roblox.com') &&
          finalAvatarUrl.startsWith('http');

        if (!isCustomExternalImg) {
          finalAvatarUrl = info.avatarUrl;
        }
        finalDisplayName = info.displayName || trimmedUsername;
        if (info.hasVerifiedBadge) {
          finalVerified = true;
        }
      } catch (err) {
        console.warn('Failed to fetch user info on save:', err);
      }
    }

    const parsedDays = parseInt(limitedItemDays, 10);

    onUpdateSettings({
      username: trimmedUsername,
      displayName: finalDisplayName,
      robuxCount: isNaN(numRobux) ? 0 : numRobux,
      hasVerifiedBadge: finalVerified,
      isRobloxPlus,
      customAvatarUrl: finalAvatarUrl || undefined,
      theme,
      language,
      limitedItemDays: isNaN(parsedDays) ? 18 : parsedDays,
    });

    setIsSaving(false);
    onClose();
  };

  const handleAddNewFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendUsername.trim()) return;
    const newFriend: RobloxFriend = {
      id: `friend-${Date.now()}`,
      username: newFriendUsername.trim(),
      avatarUrl: '',
      avatarBg: 'bg-emerald-100',
      isOnline: true,
    };
    onAddFriend(newFriend);
    setNewFriendUsername('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 text-[#191919]">
      <div 
        className="bg-white dark:bg-[#191919] text-[#191919] dark:text-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#E3E5E8] dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E3E5E8] dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold">Roblox Settings</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#656668] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white rounded-full hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Header */}
        <div className="flex border-b border-[#E3E5E8] dark:border-zinc-800 bg-[#F2F4F5] dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#00A2FF] text-[#00A2FF] bg-white dark:bg-[#191919]'
                : 'border-transparent text-[#656668] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            Profile & Theme
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'friends'
                ? 'border-[#00A2FF] text-[#00A2FF] bg-white dark:bg-[#191919]'
                : 'border-transparent text-[#656668] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all ${
              activeTab === 'disclaimer'
                ? 'border-[#00A2FF] text-[#00A2FF] bg-white dark:bg-[#191919]'
                : 'border-transparent text-[#656668] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white'
            }`}
          >
            Disclaimer
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {activeTab === 'profile' && (
            <>
              {/* Live Profile Preview Card */}
              <div className="flex items-center space-x-3 p-3 bg-[#F2F4F5] dark:bg-zinc-800/80 rounded-xl border border-[#E3E5E8] dark:border-zinc-700">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#E3E5E8] dark:bg-zinc-700 shrink-0 border border-[#BDC1C6] dark:border-zinc-600 flex items-center justify-center">
                  <RobloxAvatar username={username} customUrl={customAvatarUrl} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold text-[#656668] dark:text-zinc-400">Live Profile Preview</div>
                  <div className="flex items-center space-x-1.5 font-extrabold text-sm text-[#191919] dark:text-white truncate">
                    <span className="truncate">{username || 'Roblox User'}</span>
                    {hasVerifiedBadge && <VerifiedBadge className="w-4 h-4 shrink-0" />}
                    {isRobloxPlus && <RobloxPlusBadge className="w-4 h-4 shrink-0" />}
                  </div>
                  <div className="text-xs text-[#656668] dark:text-zinc-400 font-medium">
                    {parseInt(robuxCount, 10) || 0} Robux
                  </div>
                </div>
              </div>

              {/* 1. Theme Switcher (Dark / Light Mode) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#656668] dark:text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Theme (Dark / Light Mode)</span>
                  <span className="text-[10px] text-[#656668] dark:text-zinc-400 font-normal">Choose visual appearance</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('light')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-[#00A2FF] bg-blue-50 dark:bg-blue-950/40 text-[#00A2FF] ring-2 ring-[#00A2FF]/30'
                        : 'border-[#E3E5E8] dark:border-zinc-800 bg-[#F2F4F5] dark:bg-zinc-800 text-[#656668] dark:text-zinc-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-[#00A2FF] bg-zinc-800 dark:bg-zinc-700 text-[#00A2FF] ring-2 ring-[#00A2FF]/30'
                        : 'border-[#E3E5E8] dark:border-zinc-800 bg-[#F2F4F5] dark:bg-zinc-800 text-[#656668] dark:text-zinc-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              {/* 2. Searchable Language Settings */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#656668] dark:text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#00A2FF]" />
                    <span>Language / Sprache</span>
                  </span>
                  <span className="text-[10px] text-[#656668] dark:text-zinc-400 font-normal">Active: {LANGUAGES.find(l => l.code === language)?.name || 'English'}</span>
                </label>

                {/* Popular Quick Switches */}
                <div className="flex items-center space-x-2">
                  {[
                    { code: 'en', label: '🇺🇸 English (US)' },
                    { code: 'de', label: '🇩🇪 Deutsch' },
                    { code: 'es', label: '🇪🇸 Español' },
                    { code: 'fr', label: '🇫🇷 Français' },
                  ].map((quick) => (
                    <button
                      key={quick.code}
                      type="button"
                      onClick={() => setLanguage(quick.code)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all truncate border cursor-pointer ${
                        language === quick.code
                          ? 'bg-[#00A2FF] text-white border-[#00A2FF] shadow-2xs'
                          : 'bg-[#F2F4F5] dark:bg-zinc-800 hover:bg-[#E3E5E8] dark:hover:bg-zinc-700 text-[#191919] dark:text-zinc-300 border-[#E3E5E8] dark:border-zinc-700'
                      }`}
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 bg-[#F2F4F5] dark:bg-zinc-800/80 p-3 rounded-xl border border-[#E3E5E8] dark:border-zinc-700">
                  {/* Search Input for Languages */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#656668] dark:text-zinc-400" />
                    <input
                      type="text"
                      value={langSearchQuery}
                      onChange={(e) => setLangSearchQuery(e.target.value)}
                      placeholder="Search language / Sprache suchen..."
                      className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-zinc-900 border border-[#BDC1C6] dark:border-zinc-700 rounded-lg text-xs font-semibold text-[#191919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A2FF]"
                    />
                    {langSearchQuery && (
                      <button
                        onClick={() => setLangSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#656668] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Scrollable Language Options List */}
                  <div className="max-h-36 overflow-y-auto grid grid-cols-2 gap-1.5 pr-1 custom-scrollbar">
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => setLanguage(l.code)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                            language === l.code
                              ? 'bg-[#00A2FF] text-white shadow-2xs'
                              : 'bg-white dark:bg-zinc-900 hover:bg-[#E3E5E8] dark:hover:bg-zinc-700 text-[#191919] dark:text-zinc-200 border border-[#E3E5E8] dark:border-zinc-700'
                          }`}
                        >
                          <span className="truncate">{l.nativeName} ({l.name})</span>
                          {language === l.code && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-white" />}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 py-3 text-center text-xs text-[#656668] dark:text-zinc-400">
                        No language found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Username input & Fetch Avatar Action */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#656668] dark:text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Roblox Username</span>
                  <span className="text-[10px] text-[#656668] dark:text-zinc-400 font-normal">Updates profile everywhere</span>
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#656668] dark:text-zinc-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#F2F4F5] dark:bg-zinc-800 border border-[#E3E5E8] dark:border-zinc-700 rounded-xl text-sm font-semibold text-[#191919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A2FF]"
                      placeholder="e.g. Builderman, Bobodix, FMLY_ALEKS"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchRobloxAvatar}
                    disabled={isFetchingPreview || !username.trim()}
                    className="px-3 py-2 bg-[#E3E5E8] dark:bg-zinc-800 hover:bg-[#BDC1C6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shrink-0 disabled:opacity-50"
                    title="Fetch profile picture from Roblox for this username"
                  >
                    {isFetchingPreview ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A2FF]" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Fetch Avatar</span>
                  </button>
                </div>
              </div>

              {/* 3. Robux Amount Customizer */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#656668] dark:text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Robux Balance</span>
                  <span className="text-[10px] font-normal text-[#656668] dark:text-zinc-400">Set custom Robux count</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <RobuxIcon className="w-4 h-4 text-[#191919] dark:text-white" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={robuxCount}
                    onChange={(e) => setRobuxCount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F2F4F5] dark:bg-zinc-800 border border-[#E3E5E8] dark:border-zinc-700 rounded-xl text-sm font-bold text-[#191919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A2FF]"
                  />
                </div>

                {/* Quick Presets for Robux */}
                <div className="flex items-center space-x-2 pt-1">
                  {['0', '1000', '10000', '50000', '100000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRobuxCount(preset)}
                      className="flex-1 py-1 text-[11px] font-bold rounded-lg bg-[#F2F4F5] dark:bg-zinc-800 hover:bg-[#E3E5E8] dark:hover:bg-zinc-700 text-[#191919] dark:text-white border border-[#E3E5E8] dark:border-zinc-700 transition-colors"
                    >
                      {parseInt(preset, 10).toLocaleString('en-US')} R$
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Verified Badge Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#F2F4F5] dark:bg-zinc-800 rounded-xl border border-[#E3E5E8] dark:border-zinc-700">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#00A2FF]" />
                  <div>
                    <div className="text-sm font-bold flex items-center space-x-1">
                      <span>Roblox Verified Badge</span>
                      <VerifiedBadge className="w-4 h-4" />
                    </div>
                    <div className="text-xs text-[#656668] dark:text-zinc-400">
                      Official blue star verified badge style
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHasVerifiedBadge(!hasVerifiedBadge)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    hasVerifiedBadge ? 'bg-[#00A2FF]' : 'bg-[#BDC1C6] dark:bg-zinc-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      hasVerifiedBadge ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 5. Roblox Plus Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#F2F4F5] dark:bg-zinc-800 rounded-xl border border-[#E3E5E8] dark:border-zinc-700">
                <div className="flex items-center space-x-2.5">
                  <RobloxPlusBadge className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-bold flex items-center space-x-1">
                      <span>Roblox Plus (R+) Badge</span>
                    </div>
                    <div className="text-xs text-[#656668] dark:text-zinc-400">Official Roblox+ R+ extension icon style</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRobloxPlus(!isRobloxPlus)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    isRobloxPlus ? 'bg-red-600' : 'bg-[#BDC1C6] dark:bg-zinc-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isRobloxPlus ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Custom Avatar URL option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#656668] dark:text-zinc-400 uppercase tracking-wide">
                  Custom Profile Picture (Image URL)
                </label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#F2F4F5] dark:bg-zinc-800 border border-[#E3E5E8] dark:border-zinc-700 rounded-xl text-xs text-[#191919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A2FF]"
                />
              </div>

              {/* Limited Avatar Item Days Remaining */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#656668] dark:text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Limited Avatar Item Duration</span>
                  <span className="text-[10px] font-normal text-[#656668] dark:text-zinc-400">Days remaining on Crown</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={limitedItemDays}
                    onChange={(e) => setLimitedItemDays(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F2F4F5] dark:bg-zinc-800 border border-[#E3E5E8] dark:border-zinc-700 rounded-xl text-sm font-bold text-[#191919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A2FF]"
                  />
                  <span className="text-xs font-bold text-[#656668] dark:text-zinc-400 shrink-0">Days Left</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'friends' && (
            /* Friends Management Tab */
            <div className="space-y-4">
              {/* Add New Friend Form */}
              <form onSubmit={handleAddNewFriend} className="space-y-2 bg-[#F2F4F5] dark:bg-zinc-800 p-3 rounded-xl border border-[#E3E5E8] dark:border-zinc-700">
                <div className="text-xs font-bold text-[#656668] dark:text-zinc-400">Add New Friend</div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFriendUsername}
                    onChange={(e) => setNewFriendUsername(e.target.value)}
                    placeholder="Username..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-[#E3E5E8] dark:border-zinc-700 rounded-xl text-xs font-semibold text-[#191919] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A2FF]"
                  />
                  <button
                    type="submit"
                    className="bg-[#00A2FF] hover:bg-[#0084DD] text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center space-x-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Friends List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-2.5 bg-[#F2F4F5] dark:bg-zinc-800 rounded-xl border border-[#E3E5E8] dark:border-zinc-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#BDC1C6] dark:border-zinc-700">
                          <RobloxAvatar username={friend.username} customUrl={friend.avatarUrl} />
                        </div>
                        <span className="text-xs font-bold">{friend.username}</span>
                      </div>

                      <button
                        onClick={() => onRemoveFriend(friend.id)}
                        className="p-1.5 text-[#656668] dark:text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            /* Disclaimer Tab */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Demo & Simulation Disclaimer
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed font-medium">
                    This website is a simulated fan-made concept app created strictly for demonstration, visual design showcase, and testing purposes.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#393B3D] dark:text-zinc-300 leading-relaxed font-normal bg-[#F2F4F5] dark:bg-zinc-800/80 p-4 rounded-xl border border-[#E3E5E8] dark:border-zinc-700">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-[#00A2FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#191919] dark:text-white">Not Affiliated with Roblox:</span> This application is independent and is not affiliated, endorsed, sponsored, or certified by Roblox Corporation.
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-[#00A2FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#191919] dark:text-white">Fake Currency & Badges:</span> All Robux balances, items, send transfers, verified badges, and Roblox Plus icons on this page are completely fake and simulated. No real currency or actual Roblox account transactions occur.
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-[#00A2FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#191919] dark:text-white">Intellectual Property:</span> Roblox, the Roblox logo, Robux, and all related brand graphics are trademarks of Roblox Corporation.
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-[#656668] dark:text-zinc-500 font-medium">
                  made by Aleks
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E3E5E8] dark:border-zinc-800 bg-[#F2F4F5] dark:bg-zinc-900 flex items-center justify-between">
          <button
            onClick={onResetToDefaults}
            className="text-xs text-[#656668] dark:text-zinc-400 hover:text-[#191919] dark:hover:text-white font-semibold flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#E3E5E8] dark:bg-zinc-800 hover:bg-[#BDC1C6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#00A2FF] hover:bg-[#0084DD] text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

