import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Calendar, Users, Info, Sparkles, ShieldCheck, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RobloxFriend, UserSettings } from '../types';
import { RobuxIcon, RobloxPlusBadge, VerifiedBadge } from './RobloxIcons';
import { RobloxAvatar } from './RobloxAvatar';
import { searchRobloxUsers, RobloxUserSearchResult } from '../services/robloxApi';
import { getTranslation } from '../utils/translations';
import { playCoinWhooshSound, playSendSuccessSound } from '../utils/audio';

interface SendRobuxModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  friends: RobloxFriend[];
  onSendRobux: (recipientUsername: string, amount: number) => boolean;
}

type SendStep = 'select_user' | 'enter_amount' | 'confirm_send' | 'sending';

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
  const [sendSuccessData, setSendSuccessData] = useState<{
    recipient: string;
    amount: number;
    avatarUrl?: string;
    transactionId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Roblox API search states
  const [robloxSearchResults, setRobloxSearchResults] = useState<RobloxUserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Animation transfer states
  const [transferProgress, setTransferProgress] = useState(0);
  const [animatedRobuxCount, setAnimatedRobuxCount] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

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

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // Filter friends list
  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (friend: { username: string; avatarUrl?: string; hasVerifiedBadge?: boolean; hasBadge?: boolean }) => {
    setSelectedFriend(friend);
    setStep('enter_amount');
    setSendSuccessData(null);
    setErrorMessage(null);
  };

  const handleSelectRobloxSearchResult = (res: RobloxUserSearchResult) => {
    setSelectedFriend({
      username: res.username,
      avatarUrl: res.avatarUrl || '',
      hasVerifiedBadge: res.hasVerifiedBadge,
    });
    setStep('enter_amount');
    setSendSuccessData(null);
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

  const triggerConfetti = () => {
    try {
      // Primary celebratory burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00A2FF', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#FFFFFF'],
        ticks: 200,
        gravity: 1.1,
        scalar: 1.2,
      });

      // Secondary glitter burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.2, y: 0.65 },
          colors: ['#F59E0B', '#10B981', '#00A2FF'],
          ticks: 180,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.8, y: 0.65 },
          colors: ['#F59E0B', '#10B981', '#00A2FF'],
          ticks: 180,
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  };

  const handleExecuteSend = () => {
    const amount = parseInt(sendAmount, 10);
    const recipient = selectedFriend ? selectedFriend.username : searchQuery.trim();

    if (isNaN(amount) || amount <= 0 || !recipient) {
      setErrorMessage(lang === 'de' ? 'Ungültige Überweisung.' : 'Invalid transfer.');
      return;
    }

    if (amount > userSettings.robuxCount) {
      setErrorMessage(lang === 'de'
        ? `Nicht genug Robux! Dein aktuelles Guthaben beträgt ${userSettings.robuxCount.toLocaleString('de-DE')} Robux.`
        : `Insufficient Robux! Your current balance is ${userSettings.robuxCount.toLocaleString('en-US')} Robux.`);
      return;
    }

    // Begin animated sending phase
    setStep('sending');
    setTransferProgress(0);
    setAnimatedRobuxCount(0);
    setErrorMessage(null);

    // Trigger subtle initial whoosh sound
    playCoinWhooshSound();

    const startTime = Date.now();
    const duration = 1350; // Single smooth 1.35s spin & checkmark draw

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      setTransferProgress(Math.round(progress * 100));
      setAnimatedRobuxCount(Math.round(progress * amount));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation finished!
        const success = onSendRobux(recipient, amount);
        if (success) {
          const randomId = 'RBX-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
          setSendSuccessData({
            recipient,
            amount,
            avatarUrl: selectedFriend?.avatarUrl,
            transactionId: randomId,
          });
          playSendSuccessSound();
          triggerConfetti();
        } else {
          setErrorMessage(lang === 'de'
            ? `Nicht genug Robux! Dein aktuelles Guthaben beträgt ${userSettings.robuxCount.toLocaleString('de-DE')} Robux.`
            : `Insufficient Robux! Your current balance is ${userSettings.robuxCount.toLocaleString('en-US')} Robux.`);
          setStep('confirm_send');
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
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
    setSendSuccessData(null);
    setErrorMessage(null);
    setTransferProgress(0);
    setAnimatedRobuxCount(0);
  };

  const handleClose = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    resetView();
    setSearchQuery('');
    setSendAmount('0');
    onClose();
  };

  const parsedAmount = parseInt(sendAmount, 10) || 0;
  const recipientName = selectedFriend?.username || searchQuery.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 text-[#191919] dark:text-white">
      <div 
        className="bg-white dark:bg-[#1A1D20] text-[#191919] dark:text-white rounded-[28px] w-full max-w-[440px] shadow-2xl overflow-hidden border border-[#E3E5E8] dark:border-zinc-800 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#F2F4F5] dark:border-zinc-800/80">
          <div className="flex items-center space-x-2">
            {step !== 'select_user' && step !== 'sending' && !sendSuccessData && (
              <button
                onClick={handleBack}
                className="p-1.5 hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 rounded-full mr-0.5 text-[#191919] dark:text-white cursor-pointer transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="p-1 bg-[#F2F4F5] dark:bg-zinc-800 rounded-lg">
              <RobloxPlusBadge className="w-4 h-4 text-[#191919] dark:text-white" />
            </div>
            <h2 className="text-base font-bold text-[#191919] dark:text-white tracking-tight">
              {getTranslation(lang, 'sendRobuxTitle')}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* User Balance display in top right: ⬡ 1,594 */}
            <div className="flex items-center space-x-1.5 bg-[#F2F4F5] dark:bg-zinc-800/80 px-2.5 py-1 rounded-full text-xs font-bold text-[#191919] dark:text-white">
              <RobuxIcon className="w-3.5 h-3.5 text-[#191919] dark:text-white shrink-0" />
              <span>{userSettings.robuxCount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 text-[#656668] hover:text-[#191919] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              title={lang === 'de' ? 'Schließen (X)' : 'Exit (X)'}
              aria-label="Exit"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-4">
          {/* ========================================================================= */}
          {/* STAGE: VERIFICATION CIRCLE WITH CHECKMARK (1 ROTATION)                   */}
          {/* ========================================================================= */}
          {step === 'sending' ? (
            <div className="py-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              {/* Central Verified Circle with 1 Rotation + Checkmark Draw */}
              <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
                {/* Background glow when finished */}
                <div 
                  className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    transferProgress > 70 ? 'bg-emerald-500/20 scale-110 blur-md' : 'bg-transparent'
                  }`} 
                />

                {/* The Rotating Circle SVG that completes 1 turn & draws the checkmark */}
                <svg 
                  className="w-24 h-24 transform -rotate-90 animate-spin-once" 
                  viewBox="0 0 100 100"
                >
                  {/* Track Background */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-[#E3E5E8] dark:text-zinc-800"
                  />
                  {/* Active Drawing Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={transferProgress > 70 ? '#10B981' : '#00A2FF'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="animate-draw-circle transition-colors duration-300"
                  />
                </svg>

                {/* The Checkmark (Häkchen) that pops and draws inside after rotation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-emerald-500 animate-draw-check" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              {/* Status Text and Summary */}
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <h3 className="text-xl font-black text-[#191919] dark:text-white tracking-tight">
                  {transferProgress > 75 
                    ? (lang === 'de' ? 'Verifiziert & Gesendet!' : 'Verified & Sent!')
                    : (lang === 'de' ? 'Robux werden übertragen...' : 'Transferring Robux...')}
                </h3>
                <div className="flex items-center justify-center space-x-1.5 text-sm font-bold text-[#656668] dark:text-zinc-400">
                  <RobuxIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[#191919] dark:text-white font-extrabold">{parsedAmount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')} R$</span>
                  <span>{lang === 'de' ? 'an' : 'to'}</span>
                  <span className="text-[#191919] dark:text-white font-extrabold">@{recipientName}</span>
                </div>
              </div>

              {/* Verification Subtitle */}
              <div className="flex items-center justify-center space-x-1.5 text-xs text-[#8D9094] dark:text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{lang === 'de' ? 'Roblox Instant Verification' : 'Roblox Instant Verification'}</span>
              </div>

              {/* Exit / Abbrechen Button during sending */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8D9094] hover:text-[#191919] dark:text-zinc-400 dark:hover:text-white bg-[#F2F4F5] dark:bg-zinc-800 hover:bg-[#E3E5E8] dark:hover:bg-zinc-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === 'de' ? 'Abbrechen (X)' : 'Cancel (X)'}</span>
                </button>
              </div>
            </div>
          ) : sendSuccessData ? (
            /* ========================================================================= */
            /* STAGE: GRAND SUCCESS CELEBRATION CARD                                    */
            /* ========================================================================= */
            <div className="py-4 space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
              {/* Grand Glowing Success Check Badge */}
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Success Heading */}
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'de' ? 'Erfolgreich Gesendet!' : 'Transfer Successful!'}</span>
                </div>
                <h3 className="text-2xl font-black text-[#191919] dark:text-white tracking-tight">
                  {lang === 'de' ? 'Robux Überwiesen' : 'Robux Delivered'}
                </h3>
              </div>

              {/* Large Amount Showcase Badge */}
              <div className="p-4 bg-gradient-to-br from-[#F4FDF7] to-[#E6F9EE] dark:from-emerald-950/30 dark:to-emerald-900/10 border-2 border-emerald-500/30 rounded-2xl space-y-1 shadow-sm">
                <div className="flex items-center justify-center space-x-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  <RobuxIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="tabular-nums">
                    +{sendSuccessData.amount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#656668] dark:text-zinc-300">
                  {lang === 'de' ? 'Gesendet an' : 'Sent to'}{' '}
                  <span className="font-bold text-[#191919] dark:text-white">@{sendSuccessData.recipient}</span>
                </div>
              </div>

              {/* Transaction Receipt Details */}
              <div className="bg-[#F2F4F5] dark:bg-[#23272A] rounded-2xl p-3.5 space-y-2 text-left text-xs text-[#656668] dark:text-zinc-300 border border-[#E3E5E8] dark:border-zinc-800">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E3E5E8] dark:border-zinc-700">
                  <span>{lang === 'de' ? 'Transaktions-ID' : 'Transaction ID'}</span>
                  <span className="font-mono font-bold text-[#191919] dark:text-white">{sendSuccessData.transactionId}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E3E5E8] dark:border-zinc-700">
                  <span>{lang === 'de' ? 'Neues Guthaben' : 'Remaining Balance'}</span>
                  <div className="flex items-center space-x-1 font-bold text-[#191919] dark:text-white">
                    <RobuxIcon className="w-3 h-3" />
                    <span>{userSettings.robuxCount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>{lang === 'de' ? 'Status' : 'Status'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{lang === 'de' ? 'Abgeschlossen' : 'Completed'}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={resetView}
                  className="flex-1 bg-[#E8EBEE] dark:bg-zinc-800 hover:bg-[#DCE0E6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'de' ? 'Noch mehr senden' : 'Send More'}</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-[#191919] dark:bg-white hover:bg-black dark:hover:bg-zinc-100 text-white dark:text-[#191919] font-bold py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>{lang === 'de' ? 'Fertig' : 'Done'}</span>
                </button>
              </div>
            </div>
          ) : step === 'select_user' ? (
            /* ========================================================================= */
            /* STAGE 1: SEARCH USER / FRIENDS LIST                                      */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Search by username input box */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        e.preventDefault();
                        handleSelectUser({ username: searchQuery.trim() });
                      }
                    }}
                    placeholder={getTranslation(lang, 'searchByUsername')}
                    autoFocus
                    className="w-full bg-transparent border border-[#CED2D6] dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-[#191919] dark:text-white placeholder:text-[#8D9094] dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#191919] dark:focus:border-white transition-colors pr-9"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D9094] hover:text-[#191919] dark:hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : isSearching ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D9094]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* User Selection List */}
              <div className="space-y-2">
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {/* DIRECT SELECTION CARD for the typed username */}
                  {searchQuery.trim().length > 0 && (
                    <div
                      onClick={() => handleSelectUser({ username: searchQuery.trim() })}
                      className="p-3 bg-[#F2F4F5] dark:bg-zinc-800/90 hover:bg-[#E8EBEE] dark:hover:bg-zinc-700/90 border-2 border-[#191919]/20 dark:border-white/20 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-zinc-700 shrink-0 flex items-center justify-center border border-[#E3E5E8] dark:border-zinc-600">
                          <RobloxAvatar username={searchQuery.trim()} />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="text-xs font-semibold text-[#656668] dark:text-zinc-400">
                            {lang === 'de' ? 'Direkt an Benutzer senden:' : 'Send directly to:'}
                          </div>
                          <div className="text-sm font-black text-[#191919] dark:text-white truncate">
                            @{searchQuery.trim()}
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#191919] dark:bg-white text-white dark:text-[#191919] text-xs font-bold px-3 py-1.5 rounded-lg group-hover:scale-105 transition-transform shrink-0 ml-2">
                        {lang === 'de' ? 'Auswählen ↵' : 'Select ↵'}
                      </div>
                    </div>
                  )}

                  {/* Live Roblox Search Results if query exists */}
                  {searchQuery.trim().length > 0 && robloxSearchResults.length > 0 && (
                    <div className="space-y-1 pt-1 pb-1">
                      <div className="text-[11px] font-bold text-[#8D9094] uppercase tracking-wider px-1">
                        {getTranslation(lang, 'robloxResults')} ({robloxSearchResults.length})
                      </div>
                      {robloxSearchResults.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectRobloxSearchResult(user)}
                          className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E3E5E8] dark:bg-zinc-700 shrink-0 flex items-center justify-center">
                            <RobloxAvatar username={user.username} customUrl={user.avatarUrl || undefined} />
                          </div>
                          <div className="flex items-center space-x-1 text-sm font-semibold text-[#191919] dark:text-white truncate">
                            <span>{user.displayName}</span>
                            <span className="text-xs text-[#8D9094] truncate">(@{user.username})</span>
                            {user.hasVerifiedBadge && <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Friends / Recent List */}
                  <div className="pt-1">
                    <div className="text-xs font-bold text-[#656668] dark:text-zinc-400 mb-1 px-1">
                      {getTranslation(lang, 'myFriends')} ({filteredFriends.length})
                    </div>
                    {filteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => handleSelectUser(friend)}
                        className="flex items-center space-x-2.5 px-2.5 py-2 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-zinc-800/80 cursor-pointer transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E3E5E8] dark:bg-zinc-700 shrink-0 flex items-center justify-center">
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
            </div>
          ) : step === 'enter_amount' ? (
            /* ========================================================================= */
            /* STAGE 2: ENTER ROBUX AMOUNT                                              */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Selected recipient header */}
              <div className="flex items-center space-x-3 p-3 bg-[#F2F4F5] dark:bg-[#23272A] rounded-2xl">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-zinc-800 shrink-0 flex items-center justify-center border border-[#E3E5E8] dark:border-zinc-700">
                  <RobloxAvatar username={selectedFriend?.username || 'Roblox'} customUrl={selectedFriend?.avatarUrl} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs text-[#8D9094]">{getTranslation(lang, 'recipient')}</div>
                  <div className="text-sm font-bold text-[#191919] dark:text-white truncate flex items-center space-x-1">
                    <span>{selectedFriend?.username}</span>
                    {selectedFriend?.hasVerifiedBadge && <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                </div>
                <button
                  onClick={() => setStep('select_user')}
                  className="text-xs font-bold text-[#3871F5] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {getTranslation(lang, 'edit')}
                </button>
              </div>

              {/* Amount of Robux Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#656668] dark:text-zinc-300 block text-left">
                  {getTranslation(lang, 'amountOfRobux')}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none">
                    <RobuxIcon className="w-5 h-5 text-[#191919] dark:text-white" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={userSettings.robuxCount}
                    value={sendAmount === '0' ? '' : sendAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSendAmount(val === '' ? '0' : val);
                      setErrorMessage(null);
                    }}
                    placeholder="0"
                    autoFocus
                    className="w-full bg-transparent border border-[#CED2D6] dark:border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-[#191919] dark:text-white placeholder:text-[#8D9094] dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#191919] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Quick Amount presets */}
              <div className="grid grid-cols-4 gap-2">
                {['100', '500', '1000', `${userSettings.robuxCount}`].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSendAmount(amt);
                      setErrorMessage(null);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer ${
                      sendAmount === amt
                        ? 'bg-[#191919] dark:bg-white text-white dark:text-[#191919]'
                        : 'bg-[#E8EBEE] dark:bg-zinc-800 hover:bg-[#DCE0E6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white'
                    }`}
                  >
                    <RobuxIcon className={`w-3.5 h-3.5 shrink-0 ${sendAmount === amt ? 'text-white dark:text-[#191919]' : 'text-[#191919] dark:text-white'}`} />
                    <span>{amt === `${userSettings.robuxCount}` ? 'Max' : amt}</span>
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

              {/* Next Button & Subtitle */}
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
            /* ========================================================================= */
            /* STAGE 3: CONFIRM & EXECUTE SEND                                          */
            /* ========================================================================= */
            <div className="space-y-4 pt-1 pb-1 animate-in fade-in duration-150">
              {/* Recipient Profile Card */}
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

              {/* Robux Amount Card */}
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

              {/* Action Buttons: [ Send ] and [ Edit ] */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleExecuteSend}
                  className="w-full bg-[#3871F5] hover:bg-[#2563EB] active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm cursor-pointer flex items-center justify-center space-x-1.5 group"
                >
                  <span>{getTranslation(lang, 'send')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={handleBack}
                  className="w-full bg-[#E3E5E8] dark:bg-zinc-800 hover:bg-[#D5D8DC] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  {getTranslation(lang, 'edit')}
                </button>
              </div>

              {/* Disclaimer Text */}
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
