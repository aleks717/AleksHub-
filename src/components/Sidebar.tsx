import React from 'react';
import {
  Home,
  User,
  MessageSquare,
  Users,
  Shirt,
  Package,
  Repeat,
  FileText,
  ShoppingBag,
  Gift,
  ChevronRight
} from 'lucide-react';
import { UserSettings } from '../types';
import { VerifiedBadge, RobloxPlusBadge } from './RobloxIcons';
import { RobloxAvatar } from './RobloxAvatar';
import { getTranslation } from '../utils/translations';

interface SidebarProps {
  isOpen: boolean;
  userSettings: UserSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettingsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  userSettings,
  activeTab,
  setActiveTab,
  onOpenSettingsModal,
}) => {
  if (!isOpen) return null;
  const lang = userSettings.language || 'en';

  return (
    <aside className="h-full overflow-y-auto custom-scrollbar w-56 bg-white dark:bg-[#111214] border-r border-[#E3E5E8] dark:border-zinc-800 shrink-0 flex flex-col justify-between select-none text-[#191919] dark:text-white transition-colors z-20 px-3 py-2.5">
      <div>
        {/* User Info Header (1:1 Match IMG_0370.jpeg) */}
        <div 
          onClick={() => setActiveTab('profil')}
          className="flex items-center space-x-2.5 p-2 mb-1.5 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#BDC1C6] dark:border-zinc-700 bg-[#E3E5E8] dark:bg-zinc-800 flex items-center justify-center">
            <RobloxAvatar username={userSettings.username} customUrl={userSettings.customAvatarUrl} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center text-sm font-bold truncate text-[#191919] dark:text-white">
              <span className="truncate">{userSettings.username}</span>
              {userSettings.hasVerifiedBadge && <VerifiedBadge className="w-3.5 h-3.5" />}
              {userSettings.isRobloxPlus && <RobloxPlusBadge className="w-3.5 h-3.5 ml-1" />}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#E3E5E8] dark:bg-zinc-800 my-1 mb-2" />

        {/* Main Navigation Sidebar Items (Locked to Top Bar) */}
        <div className="space-y-0.5 text-sm font-medium text-[#191919] dark:text-zinc-200">
          <button
            onClick={() => setActiveTab('robux')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'robux' ? 'bg-[#F2F4F5] dark:bg-zinc-800 font-bold text-[#191919] dark:text-white' : 'hover:bg-[#F2F4F5] dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Home className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
              <span>{getTranslation(lang, 'home')}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'profil' ? 'bg-[#F2F4F5] dark:bg-zinc-800 font-bold text-[#191919] dark:text-white' : 'hover:bg-[#F2F4F5] dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
              <span>{getTranslation(lang, 'profile')}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('nachrichten')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'nachrichten' ? 'bg-[#F2F4F5] dark:bg-zinc-800 font-bold text-[#191919] dark:text-white' : 'hover:bg-[#F2F4F5] dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
              <span>{getTranslation(lang, 'messages')}</span>
            </div>
            {userSettings.unreadMessagesCount > 0 && (
              <span className="bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold px-2 py-0.5 rounded-full">
                {userSettings.unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('verbinden')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              activeTab === 'verbinden' ? 'bg-[#F2F4F5] dark:bg-zinc-800 font-bold text-[#191919] dark:text-white' : 'hover:bg-[#F2F4F5] dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
              <span>{getTranslation(lang, 'connect')}</span>
            </div>
            <span className="bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold px-2 py-0.5 rounded-full">
              {userSettings.connectionCount}
            </span>
          </button>

          <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer">
            <Shirt className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
            <span>{getTranslation(lang, 'avatar')}</span>
          </div>

          <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer">
            <Package className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
            <span>{getTranslation(lang, 'inventory')}</span>
          </div>

          <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer">
            <Repeat className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
            <span>{getTranslation(lang, 'trade')}</span>
          </div>

          <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer">
            <Users className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
            <span>{getTranslation(lang, 'communities')}</span>
          </div>

          <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer">
            <FileText className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
            <span>{getTranslation(lang, 'blog')}</span>
          </div>

          <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer">
            <ShoppingBag className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
            <span>{getTranslation(lang, 'officialStore')}</span>
          </div>

          <div className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer">
            <Gift className="w-4 h-4 text-[#656668] dark:text-zinc-400" />
            <span>{getTranslation(lang, 'giftCards')}</span>
          </div>
        </div>
      </div>

      {/* Roblox Plus Button at Bottom (1:1 Match IMG_0370.jpeg) */}
      <div className="pt-3 mt-2">
        <button
          onClick={onOpenSettingsModal}
          className="w-full bg-[#191919] dark:bg-zinc-800 hover:bg-[#393B3D] dark:hover:bg-zinc-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-between transition-all shadow-2xs cursor-pointer"
        >
          <span>Roblox Plus</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

