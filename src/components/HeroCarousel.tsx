import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface HeroCarouselProps {
  onShopNow: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onShopNow }) => {
  const { t } = useLanguage();

  // Array of 4 shoe hero images and stories as specified in requirement #2
  const slides = [
    {
      id: 1,
      title: t('heroTitle1'),
      subtitle: t('heroSub1'),
      badge: 'SPEED & ENDURANCE',
      tagline: 'Dual Zoom Air Pods • React Foam',
      bgGradient: 'from-rose-950 via-slate-900 to-black',
      accentColor: 'text-rose-400',
      buttonBg: 'bg-rose-600 hover:bg-rose-500',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
      shoeName: 'Air Zoom Pegasus 40 Sprint',
      brand: 'Nike',
    },
    {
      id: 2,
      title: t('heroTitle2'),
      subtitle: t('heroSub2'),
      badge: 'COURT HERITAGE',
      tagline: 'Full-Grain Leather • Encapsulated Air',
      bgGradient: 'from-purple-950 via-slate-900 to-black',
      accentColor: 'text-purple-400',
      buttonBg: 'bg-purple-600 hover:bg-purple-500',
      imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85',
      shoeName: 'Air Jordan 1 Retro High Court',
      brand: 'Jordan',
    },
    {
      id: 3,
      title: t('heroTitle3'),
      subtitle: t('heroSub3'),
      badge: 'NEXT-GEN ENERGY',
      tagline: 'Light BOOST Cushioning • LEP System',
      bgGradient: 'from-amber-950 via-slate-900 to-black',
      accentColor: 'text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-500',
      imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1200&q=85',
      shoeName: 'Ultraboost Light 23 Momentum',
      brand: 'Adidas',
    },
    {
      id: 4,
      title: t('heroTitle4'),
      subtitle: t('heroSub4'),
      badge: 'AMERICAN CRAFT',
      tagline: 'FuelCell Foam Core • Pigskin Overlays',
      bgGradient: 'from-emerald-950 via-slate-900 to-black',
      accentColor: 'text-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
      imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=85',
      shoeName: 'New Balance 990v6 Heritage',
      brand: 'New Balance',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden bg-slate-950 text-white rounded-3xl shadow-2xl my-6 mx-auto max-w-7xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="hero-carousel-container"
    >
      <div className={`relative min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex items-center bg-gradient-to-r ${currentSlide.bgGradient} transition-all duration-700`}>
        {/* Abstract background decorative patterns */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold tracking-wider uppercase text-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {currentSlide.badge}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
              {currentSlide.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              {currentSlide.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onShopNow}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${currentSlide.buttonBg}`}
                id="carousel-shop-now-btn"
              >
                <span>{t('shopNow')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secure QR Code Checkout Only</span>
              </div>
            </div>

            {/* Quick Specs Highlight */}
            <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-4">
              <span>{currentSlide.tagline}</span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span className="hidden sm:inline font-semibold text-slate-200">{currentSlide.brand}</span>
            </div>
          </div>

          {/* Right Shoe Image Column */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Glow backdrop */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

            <div className="relative z-10 w-full max-w-md aspect-[4/3] flex items-center justify-center p-4">
              <img
                key={currentSlide.imageUrl}
                src={currentSlide.imageUrl}
                alt={currentSlide.shoeName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/10 transform transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-2 left-6 right-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center text-xs text-slate-200">
                {currentSlide.shoeName}
              </div>
            </div>
          </div>
        </div>

        {/* Previous & Next Control Buttons */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-colors z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 transition-colors z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all rounded-full ${
                currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
