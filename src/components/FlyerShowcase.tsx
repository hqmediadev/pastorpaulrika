import React, { useState, useRef } from 'react';
import { Download, Sparkles, Share2, Check, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';
import { BIRTHDAY_CARDS } from './FlippingCardShowcase';

interface FlyerShowcaseProps {
  onOpenUploadModal: () => void;
}

export const FlyerShowcase: React.FC<FlyerShowcaseProps> = ({ onOpenUploadModal }) => {
  const [flyerUrl, setFlyerUrl] = useState(BIRTHDAY_CARDS[0].url);
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);

  // Personalized Card Generator State
  const [customName, setCustomName] = useState('Bro. David Adeleke');
  const [customGreeting, setCustomGreeting] = useState('Celebrating a True General of Holiness & Faith!');
  const [customChurch, setCustomChurch] = useState('Lagos, Nigeria');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [cardTheme, setCardTheme] = useState<'gold' | 'royal' | 'burgundy'>('gold');
  const [copiedShare, setCopiedShare] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const greetingsOptions = [
    'Celebrating a True General of Holiness & Faith!',
    'Thank you Pastor Paul Rika for decades of uncompromising truth!',
    'Happy Birthday to our Father in the Lord & HOREMOW Director!',
    'Honoring a living legend and end-time holiness revivalist!',
    'May your anointing increase and your strength be renewed!',
  ];

  const handleDownloadCard = () => {
    playCelebrationChime('confetti');
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    // In-browser canvas export or alert
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1350);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#020617');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 1000, 1270);

    // Inner gold border
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(55, 55, 970, 1240);

    // Header
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 30px serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOLINESS REVIVAL MOVEMENT WORLDWIDE', 540, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px serif';
    ctx.fillText('PASTOR PAUL RIKA', 540, 210);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'italic 28px serif';
    ctx.fillText('“Decades of Uncompromising Holiness & Truth”', 540, 270);

    // Custom Wish box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(100, 750, 880, 360);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 750, 880, 360);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'italic 34px serif';
    ctx.fillText(`“${customGreeting}”`, 540, 850);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(customName, 540, 960);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '28px sans-serif';
    ctx.fillText(customChurch, 540, 1020);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('HAPPY BIRTHDAY PASTOR PAUL RIKA • #HOREMOW', 540, 1220);

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pastor-paul-rika-birthday-card-${customName.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <section id="flyer" className="relative py-24 bg-slate-950 border-t border-amber-500/20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Commemorative Graphics & Flyer</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight">
            Official Birthday <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">Flyer & Social Cards</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Download the official commemorative graphics or create your own personalized tribute card to share on WhatsApp status, Instagram, and Facebook!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: FLYER DISPLAY */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl bg-slate-900 border-2 border-amber-400/50 p-3 shadow-2xl overflow-hidden group">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-black">
                <img
                  src={flyerUrl}
                  alt="Birthday Flyer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-amber-300 font-bold">Choose Graphic</span>
                  <span className="text-[10px] text-slate-400">{selectedCardIdx + 1}/{BIRTHDAY_CARDS.length}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {BIRTHDAY_CARDS.map((card, idx) => (
                    <button
                      key={card.id}
                      onClick={() => {
                        setSelectedCardIdx(idx);
                        setFlyerUrl(card.url);
                      }}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                        selectedCardIdx === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg shadow-amber-500/25'
                          : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                      }`}
                    >
                      <img src={card.url} alt={card.title} className="w-full h-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={flyerUrl}
                  download={`Pastor-Paul-Rika-Design-${selectedCardIdx + 1}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Graphic</span>
                </a>

                <button
                  onClick={handleShareLink}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>Share Website</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: PERSONALIZED GREETING CARD GENERATOR */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-black text-white">
                    Personalized Birthday Card Generator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Create a customized social card with your name and greeting!
                  </p>
                </div>
              </div>
            </div>

            {/* Live Card Preview Box */}
            <div
              ref={cardRef}
              className={`relative rounded-2xl p-6 border-2 transition-all ${
                cardTheme === 'gold'
                  ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-amber-400/60 shadow-amber-500/10'
                  : cardTheme === 'royal'
                  ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border-indigo-400/60 shadow-indigo-500/10'
                  : 'bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/50 border-rose-400/60 shadow-rose-500/10'
              } shadow-2xl overflow-hidden`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Pastor's photo on card */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-lg shrink-0">
                  <img
                    src={flyerUrl}
                    alt="Pastor Paul Rika"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Card Text Content */}
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400">
                    HAPPY BIRTHDAY PASTOR PAUL RIKA
                  </span>
                  <h4 className="text-lg sm:text-xl font-serif font-black text-white leading-tight">
                    “{customGreeting}”
                  </h4>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs text-slate-400">Proudly Celebrated by:</span>
                    <span className="text-xs font-bold text-amber-300 font-serif">
                      {customName || 'Your Name'}
                    </span>
                    <span className="text-xs text-slate-500">• {customChurch}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your City / Branch
                </label>
                <input
                  type="text"
                  value={customChurch}
                  onChange={(e) => setCustomChurch(e.target.value)}
                  placeholder="e.g. London, UK or Ikeja, Lagos"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Preset Greeting Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Greeting Message
              </label>
              <div className="space-y-2">
                {greetingsOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomGreeting(opt)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors border ${
                      customGreeting === opt
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    “{opt}”
                  </button>
                ))}
              </div>
            </div>

            {/* Generate & Download Card Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Theme:</span>
                <button
                  onClick={() => setCardTheme('gold')}
                  className={`w-5 h-5 rounded-full bg-amber-500 border ${cardTheme === 'gold' ? 'ring-2 ring-white' : ''}`}
                />
                <button
                  onClick={() => setCardTheme('royal')}
                  className={`w-5 h-5 rounded-full bg-indigo-600 border ${cardTheme === 'royal' ? 'ring-2 ring-white' : ''}`}
                />
                <button
                  onClick={() => setCardTheme('burgundy')}
                  className={`w-5 h-5 rounded-full bg-rose-700 border ${cardTheme === 'burgundy' ? 'ring-2 ring-white' : ''}`}
                />
              </div>

              <button
                onClick={handleDownloadCard}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Card for WhatsApp Status</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
