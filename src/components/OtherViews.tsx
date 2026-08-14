import React from 'react';
import { UserSettings, RobloxFriend } from '../types';
import { VerifiedBadge, RobloxPlusBadge, RobuxIcon, CrownGraphic } from './RobloxIcons';
import { MessageSquare, Users, Sparkles, Send } from 'lucide-react';
import { RobloxAvatar } from './RobloxAvatar';

interface OtherViewsProps {
  activeTab: string;
  userSettings: UserSettings;
  friends: RobloxFriend[];
  onOpenSendModal: () => void;
  onOpenSettingsModal: () => void;
}

export const OtherViews: React.FC<OtherViewsProps> = ({
  activeTab,
  userSettings,
  friends,
  onOpenSendModal,
  onOpenSettingsModal,
}) => {
  if (activeTab === 'marktplatz') {
    const marketplaceItems = [
      {
        id: '1',
        title: 'Golden Crown of Ozymandias',
        price: 24000,
        creator: 'Roblox',
        verified: true,
        type: 'Limited',
      },
      {
        id: '2',
        title: 'Dominus Empyreus',
        price: 8500000,
        creator: 'Roblox',
        verified: true,
        type: 'Limited',
      },
      {
        id: '3',
        title: 'Violet Sparkle Time Fedora',
        price: 120000,
        creator: 'Roblox',
        verified: true,
        type: 'Limited',
      },
      {
        id: '4',
        title: 'Headless Horseman',
        price: 31000,
        creator: 'Roblox',
        verified: true,
        type: 'Bundle',
      },
    ];

    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6 text-[#191919] dark:text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Marketplace</h1>
          <button
            onClick={onOpenSendModal}
            className="flex items-center space-x-1.5 bg-[#191919] dark:bg-white text-white dark:text-[#191919] px-4 py-2 rounded-xl text-xs font-black hover:bg-[#393B3D] dark:hover:bg-zinc-200 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Robux</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketplaceItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl p-4 space-y-3 hover:border-[#BDC1C6] dark:hover:border-zinc-700 transition-colors group cursor-pointer shadow-xs"
            >
              <div className="w-full h-40 bg-[#F2F4F5] dark:bg-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                <CrownGraphic className="w-28 h-28 group-hover:scale-105 transition-transform" />
                <span className="absolute top-2 left-2 bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-[10px] font-bold px-2 py-0.5 rounded">
                  {item.type}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#191919] dark:text-white truncate">{item.title}</h3>
                <div className="flex items-center space-x-1 text-xs text-[#656668] dark:text-zinc-400 mt-0.5">
                  <span>{item.creator}</span>
                  {item.verified && <VerifiedBadge />}
                </div>
                <div className="flex items-center space-x-1 mt-2 font-black text-sm text-[#191919] dark:text-white">
                  <RobuxIcon className="w-4 h-4 text-[#191919] dark:text-white" />
                  <span>{item.price.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'profil') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 text-[#191919] dark:text-white">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#F2F4F5] dark:bg-zinc-800 border-2 border-[#BDC1C6] dark:border-zinc-700 shrink-0">
            <RobloxAvatar username={userSettings.username} customUrl={userSettings.customAvatarUrl} />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start space-x-1.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-[#191919] dark:text-white tracking-tight">
                {userSettings.username}
              </h1>
              {userSettings.hasVerifiedBadge && <VerifiedBadge className="w-6 h-6" />}
              {userSettings.isRobloxPlus && <RobloxPlusBadge className="w-6 h-6" />}
            </div>

            <p className="text-xs md:text-sm text-[#656668] dark:text-zinc-400 font-semibold">
              @{userSettings.username}
            </p>

            <div className="flex justify-center md:justify-start space-x-6 text-xs md:text-sm text-[#656668] dark:text-zinc-400 font-semibold pt-1">
              <div><span className="text-[#191919] dark:text-white font-bold">{friends.length}</span> Friends</div>
              <div><span className="text-[#191919] dark:text-white font-bold">{userSettings.connectionCount}</span> Connections</div>
              <div className="flex items-center space-x-1">
                <RobuxIcon className="w-4 h-4 text-[#191919] dark:text-white" />
                <span className="text-[#191919] dark:text-white font-bold">{userSettings.robuxCount.toLocaleString('en-US')}</span> Robux
              </div>
            </div>

            <div className="pt-3 flex flex-wrap justify-center md:justify-start gap-2">
              <button
                onClick={onOpenSendModal}
                className="bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#393B3D] dark:hover:bg-zinc-200 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Robux</span>
              </button>
              <button
                onClick={onOpenSettingsModal}
                className="bg-[#F2F4F5] dark:bg-zinc-800 hover:bg-[#E3E5E8] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-[#E3E5E8] dark:border-zinc-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Friends Grid */}
        <div className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#191919] dark:text-white">Friends ({friends.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {friends.map((friend) => (
              <div key={friend.id} className="text-center p-2 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 border border-[#E3E5E8] dark:border-zinc-800 transition-colors">
                <div className="w-14 h-14 rounded-full mx-auto overflow-hidden bg-[#F2F4F5] dark:bg-zinc-800 border border-[#BDC1C6] dark:border-zinc-700">
                  <RobloxAvatar username={friend.username} customUrl={friend.avatarUrl} />
                </div>
                <div className="text-xs font-bold text-[#191919] dark:text-white truncate mt-1.5">{friend.username}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'nachrichten') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-4 text-[#191919] dark:text-white">
        <h1 className="text-2xl font-bold">Messages (7)</h1>
        <div className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl divide-y divide-[#E3E5E8] dark:divide-zinc-800 overflow-hidden shadow-2xs">
          {[
            { sender: 'Roblox System', title: 'Welcome to Roblox!', time: '2 hours ago' },
            { sender: 'SpyderAleks', title: 'Hey, want to trade Robux?', time: 'Yesterday' },
            { sender: 'LUCIAN090', title: 'Should we meet in Blox Fruits?', time: '2 days ago' },
            { sender: 'xxKimba23xx', title: 'Thanks for the Robux!', time: '3 days ago' },
            { sender: 'Roblox Billing', title: 'Your transaction was successful', time: '4 days ago' },
            { sender: 'Alex', title: 'Friend request accepted', time: '5 days ago' },
            { sender: 'tgs_rain', title: 'New event in game!', time: '1 week ago' },
          ].map((msg, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#F2F4F5] dark:bg-zinc-800 flex items-center justify-center text-[#191919] dark:text-white font-bold shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#191919] dark:text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#191919] dark:text-white">{msg.sender}</div>
                  <div className="text-xs text-[#656668] dark:text-zinc-400">{msg.title}</div>
                </div>
              </div>
              <div className="text-xs text-[#656668] dark:text-zinc-400 font-medium">{msg.time}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback Home feed
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-[#191919] dark:text-white">
      <div className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 text-[#191919] dark:text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-black">Welcome back, {userSettings.username}!</h1>
          <p className="text-xs text-[#656668] dark:text-zinc-400">Discover new experiences or send Robux to your friends.</p>
        </div>
        <button
          onClick={onOpenSendModal}
          className="bg-[#191919] dark:bg-white text-white dark:text-[#191919] hover:bg-[#393B3D] dark:hover:bg-zinc-200 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          Send Robux
        </button>
      </div>

      {/* Featured Games */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Popular Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Blox Fruits', playing: '420.5K Playing', category: 'Adventure' },
            { title: 'Brookhaven 🏡 RP', playing: '310.2K Playing', category: 'Roleplay' },
            { title: 'Adopt Me!', playing: '185.0K Playing', category: 'Simulation' },
          ].map((game, i) => (
            <div key={i} className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl p-4 space-y-2 hover:border-[#BDC1C6] dark:hover:border-zinc-700 transition-colors shadow-2xs">
              <div className="w-full h-32 bg-[#F2F4F5] dark:bg-zinc-800 rounded-xl flex items-center justify-center text-[#656668] dark:text-zinc-400">
                <Sparkles className="w-8 h-8 text-[#191919] dark:text-white" />
              </div>
              <h3 className="font-bold text-sm">{game.title}</h3>
              <p className="text-xs text-[#656668] dark:text-zinc-400">{game.playing} • {game.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
