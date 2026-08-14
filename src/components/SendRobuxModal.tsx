import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Calendar, Users, Info } from 'lucide-react';
import { RobloxFriend, UserSettings } from '../types';
import { RobuxIcon, RobloxPlusBadge, VerifiedBadge } from './RobloxIcons';
import { RobloxAvatar } from './RobloxAvatar';
import { searchRobloxUsers, RobloxUserSearchResult } from '../services/robloxApi';
import { getTranslation } from '../utils/translations';

interface SendRobuxModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  friends: RobloxFriend[];
  onSendRobux: (recipientUsername: string, amount: number) => boolean;
}

type SendStep = 'select_user' | 'enter_amount' | 'confirm_send';

export const SendRobuxModal: React.FC<SendRobuxModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  friends,
  onSendRobux,
}) => {
  const lang = userSettings.language || 'en';
  const [step, setStep] = useState<SendStep>('select_user');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<{
    id?: string;
    username: string;
    avatarUrl?: string;
    hasVerifiedBadge?: boolean;
    hasBadge?: boolean;
  } | null>(null);
  const [sendAmount, setSendAmount] = useState<string>('0');
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Roblox API search states
  const [robloxSearchResults, setRobloxSearchResults] = useState<RobloxUserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setRobloxSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchRobloxUsers(query).then((results) => {
        setRobloxSearchResults(results);
        setIsSearching(false);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  // Filter friends list
  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (friend: { username: string; avatarUrl?: string; hasVerifiedBadge?: boolean; hasBadge?: boolean }) => {
    setSelectedFriend(friend);
    setStep('enter_amount');
    setSendSuccess(null);
    setErrorMessage(null);
  };

  const handleSelectRobloxSearchResult = (res: RobloxUserSearchResult) => {
    setSelectedFriend({
      username: res.username,
      avatarUrl: res.avatarUrl || '',
      hasVerifiedBadge: res.hasVerifiedBadge,
    });
    setStep('enter_amount');
    setSendSuccess(null);
    setErrorMessage(null);
  };

  const handleProceedToConfirm = () => {
    const amount = parseInt(sendAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage(lang === 'de' ? 'Bitte gib einen gültigen Robux-Betrag ein.' : 'Please enter a valid Robux amount.');
      return;
    }

    if (amount > userSettings.robuxCount) {
      setErrorMessage(lang === 'de'
        ? `Nicht genug Robux! Dein aktuelles Guthaben beträgt ${userSettings.robuxCount.toLocaleString('de-DE')} Robux.`
        : `Insufficient Robux! Your current balance is ${userSettings.robuxCount.toLocaleString('en-US')} Robux.`);
      return;
    }

    const recipient = selectedFriend ? selectedFriend.username : searchQuery.trim();
    if (!recipient) {
      setErrorMessage(lang === 'de' ? 'Kein Empfänger ausgewählt.' : 'No recipient selected.');
      return;
    }

    setErrorMessage(null);
    setStep('confirm_send');
  };

  const handleExecuteSend = () => {
    const amount = parseInt(sendAmount, 10);
    const recipient = selectedFriend ? selectedFriend.username : searchQuery.trim();

    if (isNaN(amount) || amount <= 0 || !recipient) {
      setErrorMessage(lang === 'de' ? 'Ungültige Überweisung.' : 'Invalid transfer.');
      return;
    }

    const success = onSendRobux(recipient, amount);
    if (success) {
      setSendSuccess(lang === 'de' 
        ? `${amount.toLocaleString('de-DE')} Robux erfolgreich an ${recipient} gesendet!` 
        : `Successfully sent ${amount.toLocaleString('en-US')} Robux to ${recipient}!`);
      setErrorMessage(null);
    } else {
      setErrorMessage(lang === 'de'
        ? `Nicht genug Robux! Dein aktuelles Guthaben beträgt ${userSettings.robuxCount.toLocaleString('de-DE')} Robux.`
        : `Insufficient Robux! Your current balance is ${userSettings.robuxCount.toLocaleString('en-US')} Robux.`);
    }
  };

  const handleBack = () => {
    if (step === 'confirm_send') {
      setStep('enter_amount');
      setErrorMessage(null);
    } else if (step === 'enter_amount') {
      setStep('select_user');
      setSelectedFriend(null);
      setErrorMessage(null);
    }
  };

  const resetView = () => {
    setStep('select_user');
    setSelectedFriend(null);
    setSendSuccess(null);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetView();
    setSearchQuery('');
    setSendAmount('0');
    onClose();
  };

  const parsedAmount = parseInt(sendAmount, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150 text-[#191919] dark:text-white">
      <div 
        className="bg-white dark:bg-[#1A1D20] text-[#191919] dark:text-white rounded-[24px] w-full max-w-[420px] shadow-2xl overflow-hidden border border-[#E3E5E8] dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header (1:1 Match IMG_0384.png, IMG_0385.png, IMG_0387.png) */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {step !== 'select_user' && !sendSuccess && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 rounded-full mr-0.5 text-[#191919] dark:text-white cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <RobloxPlusBadge className="w-5 h-5 text-[#191919] dark:text-white" />
            <h2 className="text-base md:text-lg font-bold text-[#191919] dark:text-white tracking-tight">
              {getTranslation(lang, 'sendRobuxTitle')}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* User Balance display in top right: ⬡ 1,594 */}
            <div className="flex items-center space-x-1 text-sm font-bold text-[#191919] dark:text-white">
              <RobuxIcon className="w-3.5 h-3.5 text-[#191919] dark:text-white" />
              <span>{userSettings.robuxCount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1 text-[#191919] dark:text-white hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-1">
          {sendSuccess ? (
            /* Sent Success Screen */
            <div className="py-6 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-[#191919] dark:text-white">Robux Sent!</h3>
              <p className="text-sm text-[#656668] dark:text-zinc-300 max-w-xs mx-auto font-medium">
                {sendSuccess}
              </p>
              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={resetView}
                  className="bg-[#E8EBEE] dark:bg-zinc-800 hover:bg-[#DCE0E6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Send to someone else
                </button>
                <button
                  onClick={handleClose}
                  className="bg-[#191919] dark:bg-white hover:bg-black dark:hover:bg-zinc-100 text-white dark:text-[#191919] font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 'select_user' ? (
            /* STEP 1: Search by username & Friends List (1:1 Match IMG_0384.png) */
            <div className="space-y-4">
              {/* Search by username input box */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getTranslation(lang, 'searchByUsername')}
                  className="w-full bg-transparent border border-[#CED2D6] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-[#191919] dark:text-white placeholder:text-[#8D9094] dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#191919] dark:focus:border-white transition-colors"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D9094] hover:text-[#191919] dark:hover:text-white p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : isSearching ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D9094]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : null}
              </div>

              {/* Friends & Search Results Section */}
              <div className="space-y-2">
                <div className="text-sm font-bold text-[#191919] dark:text-white">
                  {getTranslation(lang, 'myFriends')} ({filteredFriends.length})
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {/* Live Roblox Search Results if query exists */}
                  {searchQuery.trim().length > 0 && robloxSearchResults.length > 0 && (
                    <div className="space-y-1 mb-2 pb-2 border-b border-[#E3E5E8] dark:border-zinc-800">
                      <div className="text-[11px] font-bold text-[#8D9094] uppercase tracking-wider px-1">
                        Roblox ({robloxSearchResults.length})
                      </div>
                      {robloxSearchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectRobloxSearchResult(user)}
                          className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#E3E5E8] dark:bg-zinc-700 shrink-0 flex items-center justify-center">
                            <RobloxAvatar username={user.username} customUrl={user.avatarUrl || undefined} />
                          </div>
                          <div className="flex items-center space-x-1 text-sm font-semibold text-[#191919] dark:text-white truncate">
                            <span className="truncate">{user.displayName || user.username}</span>
                            {user.hasVerifiedBadge && <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback direct selection if custom username typed */}
                  {searchQuery.trim().length > 0 && filteredFriends.length === 0 && robloxSearchResults.length === 0 && !isSearching && (
                    <div 
                      onClick={() => handleSelectUser({ username: searchQuery.trim() })}
                      className="p-3 bg-[#F2F4F5] dark:bg-zinc-800/70 rounded-xl cursor-pointer hover:bg-[#E8EBEE] dark:hover:bg-zinc-800 text-center space-y-1"
                    >
                      <div className="text-xs text-[#8D9094]">Send to typed user:</div>
                      <div className="text-sm font-bold text-[#191919] dark:text-white">
                        &quot;{searchQuery.trim()}&quot;
                      </div>
                    </div>
                  )}

                  {/* Filtered Friends List (1:1 Match IMG_0384.png rows) */}
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => handleSelectUser(friend)}
                      className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-zinc-800/80 cursor-pointer transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#E3E5E8] dark:bg-zinc-700 shrink-0 flex items-center justify-center">
                        <RobloxAvatar username={friend.username} customUrl={friend.avatarUrl} />
                      </div>
                      <div className="flex items-center space-x-1 min-w-0">
                        <span className="text-sm font-semibold text-[#191919] dark:text-white group-hover:text-black dark:group-hover:text-white truncate">
                          {friend.username}
                        </span>
                        {friend.hasBadge && <RobloxPlusBadge className="w-3.5 h-3.5 text-[#191919] dark:text-white shrink-0 ml-0.5" />}
                        {friend.badgeType === 'verified' && <VerifiedBadge className="w-3.5 h-3.5 shrink-0 ml-0.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : step === 'enter_amount' ? (
            /* STEP 2: Send Robux Amount Screen (1:1 Match IMG_0385.png) */
            <div className="space-y-6 pt-2 pb-1 text-center animate-in fade-in duration-150">
              {/* Centered Avatar (1:1 Match IMG_0385.png) */}
              <div className="flex flex-col items-center justify-center space-y-1.5 pt-2">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#E3E5E8] dark:bg-zinc-800 border-2 border-[#E3E5E8] dark:border-zinc-700 shadow-sm flex items-center justify-center shrink-0">
                  <RobloxAvatar username={selectedFriend?.username || 'Roblox'} customUrl={selectedFriend?.avatarUrl} />
                </div>
                <div className="flex items-center justify-center space-x-1.5 text-sm font-bold text-[#191919] dark:text-white">
                  <span>{selectedFriend?.username}</span>
                  {selectedFriend?.hasVerifiedBadge && <VerifiedBadge className="w-3.5 h-3.5" />}
                  {selectedFriend?.hasBadge && <RobloxPlusBadge className="w-3.5 h-3.5 text-[#191919] dark:text-white" />}
                </div>
              </div>

              {/* Centered Large Robux Amount Display (1:1 Match IMG_0385.png: ⬡ 0) */}
              <div className="flex items-center justify-center space-x-2 py-1">
                <RobuxIcon className="w-9 h-9 text-[#191919] dark:text-white shrink-0" />
                <input
                  type="number"
                  min="0"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="w-36 text-center font-black text-4xl md:text-5xl text-[#191919] dark:text-white bg-transparent focus:outline-none transition-colors"
                  placeholder="0"
                  autoFocus
                />
              </div>

              {/* 4 Preset Buttons: [ ⬡ 25 ] [ ⬡ 50 ] [ ⬡ 100 ] [ ⬡ 200 ] (1:1 Match IMG_0385.png) */}
              <div className="grid grid-cols-4 gap-2 px-1">
                {['25', '50', '100', '200'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSendAmount(amt)}
                    className={`py-2.5 px-1.5 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center space-x-1 transition-all shadow-2xs cursor-pointer ${
                      sendAmount === amt
                        ? 'bg-[#191919] dark:bg-white text-white dark:text-[#191919]'
                        : 'bg-[#E8EBEE] dark:bg-zinc-800 hover:bg-[#DCE0E6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white'
                    }`}
                  >
                    <RobuxIcon className={`w-3.5 h-3.5 shrink-0 ${sendAmount === amt ? 'text-white dark:text-[#191919]' : 'text-[#191919] dark:text-white'}`} />
                    <span>{amt}</span>
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-start space-x-2 font-semibold text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Next Button & Subtitle (1:1 Match IMG_0385.png: Periwinkle "Next" button + subtitle) */}
              <div className="pt-2 space-y-2.5">
                <button
                  onClick={handleProceedToConfirm}
                  className="w-full bg-[#8598F7] hover:bg-[#7387F5] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-xs transition-all text-base cursor-pointer"
                >
                  {getTranslation(lang, 'next')}
                </button>
                <p className="text-xs text-[#656668] dark:text-zinc-400 font-normal tracking-tight">
                  {getTranslation(lang, 'robloxAreSent')}
                </p>
              </div>
            </div>
          ) : (
            /* STEP 3: Final Review & Confirmation Dialog (EXACT 1:1 Match IMG_0387.png) */
            <div className="space-y-4 pt-1 pb-1 animate-in fade-in duration-150">
              {/* Recipient Profile Card (IMG_0387.png) */}
              <div className="bg-[#F2F4F5] dark:bg-[#23272A] rounded-2xl p-4 flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white dark:bg-zinc-800 border-2 border-white/80 dark:border-zinc-700 shadow-xs flex items-center justify-center shrink-0">
                  <RobloxAvatar username={selectedFriend?.username || 'Roblox'} customUrl={selectedFriend?.avatarUrl} />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-[#191919] dark:text-white flex items-center justify-center space-x-1">
                    <span>{selectedFriend?.username}</span>
                    {selectedFriend?.hasVerifiedBadge && <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                  <div className="text-xs text-[#656668] dark:text-zinc-400">
                    @{selectedFriend?.username}
                  </div>
                </div>

                {/* Info row with Connected days and Mutual friends */}
                <div className="pt-2 flex items-center justify-center space-x-3 text-xs text-[#4A4D52] dark:text-zinc-300 font-medium">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#656668] dark:text-zinc-400" />
                    <span>{getTranslation(lang, 'connectedDays', { days: 20 })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-[#656668] dark:text-zinc-400" />
                    <span>{getTranslation(lang, 'mutualFriend')}</span>
                  </div>
                </div>

                {/* Joined Year Info */}
                <div className="flex items-center justify-center space-x-1 text-xs text-[#4A4D52] dark:text-zinc-300 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#656668] dark:text-zinc-400" />
                  <span>{getTranslation(lang, 'joinedIn', { year: 2025 })}</span>
                </div>
              </div>

              {/* Robux Amount Card (IMG_0387.png) */}
              <div className="bg-[#F2F4F5] dark:bg-[#23272A] rounded-2xl py-4 px-4 text-center space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-2xl md:text-3xl font-extrabold text-[#191919] dark:text-white">
                  <RobuxIcon className="w-6 h-6 text-[#191919] dark:text-white shrink-0" />
                  <span>{parsedAmount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</span>
                </div>
                <div className="text-xs text-[#656668] dark:text-zinc-400">
                  {getTranslation(lang, 'recipientWillGet', { amount: parsedAmount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US') })}
                </div>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-start space-x-2 font-semibold text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons: [ Send ] and [ Edit ] (1:1 Match IMG_0387.png) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleExecuteSend}
                  className="w-full bg-[#3871F5] hover:bg-[#2563EB] active:scale-[0.99] text-white font-bold py-3 rounded-xl shadow-xs transition-all text-sm cursor-pointer"
                >
                  {getTranslation(lang, 'send')}
                </button>
                <button
                  onClick={handleBack}
                  className="w-full bg-[#E3E5E8] dark:bg-zinc-800 hover:bg-[#D5D8DC] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  {getTranslation(lang, 'edit')}
                </button>
              </div>

              {/* Disclaimer Text (1:1 Match IMG_0387.png) */}
              <p className="text-[11px] leading-relaxed text-[#8D9094] dark:text-zinc-400 text-center px-1">
                {getTranslation(lang, 'sendRobuxDisclaimer')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

