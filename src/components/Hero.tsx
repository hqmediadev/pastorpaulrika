import React from 'react';
import { Video, Heart, ShieldCheck, Flame, Globe2, Award, Sparkles, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';
import { FlippingCardShowcase } from './FlippingCardShowcase';

interface HeroProps {
  blessingsCount: number;
  onSendBlessing: () => void;
  onOpenUploadModal: (tab: 'video-record' | 'video-upload' | 'text') => void;
}

export const Hero: React.FC<HeroProps> = ({
  blessingsCount,
  onSendBlessing,
  onOpenUploadModal,
}) => {
  const triggerConfetti = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    playCelebrationChime('confetti');

    confetti({
      particleCount: 55,
      spread: 75,
      origin: { x, y },
      colors: ['#F59E0B', '#FBBF24', '#FEF08A', '#FFFFFF', '#EC4899'],
    });

    onSendBlessing();
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 py-16 sm:py-20">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-amber-700/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Content with Shimmer Animations */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>HOLINESS REVIVAL MOVEMENT WORLDWIDE (HOREMOW)</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white leading-tight">
                Happy 65th Birthday <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 via-amber-300 to-amber-500 animate-shimmer drop-shadow-md">
                  Pastor Paul Rika
                </span>
              </h1>
              <p className="text-sm sm:text-base text-amber-200/90 font-medium tracking-wide">
                International Director, Holiness Revival Movement Worldwide
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Honoring 65 glorious years and decades of unwavering commitment to biblical holiness, restitution, and preparing the Bride of Christ for the rapture. 
              <strong className="text-amber-300 font-semibold block mt-1.5">
                Record or upload your video tribute or write a heartfelt message sharing how Pastor Paul Rika and his holiness teachings have transformed your life.
              </strong>
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onOpenUploadModal('video-record')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02]"
              >
                <Video className="w-4 h-4 fill-slate-950" />
                <span>Upload Video Tribute</span>
                <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center" title="Premium Featured Section">
                  <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                </div>
              </button>

              <button
                onClick={() => onOpenUploadModal('text')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Write Birthday Message</span>
              </button>

              <button
                onClick={triggerConfetti}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>🙏 Say Amen ({blessingsCount.toLocaleString()})</span>
              </button>
            </div>

            {/* Ministry Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center lg:text-left">
                <div className="text-amber-400 text-xs font-semibold mb-0.5">Holiness Standard</div>
                <div className="text-lg sm:text-xl font-black text-white font-serif">65 Years</div>
                <div className="text-[11px] text-slate-400">Undiluted Truth</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center lg:text-left">
                <div className="text-amber-400 text-xs font-semibold mb-0.5">Movement Reach</div>
                <div className="text-lg sm:text-xl font-black text-white font-serif">Worldwide</div>
                <div className="text-[11px] text-slate-400">HOREMOW Chapters</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center lg:text-left">
                <div className="text-amber-400 text-xs font-semibold mb-0.5">Blessings Sent</div>
                <div className="text-lg sm:text-xl font-black text-amber-300 font-serif">
                  {blessingsCount.toLocaleString()}+
                </div>
                <div className="text-[11px] text-slate-400">Prayers & Amens</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Card Flip with User's Cloudinary Images */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <FlippingCardShowcase onOpenUploadModal={() => onOpenUploadModal('video-record')} />
          </div>

        </div>
      </div>
    </section>
  );
};
