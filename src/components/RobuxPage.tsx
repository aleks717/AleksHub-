import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Tag, Gamepad2, PiggyBank, ArrowUp } from 'lucide-react';
import { ROBUX_PACKAGES, getRobloxPlusOptions, getFaqItems } from '../data/storeData';
import { RobuxIcon, RobloxPlusBadge } from './RobloxIcons';
import { RobloxCrown3D } from './RobloxCrown3D';
import { RobloxTopoBackground } from './RobloxTopoBackground';
import { UserSettings } from '../types';
import { getTranslation } from '../utils/translations';

interface RobuxPageProps {
  userSettings?: UserSettings;
  onBuyRobux: (amount: number, price: string) => void;
  onOpenSendModal: () => void;
}

export const RobuxPage: React.FC<RobuxPageProps> = ({ userSettings, onBuyRobux, onOpenSendModal }) => {
  // Accordion state for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  // Carousel scroll index
  const [carouselIndex, setCarouselIndex] = useState(0);

  const lang = userSettings?.language || 'en';
  const daysRemaining = userSettings?.limitedItemDays ?? 19;
  const robloxPlusOptions = getRobloxPlusOptions(lang);
  const faqItems = getFaqItems(lang);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const nextCarousel = () => {
    setCarouselIndex((prev) => Math.min(prev + 1, Math.max(0, robloxPlusOptions.length - 3)));
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 md:px-8 py-2 space-y-10 text-[#191919] dark:text-white pb-16 transition-colors overflow-x-hidden">
      {/* 3D Topographic Mesh Contour Lines (1:1 Exact Match IMG_0370.jpeg) */}
      <div className="absolute top-0 -left-4 -right-4 sm:-left-6 sm:-right-6 md:-left-8 md:-right-8 lg:-left-16 lg:-right-16 h-[440px] pointer-events-none overflow-hidden select-none z-0">
        <RobloxTopoBackground />
      </div>

      {/* HERO SECTION WITH TOP-RIGHT FLOATING SEND PILL (1:1 Match IMG_0370.jpeg) */}
      <section className="relative z-10 pt-2 pb-6 md:pb-10 select-none">
        {/* Top-Right Robux Balance & Senden Pill */}
        <div className="flex justify-end mb-4 md:mb-6">
          <div className="inline-flex items-center space-x-3 bg-[#F2F4F5] dark:bg-zinc-800/95 border border-[#E3E5E8] dark:border-zinc-700/80 pl-4 pr-1.5 py-1.5 rounded-full shadow-2xs">
            <div className="flex items-center space-x-2 text-base md:text-lg font-black text-[#191919] dark:text-white">
              <RobuxIcon className="w-5 h-5 text-[#191919] dark:text-white" />
              <span className="tabular-nums tracking-tight">{userSettings?.robuxCount?.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US') ?? '0'}</span>
            </div>
            <button
              onClick={onOpenSendModal}
              className="flex items-center space-x-1.5 text-xs md:text-sm font-bold bg-[#DCE0E6] dark:bg-zinc-700 hover:bg-[#CFD4DC] dark:hover:bg-zinc-600 text-[#191919] dark:text-white px-3.5 py-1.5 rounded-full transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{getTranslation(lang, 'send')}</span>
            </button>
          </div>
        </div>

        {/* Hero Title (1:1 Match IMG_0370.jpeg - Two Bold Centered Lines) */}
        <div className="max-w-4xl mx-auto pt-2 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#191919] dark:text-white leading-[1.08] drop-shadow-2xs">
            {lang === 'de' ? (
              <>
                Sichere dir bis zu
                <br />
                25% mehr Robux
              </>
            ) : (
              <>
                Get up to
                <br />
                25% more Robux
              </>
            )}
          </h1>
        </div>
      </section>

      {/* 2. LIMITED-TIME AVATAR ITEMS (1:1 Match Video) */}
      <section id="avatar-artikel" className="relative z-10 space-y-4 scroll-mt-20">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl md:text-2xl font-black text-[#191919] dark:text-white tracking-tight">
            {getTranslation(lang, 'limitedTimeItems')}
          </h2>
          <span className="border border-[#191919] dark:border-white text-[#191919] dark:text-white bg-transparent text-xs font-bold px-2.5 py-0.5 rounded-full">
            {getTranslation(lang, daysRemaining === 1 ? 'dayLeft' : 'daysLeft', { days: daysRemaining })}
          </span>
        </div>

        {/* Crown Showcase Card with Real WebGL 3D Rotating Mesh Crown (1:1 with Video & Roblox Web App) */}
        <div className="relative overflow-hidden bg-[#F2F4F5] dark:bg-[#1A1D20] rounded-3xl p-5 sm:p-7 md:p-8 border border-[#E3E5E8] dark:border-zinc-800 flex flex-col justify-between min-h-[380px] md:min-h-[420px] max-w-full">
          {/* Centered Real 3D Rotating Crown */}
          <div className="w-full flex-1 flex items-center justify-center py-2 relative z-10">
            <RobloxCrown3D className="w-64 h-64 md:w-80 md:h-80" />
          </div>

          {/* Bottom Left Info & Integrated Price Row (Cleanly bounded to card width) */}
          <div className="relative z-10 space-y-3 pt-3 border-t border-[#E3E5E8] dark:border-zinc-800 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div className="space-y-0.5 text-left min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#191919] dark:text-white tracking-tight truncate">
                  {lang === 'de' ? 'Goldene Krone von Ozymandias' : 'Golden Crown of Ozymandias'}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#656668] dark:text-zinc-400">
                  <span>Roblox</span>
                </div>
              </div>

              {/* Price & Buy Action in Card Footer (No extra circle, responsive left-padded) */}
              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 shrink-0">
                <div className="flex items-center space-x-1.5 text-lg sm:text-xl md:text-2xl font-black text-[#191919] dark:text-white">
                  <RobuxIcon className="w-5 h-5 shrink-0" />
                  <span>24.000</span>
                  <div className="flex items-center space-x-0.5 text-xs sm:text-sm text-[#656668] dark:text-zinc-400 font-bold line-through ml-1.5">
                    <RobuxIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span>22.500</span>
                  </div>
                </div>

                <button
                  onClick={() => onBuyRobux(24000, '239,99 €')}
                  className="bg-[#E8EBEE] dark:bg-zinc-700 hover:bg-[#DCE0E6] dark:hover:bg-zinc-600 text-[#191919] dark:text-white font-extrabold px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                >
                  239,99 €
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ROBUX PACKAGES SECTION */}
      <section id="robux-pakete" className="relative z-10 space-y-4 scroll-mt-20">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#191919] dark:text-white">
            {getTranslation(lang, 'robuxPackages')}
          </h2>
          <p className="text-xs text-[#656668] dark:text-zinc-400 mt-1 max-w-4xl font-medium leading-relaxed">
            {lang === 'de' ? (
              <>
                Durch den Kauf von Robux erklärst du dich mit unseren{' '}
                <a href="#nutzungsbedingungen" className="underline font-bold text-[#191919] dark:text-white">
                  Nutzungsbedingungen
                </a>
                , einschließlich der Schiedsklausel und der Widerrufsbelehrung, einverstanden.
              </>
            ) : (
              <>
                By purchasing Robux, you agree to our{' '}
                <a href="#nutzungsbedingungen" className="underline font-bold text-[#191919] dark:text-white">
                  Terms of Use
                </a>
                , including the arbitration clause and cancellation policy.
              </>
            )}
          </p>
        </div>

        {/* Packages Container */}
        <div className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xs space-y-2">
          {ROBUX_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-[#F2F4F5] dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-lg md:text-xl font-black text-[#191919] dark:text-white">
                  <RobuxIcon className="w-5 h-5 shrink-0" />
                  <span>{pkg.robuxAmount.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</span>
                </div>
                {pkg.originalRobux && (
                  <div className="flex items-center space-x-1 text-xs md:text-sm text-[#656668] dark:text-zinc-400 font-bold line-through">
                    <RobuxIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{pkg.originalRobux.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US')}</span>
                  </div>
                )}
                {pkg.bonusRobux && (
                  <span className="bg-[#F2F4F5] dark:bg-zinc-800 text-[#191919] dark:text-white text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E3E5E8] dark:border-zinc-700 hidden sm:inline-block">
                    + {pkg.bonusRobux} {getTranslation(lang, 'more')}
                  </span>
                )}
              </div>

              <button
                onClick={() => onBuyRobux(pkg.robuxAmount, pkg.priceEur)}
                className="bg-[#E3E5E8] dark:bg-zinc-800 hover:bg-[#D0D3D6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold px-6 md:px-8 py-2 rounded-xl text-xs md:text-sm transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
              >
                {pkg.priceEur}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. "NEW ON ROBLOX" CAROUSEL SECTION */}
      <section id="roblox-plus" className="space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl md:text-2xl font-black">{getTranslation(lang, 'newOnRoblox')}</h2>
          </div>
          <a href="#roblox-plus" className="text-xs md:text-sm font-bold text-[#191919] dark:text-white underline hover:opacity-80">
            {getTranslation(lang, 'learnMore')}
          </a>
        </div>

        <div className="relative group">
          {carouselIndex > 0 && (
            <button 
              onClick={prevCarousel}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#191919] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {carouselIndex < robloxPlusOptions.length - 3 && (
            <button 
              onClick={nextCarousel}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-[#191919] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {robloxPlusOptions.slice(carouselIndex, carouselIndex + 3).map((opt) => (
              <div
                key={opt.id}
                className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-[#BDC1C6] dark:hover:border-zinc-700 transition-all shadow-2xs"
              >
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-bold text-[#191919] dark:text-white">{opt.title}</h3>
                    <div className="flex items-center space-x-1.5">
                      {opt.originalPriceMonth && (
                        <span className="text-xs text-[#656668] dark:text-zinc-400 font-bold line-through">
                          {opt.originalPriceMonth}
                        </span>
                      )}
                      <span className="text-sm font-black text-[#191919] dark:text-white">{opt.priceMonth}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 pt-1">
                    {opt.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs font-semibold text-[#393B3D] dark:text-zinc-300">
                        {opt.id === 'rplus-basic' ? (
                          <>
                            {idx === 0 && <Tag className="w-4 h-4 shrink-0 mt-0.5 text-[#191919] dark:text-white" />}
                            {idx === 1 && <Gamepad2 className="w-4 h-4 shrink-0 mt-0.5 text-[#191919] dark:text-white" />}
                            {idx === 2 && <RobuxIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#191919] dark:text-white" />}
                          </>
                        ) : (
                          <>
                            {idx === 0 && <RobloxPlusBadge className="w-4 h-4 shrink-0 mt-0.5" />}
                            {idx === 1 && <RobuxIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#191919] dark:text-white" />}
                            {idx === 2 && <PiggyBank className="w-4 h-4 shrink-0 mt-0.5 text-[#191919] dark:text-white" />}
                          </>
                        )}
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onOpenSendModal}
                  className="w-full bg-[#E3E5E8] dark:bg-zinc-800 hover:bg-[#D0D3D6] dark:hover:bg-zinc-700 text-[#191919] dark:text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {opt.priceMonth}/{lang === 'de' ? 'Monat' : 'month'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section id="faq" className="space-y-4 scroll-mt-20">
        <h2 className="text-xl md:text-2xl font-black">{getTranslation(lang, 'faq')}</h2>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#191919] border border-[#E3E5E8] dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-sm md:text-base font-bold hover:bg-[#F2F4F5] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#656668] dark:text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#656668] dark:text-zinc-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-[#393B3D] dark:text-zinc-300 leading-relaxed border-t border-[#E3E5E8] dark:border-zinc-800 bg-[#F2F4F5] dark:bg-zinc-900/60 whitespace-pre-line">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FOOTER LINKS */}
      <footer id="footer" className="pt-10 border-t border-[#E3E5E8] dark:border-zinc-800 space-y-4 text-center md:text-left text-[#656668] dark:text-zinc-400 scroll-mt-20">
        <div id="nutzungsbedingungen" className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs font-semibold">
          <a href="#" className="hover:underline">{lang === 'de' ? 'Über uns' : 'About Us'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Jobs' : 'Careers'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Newsroom' : 'Newsroom'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Eltern' : 'Parents'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Geschenkkarten' : 'Gift Cards'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Hilfe' : 'Help'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Nutzungsbedingungen' : 'Terms of Use'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Barrierefreiheit' : 'Accessibility'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Datenschutz' : 'Privacy'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Deine Datenschutzeinstellungen' : 'Your Privacy Choices'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Sitemap' : 'Sitemap'}</a>
          <a href="#" className="hover:underline">{lang === 'de' ? 'Cookie-Einstellungen' : 'Cookie Preferences'}</a>
        </div>
        <div className="text-[11px] text-[#656668] dark:text-zinc-500 pt-1">
          © 2026 Roblox Corporation. Roblox, the Roblox logo, and "Powering Imagination" are registered trademarks in the US and other countries.
        </div>
      </footer>
    </div>
  );
};
