import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Play,
  Pause
} from 'lucide-react';

export interface BirthdayCardItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export const BIRTHDAY_CARDS: BirthdayCardItem[] = [
  {
    id: 'card-1',
    title: 'DADDY PAUL RIKA @ 65',
    subtitle: 'Celebrating God’s General & End-Time Revivalist',
    url: 'https://res.cloudinary.com/heckogkv/image/upload/v1794052025/DADDY_BIRTHDAY_DESIGN_1.jpg_dwkzkn.jpg',
  },
  {
    id: 'card-2',
    title: 'PASTOR PAUL RIKA',
    subtitle: 'Decades of Uncompromising Holiness & Truth',
    url: 'https://res.cloudinary.com/heckogkv/image/upload/v1794052022/DADDY_BIRTHDAY_DESIGN_2.jpg_wy9b45.jpg',
  },
  {
    id: 'card-3',
    title: '65TH BIRTHDAY CELEBRATION',
    subtitle: 'Honoring a Faithful Steward in the Vineyard',
    url: 'https://res.cloudinary.com/heckogkv/image/upload/v1794051917/WhatsApp_Image_2026-11-07_at_10.27.43_tdncxf.jpg',
  },
];

interface FlippingCardShowcaseProps {
  onOpenUploadModal: () => void;
}

export const FlippingCardShowcase: React.FC<FlippingCardShowcaseProps> = ({ onOpenUploadModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoFlip, setAutoFlip] = useState(true);

  // Auto flip & cycle through cards
  useEffect(() => {
    if (!autoFlip) return;
    const interval = setInterval(() => {
      setIsFlipped((prev) => {
        if (prev) {
          // Move to next card when returning to front
          setCurrentIndex((c) => (c + 1) % BIRTHDAY_CARDS.length);
          return false;
        } else {
          return true;
        }
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [autoFlip]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % BIRTHDAY_CARDS.length);
    }, 150);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + BIRTHDAY_CARDS.length) % BIRTHDAY_CARDS.length);
    }, 150);
  };

  const handleManualFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentFront = BIRTHDAY_CARDS[currentIndex];
  const nextBackIndex = (currentIndex + 1) % BIRTHDAY_CARDS.length;
  const currentBack = BIRTHDAY_CARDS[nextBackIndex];

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto select-none">
      
      {/* Outer Floating Glow & Shimmer Particle Halo */}
      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 rounded-3xl blur-xl animate-halo pointer-events-none" />

      {/* Main 3D Flipping Card Container */}
      <div className="relative perspective-1000">
        
        {/* Card Stage with preserve-3d and smooth rotation */}
        <div 
          onClick={handleManualFlip}
          className={`relative w-full aspect-[4/5] rounded-3xl cursor-pointer transition-transform duration-700 ease-out preserve-3d shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >

          {/* === FRONT OF CARD === */}
          <div className="absolute inset-0 backface-hidden rounded-3xl bg-slate-900 border-2 border-amber-400/60 p-2.5 shadow-2xl overflow-hidden">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={currentFront.url}
                alt={currentFront.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleManualFlip();
                }}
                title="Click to Flip Card"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shadow-md hover:bg-amber-400 transition-all z-10"
              >
                <RotateCw className="w-3 h-3" />
                <span>Flip</span>
              </button>
            </div>
          </div>

          {/* === BACK OF CARD === */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-slate-900 border-2 border-amber-400/60 p-2.5 shadow-2xl overflow-hidden">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={currentBack.url}
                alt={currentBack.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleManualFlip();
                }}
                title="Click to Flip Back"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black flex items-center gap-1.5 shadow-md hover:bg-amber-400 transition-all z-10"
              >
                <RotateCw className="w-3 h-3" />
                <span>Flip</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Controls Bar Below Flipping Card */}
      <div className="mt-4 p-3 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-lg flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          title="Previous Card"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Thumbnail Dots */}
        <div className="flex items-center gap-1.5">
          {BIRTHDAY_CARDS.map((card, idx) => (
            <button
              key={card.id}
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
                setCurrentIndex(idx);
              }}
              title={card.title}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-md shadow-amber-500/40'
                  : 'w-2.5 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Auto Flip Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAutoFlip(!autoFlip);
          }}
          title={autoFlip ? 'Pause auto-flip' : 'Play auto-flip'}
          className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1 ${
            autoFlip
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {autoFlip ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleNext}
          title="Next Card"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Upload Action prompt */}
      <div className="mt-2.5 text-center">
        <button
          onClick={onOpenUploadModal}
          className="text-xs text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1 hover:underline"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tap to record your video tribute for Pastor Paul Rika →</span>
        </button>
      </div>

    </div>
  );
};
