import React from 'react';
import { ShieldCheck, Flame, BookOpen, Quote, Video, Heart, CheckCircle2, Crown } from 'lucide-react';

interface AboutPastorProps {
  onOpenUploadModal: (tab: 'video-record' | 'text') => void;
}

export const AboutPastor: React.FC<AboutPastorProps> = ({ onOpenUploadModal }) => {
  return (
    <section className="relative py-20 bg-slate-950 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Honoring God's Servant</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">Pastor Paul Rika</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            International Director of Holiness Revival Movement Worldwide (HOREMOW) — a global end-time movement calling the Church of Jesus Christ back to true holiness and preparation for heaven.
          </p>
        </div>

        {/* Narrative & Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          
          {/* Portrait & Scripture */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-amber-500/30 p-2 shadow-xl">
              <div className="rounded-xl overflow-hidden aspect-[4/5] bg-slate-950">
                <img
                  src="https://res.cloudinary.com/heckogkv/image/upload/v1794052025/DADDY_BIRTHDAY_DESIGN_1.jpg_dwkzkn.jpg"
                  alt="Pastor Paul Rika"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="p-4 mt-2 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-start gap-2 text-amber-400 mb-1">
                  <Quote className="w-4 h-4 shrink-0 fill-amber-400/20" />
                  <p className="text-xs text-slate-200 font-serif italic">
                    “Without holiness, no man shall see the Lord. The standard of God’s Word remains forever unshakable.”
                  </p>
                </div>
                <p className="text-[11px] text-amber-300 font-bold text-right">
                  — Pastor Paul Rika
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              <h3 className="text-2xl font-serif font-black text-white">
                An End-Time Voice of Truth & Restitution
              </h3>
              <p>
                As the International Director of the <strong className="text-amber-300">Holiness Revival Movement Worldwide (HOREMOW)</strong>, Pastor Paul Rika has dedicated decades to preaching repentance, deliverance, restitution, and genuine separation from the world.
              </p>
              <p>
                Through literature distributed across nations in multiple languages, international conferences, and soul-stirring radio and television broadcasts, his ministry continues to rescue souls from deception, equipping believers with the pure, undiluted Word of God.
              </p>
            </div>

            {/* Core Ministry Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Biblical Holiness</span>
                </div>
                <p className="text-xs text-slate-400">
                  Total purity in heart, thoughts, words, and modest appearance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Flame className="w-4 h-4" />
                  <span>True Restitution</span>
                </div>
                <p className="text-xs text-slate-400">
                  Making past wrongs right according to the Holy Scriptures.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <BookOpen className="w-4 h-4" />
                  <span>Literature & Translations</span>
                </div>
                <p className="text-xs text-slate-400">
                  Distributing life-changing books and tracts across continents.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rapture Readiness</span>
                </div>
                <p className="text-xs text-slate-400">
                  Keeping the Bride of Christ prepared without spot or wrinkle.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tribute Upload Callout Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 p-0.5 shadow-xl">
          <div className="rounded-[15px] bg-slate-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                How has Pastor Paul Rika impacted your life?
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                We are compiling video tributes and testimonies for Pastor Paul Rika's birthday. Simply record your video with your phone/webcam or submit your testimony.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => onOpenUploadModal('video-record')}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-md transition-all hover:scale-[1.02]"
              >
                <Video className="w-4 h-4 fill-slate-950" />
                <span>Record Video Tribute</span>
                <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              </button>
              <button
                onClick={() => onOpenUploadModal('text')}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Write Message</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
