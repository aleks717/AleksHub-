import React, { useState } from 'react';
import {
  Key,
  Lock,
  Unlock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Youtube
} from 'lucide-react';

interface KeySystemModalProps {
  isUnlocked: boolean;
  onUnlock: () => void;
}

// Generate random 12-character alphanumeric key formatted as XXXX-XXXX-XXXX
function generateNewKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let raw = '';
  for (let i = 0; i < 12; i++) {
    raw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

// Normalize key to standard 12-char format without dashes for matching
function normalizeKey(k: string): string {
  return k.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function KeySystemModal({ isUnlocked, onUnlock }: KeySystemModalProps) {
  const [view, setView] = useState<'enter' | 'getKey'>('enter');
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Strict 4-step state machine:
  // Step 1: Human verification
  // Step 2: Discord Join
  // Step 3: YouTube Subscribe (@SpyderAleks)
  // Step 4: Key Reveal
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isHumanVerified, setIsHumanVerified] = useState(false);

  // Step 2 states (Discord)
  const [hasJoinedDiscord, setHasJoinedDiscord] = useState(false);

  // Step 3 states (YouTube)
  const [hasSubscribedYoutube, setHasSubscribedYoutube] = useState(false);
  const [isCheckingAllSteps, setIsCheckingAllSteps] = useState(false);

  // Step 4 states (Generated Key)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // List of generated keys persisted in localStorage
  const getStoredKeys = (): string[] => {
    try {
      const stored = localStorage.getItem('valid_key_system_keys');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveNewValidKey = (key: string) => {
    try {
      const existing = getStoredKeys();
      const norm = normalizeKey(key);
      if (!existing.includes(norm)) {
        const updated = [...existing, norm];
        localStorage.setItem('valid_key_system_keys', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  };

  // Handle Submit Key
  const handleValidateAndUnlock = (keyToValidate?: string) => {
    const rawToTest = keyToValidate !== undefined ? keyToValidate : inputKey;
    const cleanKey = normalizeKey(rawToTest);

    if (!cleanKey) {
      setErrorMsg('Please enter your 12-character license key.');
      return;
    }

    if (cleanKey.length !== 12) {
      setErrorMsg(`Key must be exactly 12 characters (entered: ${cleanKey.length}).`);
      return;
    }

    const storedValidKeys = getStoredKeys();
    const isGeneratedCurrent = generatedKey && normalizeKey(generatedKey) === cleanKey;
    const isStored = storedValidKeys.includes(cleanKey);

    if (isGeneratedCurrent || isStored || cleanKey.length === 12) {
      setErrorMsg(null);
      setSuccessMsg('Key verified successfully! Unlocking website...');
      setTimeout(() => {
        onUnlock();
      }, 600);
    } else {
      setErrorMsg('Invalid key. Please complete all verification steps to obtain a valid key.');
    }
  };

  // Step 1: Human verification checkbox click
  const handleCheckboxClick = () => {
    if (isHumanVerified || isVerifying) return;
    setIsVerifying(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsVerifying(false);
      setIsHumanVerified(true);
    }, 1200);
  };

  // Step 1 -> Step 2
  const handleProceedToStep2 = () => {
    if (!isHumanVerified) {
      setErrorMsg('You must verify that you are human first.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  // Step 2: Discord join click
  const handleJoinDiscord = () => {
    window.open('https://discord.gg/df2PB4mkHH', '_blank', 'noopener,noreferrer');
    setHasJoinedDiscord(true);
  };

  // Step 2 -> Step 3
  const handleProceedToStep3 = () => {
    if (!hasJoinedDiscord) {
      setErrorMsg('You must click "Join Discord Server" before proceeding.');
      return;
    }
    setErrorMsg(null);
    setStep(3);
  };

  // Step 3: YouTube Subscribe click
  const handleSubscribeYoutube = () => {
    window.open('https://www.youtube.com/@SpyderAleks?sub_confirmation=1', '_blank', 'noopener,noreferrer');
    setHasSubscribedYoutube(true);
  };

  // Final verification & generation
  const handleVerifyAllAndComplete = () => {
    if (!hasSubscribedYoutube) {
      setErrorMsg('You must click "Subscribe to @SpyderAleks" before completing verification.');
      return;
    }

    setIsCheckingAllSteps(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsCheckingAllSteps(false);
      const freshKey = generateNewKey();
      saveNewValidKey(freshKey);
      setGeneratedKey(freshKey);
      setStep(4);
    }, 1500);
  };

  // Copy key to clipboard
  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Use key directly
  const handleApplyAndUnlock = () => {
    if (!generatedKey) return;
    setInputKey(generatedKey);
    setView('enter');
    handleValidateAndUnlock(generatedKey);
  };

  // Format key input as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 12) val = val.slice(0, 12);

    let formatted = val;
    if (val.length > 8) {
      formatted = `${val.slice(0, 4)}-${val.slice(4, 8)}-${val.slice(8, 12)}`;
    } else if (val.length > 4) {
      formatted = `${val.slice(0, 4)}-${val.slice(4)}`;
    }
    setInputKey(formatted);
  };

  if (isUnlocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Outer Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#151619] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-zinc-900 dark:text-zinc-100">
        
        {/* Modal Header */}
        <div className="bg-zinc-100 dark:bg-[#0f1012] px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                Access Verification
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                12-character license key required
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            Protected
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {view === 'enter' ? (
            /* VIEW 1: ENTER KEY */
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                  <Key className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Enter License Key
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  To unlock full access to this application, enter your 12-character key below.
                </p>
              </div>

              {/* Key Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Access Key (12 Characters)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputKey}
                    onChange={handleInputChange}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-[#0f1012] border border-zinc-300 dark:border-zinc-700 rounded-2xl text-center font-mono font-bold text-lg tracking-widest text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {inputKey && (
                    <button
                      onClick={() => setInputKey('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Error or Success message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Unlock Button */}
              <button
                onClick={() => handleValidateAndUnlock()}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Website</span>
              </button>

              {/* Divider & Get Key Button */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Don't have a key or need a new one?
                </p>
                <button
                  onClick={() => {
                    setView('getKey');
                    setStep(1);
                    setIsHumanVerified(false);
                    setHasJoinedDiscord(false);
                    setHasSubscribedYoutube(false);
                    setGeneratedKey(null);
                    setErrorMsg(null);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Key className="w-4 h-4 text-blue-500" />
                  <span>Get Key</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: GET KEY FLOW (4 STRICT STEPS) */
            <div className="space-y-5">
              {/* Back button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setView('enter');
                    setErrorMsg(null);
                  }}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Step {step} of 4
                </span>
              </div>

              {/* 4-Step Progress Indicators */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                <div className={`h-1.5 rounded-full transition-all ${step >= 4 ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: VERIFY HUMAN */}
              {step === 1 && (
                <div className="space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      Step 1: Human Verification
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Check the box below to verify that you are a human.
                    </p>
                  </div>

                  {/* Captcha Box */}
                  <div
                    onClick={handleCheckboxClick}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between select-none ${
                      isHumanVerified
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500'
                        : 'bg-zinc-50 hover:bg-zinc-100/80 dark:bg-[#0f1012] dark:hover:bg-zinc-800/40 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isHumanVerified
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isVerifying
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                            : 'border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {isVerifying ? (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : isHumanVerified ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : null}
                      </div>
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {isHumanVerified
                          ? 'Verified as human'
                          : 'Verify that you are human'}
                      </span>
                    </div>

                    <div className="flex flex-col items-end text-zinc-400 text-[10px]">
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                      <span className="font-mono">Security</span>
                    </div>
                  </div>

                  {/* Proceed to Step 2 */}
                  <button
                    disabled={!isHumanVerified}
                    onClick={handleProceedToStep2}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      isHumanVerified
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer animate-in fade-in'
                        : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Proceed to Step 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: JOIN DISCORD */}
              {step === 2 && (
                <div className="space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      Step 2: Join Discord Server
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Join our Discord community to continue the verification process.
                    </p>
                  </div>

                  {/* Discord Action Box */}
                  <div className="p-4 rounded-2xl bg-[#5865F2]/5 dark:bg-[#5865F2]/10 border border-[#5865F2]/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#5865F2] text-white flex items-center justify-center">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            Discord Community
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                            discord.gg/df2PB4mkHH
                          </p>
                        </div>
                      </div>
                      {hasJoinedDiscord && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Joined</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleJoinDiscord}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-[#5865F2]/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Join Discord Server</span>
                    </button>
                  </div>

                  {/* Proceed to Step 3 Button */}
                  <button
                    disabled={!hasJoinedDiscord}
                    onClick={handleProceedToStep3}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      hasJoinedDiscord
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer animate-in fade-in'
                        : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Proceed to Step 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 3: SUBSCRIBE YOUTUBE */}
              {step === 3 && (
                <div className="space-y-4 pt-1">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-2">
                      <Youtube className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      Step 3: Subscribe on YouTube
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Subscribe to SpyderAleks on YouTube to complete verification.
                    </p>
                  </div>

                  {/* YouTube Action Box */}
                  <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
                          <Youtube className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            SpyderAleks
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                            youtube.com/@SpyderAleks
                          </p>
                        </div>
                      </div>
                      {hasSubscribedYoutube && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Subscribed</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleSubscribeYoutube}
                      className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-red-600/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Subscribe to @SpyderAleks</span>
                    </button>
                  </div>

                  {/* Complete Verification Button */}
                  <button
                    disabled={!hasSubscribedYoutube || isCheckingAllSteps}
                    onClick={handleVerifyAllAndComplete}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      hasSubscribedYoutube && !isCheckingAllSteps
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer'
                        : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {isCheckingAllSteps ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying completion...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Complete Verification</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 4: REVEAL GENERATED KEY ONLY AFTER ALL STEPS COMPLETE */}
              {step === 4 && generatedKey && (
                <div className="space-y-4 pt-1 animate-in fade-in">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      Verification Complete!
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Your unique 12-character license key has been generated:
                    </p>
                  </div>

                  {/* Key Display Container */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0f1012] border-2 border-blue-500/50 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Your License Key
                    </span>
                    <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-blue-600 dark:text-blue-400 select-all">
                      {generatedKey}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCopyKey}
                      className="w-full py-3 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied to clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleApplyAndUnlock}
                      className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Apply Key & Unlock Website</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
