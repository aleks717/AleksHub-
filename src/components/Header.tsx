import React from 'react';
import { RobloxLogoIcon, RobuxIcon, VerifiedBadge, RobloxPlusBadge } from './RobloxIcons';
import { Search, Settings, Menu, Sun, Moon } from 'lucide-react';
import { UserSettings } from '../types';
import { RobloxAvatar } from './RobloxAvatar';
import { getTranslation } from '../utils/translations';

interface HeaderProps {
  userSettings: UserSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSendModal: () => void;
  onOpenSettingsModal: () => void;
  toggleSidebar: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userSettings,
  activeTab,
  setActiveTab,
  onOpenSendModal,
  onOpenSettingsModal,
  toggleSidebar,
  onToggleTheme,
}) => {
  const lang = userSettings.language || 'en';
  const isDark = userSettings.theme === 'dark';

  return (
    <header className="sticky top-0 z-30 h-13 bg-white dark:bg-[#111214] border-b border-[#E3E5E8] dark:border-zinc-800 flex items-center justify-between px-3 md:px-4 text-[#191919] dark:text-white text-sm font-medium shadow-2xs transition-colors">
      {/* Left side: Hamburger, Logo, SELECT, Nav Tabs */}
      <div className="flex items-center space-x-3 md:space-x-5">
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 rounded text-[#393B3D] dark:text-zinc-300 transition-colors"
          title="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Roblox Logo */}
        <div 
          onClick={() => setActiveTab('robux')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <RobloxLogoIcon className="h-5 w-5 text-[#191919] dark:text-white group-hover:scale-105 transition-transform" />
          <span className="bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
            SELECT
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('charts')}
            className={`transition-colors hover:text-[#191919] dark:hover:text-white ${
              activeTab === 'charts' ? 'text-[#191919] dark:text-white border-b-2 border-[#191919] dark:border-white py-3.5 -mb-1' : 'text-[#656668] dark:text-zinc-400'
            }`}
          >
            {getTranslation(lang, 'charts')}
          </button>
          <button
            onClick={() => setActiveTab('marktplatz')}
            className={`transition-colors hover:text-[#191919] dark:hover:text-white ${
              activeTab === 'marktplatz' ? 'text-[#191919] dark:text-white border-b-2 border-[#191919] dark:border-white py-3.5 -mb-1' : 'text-[#656668] dark:text-zinc-400'
            }`}
          >
            {getTranslation(lang, 'marketplace')}
          </button>
          <button
            onClick={() => setActiveTab('erstellen')}
            className={`transition-colors hover:text-[#191919] dark:hover:text-white ${
              activeTab === 'erstellen' ? 'text-[#191919] dark:text-white border-b-2 border-[#191919] dark:border-white py-3.5 -mb-1' : 'text-[#656668] dark:text-zinc-400'
            }`}
          >
            {getTranslation(lang, 'create')}
          </button>
          <button
            onClick={() => setActiveTab('robux')}
            className={`transition-colors hover:text-[#191919] dark:hover:text-white ${
              activeTab === 'robux' ? 'text-[#191919] dark:text-white border-b-2 border-[#191919] dark:border-white py-3.5 -mb-1' : 'text-[#656668] dark:text-zinc-400'
            }`}
          >
            {getTranslation(lang, 'robux')}
          </button>
        </nav>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-xs md:max-w-md mx-2 md:mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#656668] dark:text-zinc-400" />
          <input
            type="text"
            placeholder={getTranslation(lang, 'search')}
            className="w-full bg-[#F2F4F5] dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 text-[#191919] dark:text-white text-xs md:text-sm pl-9 pr-3 py-1.5 rounded-md border border-transparent focus:border-[#BDC1C6] focus:outline-none transition-all placeholder:text-[#656668] dark:placeholder:text-zinc-400 font-medium"
          />
        </div>
      </div>

      {/* Right side: User avatar thumbnail, username, Robux count, Light/Dark toggle, Settings gear */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* User profile thumbnail + Username */}
        <button
          onClick={() => setActiveTab('profil')}
          className="flex items-center space-x-1.5 hover:opacity-90 transition-opacity"
          title={`Profile: ${userSettings.username}`}
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#E3E5E8] dark:bg-zinc-800 border border-[#BDC1C6] dark:border-zinc-700 flex items-center justify-center shrink-0">
            <RobloxAvatar username={userSettings.username} customUrl={userSettings.customAvatarUrl} />
          </div>
          <span className="hidden sm:inline font-bold text-xs text-[#191919] dark:text-white truncate max-w-[100px]">
            {userSettings.username}
          </span>
        </button>

        {/* Verified Badge display if active */}
        {userSettings.hasVerifiedBadge && (
          <VerifiedBadge className="w-4 h-4 -ml-1" />
        )}

        {/* Roblox Plus badge display if active */}
        {userSettings.isRobloxPlus && (
          <RobloxPlusBadge className="w-4 h-4" />
        )}

        {/* Robux Counter Pill */}
        <div 
          onClick={() => setActiveTab('robux')}
          className="flex items-center space-x-1 px-2 py-1 rounded-full hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer transition-colors text-xs md:text-sm font-bold text-[#191919] dark:text-white"
          title="Robux Balance"
        >
          <RobuxIcon className="w-4 h-4 text-[#191919] dark:text-white" />
          <span>{userSettings.robuxCount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</span>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 rounded-full text-[#393B3D] dark:text-zinc-300 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
        </button>

        {/* Settings gear icon */}
        <button
          onClick={onOpenSettingsModal}
          className="p-1.5 hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 rounded-full text-[#393B3D] dark:text-zinc-300 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};


