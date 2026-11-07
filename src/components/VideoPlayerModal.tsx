import React, { useEffect, useState } from 'react';
import { Tribute } from '../types';
import { X, Heart, MapPin, Download, Share2, Check, Sparkles, Flame, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';

interface VideoPlayerModalProps {
  tribute: Tribute | null;
  onClose: () => void;
  onAmen: (id: string) => void;
  onLike: (id: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  tribute,
  onClose,
  onAmen,
  onLike,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!tribute) return null;

  const triggerReaction = (e: React.MouseEvent, type: 'amen' | 'fire' | 'heart') => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    playCelebrationChime('amen');

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: type === 'fire' ? ['#EF4444', '#F97316', '#FBBF24'] : ['#F59E0B', '#FBBF24', '#FFFFFF'],
    });

    if (type === 'amen') onAmen(tribute.id);
    else onLike(tribute.id);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Watch this moving birthday tribute to Pastor Paul Rika from ${tribute.authorName}: ${window.location.href}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs uppercase font-mono font-bold text-amber-400">
              Video Tribute for Pastor Paul Rika
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {tribute.videoUrl ? (
            <video
              src={tribute.videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <p>Video loading...</p>
            </div>
          )}
        </div>

        {/* Video info & message */}
        <div className="p-6 bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {tribute.photoUrl ? (
                <img
                  src={tribute.photoUrl}
                  alt={tribute.authorName}
                  className="w-12 h-12 rounded-full object-cover border border-amber-500/40"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-lg font-serif">
                  {tribute.authorName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-serif font-black text-white">
                  {tribute.authorName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {tribute.authorLocation}
                  </span>
                  <span>•</span>
                  <span className="text-amber-300 font-medium">
                    {tribute.relationship}
                  </span>
                </div>
              </div>
            </div>

            {/* Reactions row */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => triggerReaction(e, 'amen')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>🙏 Say Amen</span>
                <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-[11px]">
                  {tribute.amens}
                </span>
              </button>

              <button
                onClick={(e) => triggerReaction(e, 'heart')}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span className="font-mono">{tribute.likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Share tribute"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tribute story / message */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed italic">
            “{tribute.message}”
          </div>
        </div>
      </div>
    </div>
  );
};
