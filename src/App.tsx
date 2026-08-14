import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RobuxPage } from './components/RobuxPage';
import { OtherViews } from './components/OtherViews';
import { SendRobuxModal } from './components/SendRobuxModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { UserSettings, RobloxFriend } from './types';
import { INITIAL_FRIENDS } from './data/friends';

import { fetchRobloxUserInfo } from './services/robloxApi';

const DEFAULT_USER_SETTINGS: UserSettings = {
  username: 'Guest',
  displayName: 'Guest',
  robuxCount: 0,
  hasVerifiedBadge: false,
  isRobloxPlus: false,
  theme: 'light',
  language: 'en',
  hasCompletedOnboarding: false,
  avatarType: 'default',
  unreadMessagesCount: 0,
  connectionCount: 0,
  limitedItemDays: 18,
};

export default function App() {
  // Navigation & UI Layout state
  const [activeTab, setActiveTab] = useState<string>('robux');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // User Settings state with localStorage persistence
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('roblox_user_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore fallback
    }
    return DEFAULT_USER_SETTINGS;
  });

  // Friends state with localStorage persistence
  const [friends, setFriends] = useState<RobloxFriend[]>(() => {
    try {
      const saved = localStorage.getItem('roblox_friends_list');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore fallback
    }
    return INITIAL_FRIENDS;
  });

  // Modals state
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply dark/light class to root element for Tailwind dark mode
  useEffect(() => {
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.theme]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('roblox_user_settings', JSON.stringify(userSettings));
    } catch {
      // ignore error
    }
  }, [userSettings]);

  // Fetch real Roblox avatar and user info for main user when username changes (and not Guest)
  useEffect(() => {
    let isMounted = true;
    if (userSettings.username && userSettings.username.toLowerCase() !== 'guest') {
      fetchRobloxUserInfo(userSettings.username).then((info) => {
        if (isMounted && info && info.avatarUrl) {
          setUserSettings((prev) => {
            const isManualCustom =
              prev.customAvatarUrl &&
              !prev.customAvatarUrl.includes('rbxcdn.com') &&
              !prev.customAvatarUrl.includes('roblox.com') &&
              prev.customAvatarUrl.startsWith('http');

            return {
              ...prev,
              displayName: info.displayName || prev.displayName || prev.username,
              customAvatarUrl: isManualCustom ? prev.customAvatarUrl : info.avatarUrl,
            };
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [userSettings.username]);

  // Save friends to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('roblox_friends_list', JSON.stringify(friends));
    } catch {
      // ignore error
    }
  }, [friends]);

  // Helper for showing temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Login via onboarding
  const handleLogin = (userData: { username: string; displayName: string; avatarUrl?: string; hasVerifiedBadge?: boolean }) => {
    setUserSettings((prev) => ({
      ...prev,
      username: userData.username,
      displayName: userData.displayName || userData.username,
      hasVerifiedBadge: !!userData.hasVerifiedBadge,
      customAvatarUrl: userData.avatarUrl || prev.customAvatarUrl,
      hasCompletedOnboarding: true,
    }));
    showToast(`Welcome, ${userData.displayName || userData.username}!`);
  };

  const handleContinueAsGuest = () => {
    setUserSettings((prev) => ({
      ...prev,
      username: 'Guest',
      displayName: 'Guest',
      customAvatarUrl: '',
      hasCompletedOnboarding: true,
    }));
    showToast('Browsing as Guest');
  };

  // Toggle Dark/Light Mode
  const handleToggleTheme = () => {
    setUserSettings((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
      return {
        ...prev,
        theme: nextTheme,
      };
    });
  };

  // Update user settings partial
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
    showToast('Settings updated successfully!');
  };


  // Send Robux logic
  const handleSendRobux = (recipientUsername: string, amount: number): boolean => {
    if (userSettings.robuxCount < amount) {
      return false; // Insufficient balance
    }

    // Deduct Robux
    setUserSettings((prev) => ({
      ...prev,
      robuxCount: prev.robuxCount - amount,
    }));

    showToast(`Sent ${amount.toLocaleString('en-US')} Robux to ${recipientUsername}!`);
    return true;
  };

  // Buy Robux logic (adds Robux to user's balance for interactive simulation)
  const handleBuyRobux = (amount: number, priceEur: string) => {
    setUserSettings((prev) => ({
      ...prev,
      robuxCount: prev.robuxCount + amount,
    }));
    showToast(`Successfully purchased ${amount.toLocaleString('en-US')} Robux for ${priceEur}!`);
  };

  // Friend actions
  const handleAddFriend = (newFriend: RobloxFriend) => {
    setFriends((prev) => [newFriend, ...prev]);
    showToast(`Added friend ${newFriend.username}!`);
  };

  const handleRemoveFriend = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
    showToast('Friend removed.');
  };

  const handleResetToDefaults = () => {
    setUserSettings(DEFAULT_USER_SETTINGS);
    setFriends(INITIAL_FRIENDS);
    localStorage.removeItem('roblox_user_settings');
    localStorage.removeItem('roblox_friends_list');
    showToast('Reset to defaults.');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111214] text-zinc-900 dark:text-zinc-100 font-sans antialiased flex flex-col selection:bg-zinc-800 selection:text-white transition-colors">
      {/* Enter Username Initial Onboarding Modal */}
      <OnboardingModal
        isOpen={!userSettings.hasCompletedOnboarding}
        onLogin={handleLogin}
        onContinueAsGuest={handleContinueAsGuest}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700 dark:border-zinc-300 flex items-center space-x-2 animate-in slide-in-from-bottom-5 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <Header
        userSettings={userSettings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSendModal={() => setIsSendModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Body Layout with 2 Independent Scrollable Areas (Sidebar & Robux Shop) */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-3.25rem)] bg-white dark:bg-[#111214] text-[#191919] dark:text-white">
        <Sidebar
          isOpen={isSidebarOpen}
          userSettings={userSettings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />

        {/* View Content Area with dedicated Scrollbar / Slidebar */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-white dark:bg-[#111214] relative">
          {activeTab === 'robux' ? (
            <RobuxPage
              userSettings={userSettings}
              onBuyRobux={handleBuyRobux}
              onOpenSendModal={() => setIsSendModalOpen(true)}
            />
          ) : (
            <OtherViews
              activeTab={activeTab}
              userSettings={userSettings}
              friends={friends}
              onOpenSendModal={() => setIsSendModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Send Robux Modal ("Robux Senden") */}
      <SendRobuxModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        userSettings={userSettings}
        friends={friends}
        onSendRobux={handleSendRobux}
      />

      {/* Settings Modal (User, Robux Count, Verified Badge) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userSettings={userSettings}
        onUpdateSettings={handleUpdateSettings}
        friends={friends}
        onAddFriend={handleAddFriend}
        onRemoveFriend={handleRemoveFriend}
        onResetToDefaults={handleResetToDefaults}
      />
    </div>
  );
}

