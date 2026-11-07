import React, { useState } from 'react';
import { Tribute } from '../types';
import { 
  Video, 
  Heart, 
  MapPin, 
  Play, 
  Search, 
  Filter, 
  Sparkles, 
  Share2, 
  Download, 
  Check, 
  Star,
  Quote,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';

interface TributeWallProps {
  tributes: Tribute[];
  onSelectVideo: (tribute: Tribute) => void;
  onOpenUploadModal: (tab: 'video-record' | 'video-upload' | 'text') => void;
  onLikeTribute: (id: string) => void;
  onAmenTribute: (id: string) => void;
}

export const TributeWall: React.FC<TributeWallProps> = ({
  tributes,
  onSelectVideo,
  onOpenUploadModal,
  onLikeTribute,
  onAmenTribute,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'text' | 'featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTributes = tributes.filter((item) => {
    // Filter by type
    if (activeFilter === 'video' && item.type === 'text') return false;
    if (activeFilter === 'text' && item.type === 'video') return false;
    if (activeFilter === 'featured' && !item.isFeatured) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.authorName.toLowerCase().includes(q);
      const matchesLoc = item.authorLocation.toLowerCase().includes(q);
      const matchesMsg = item.message.toLowerCase().includes(q);
      const matchesRel = item.relationship.toLowerCase().includes(q);
      return matchesName || matchesLoc || matchesMsg || matchesRel;
    }
    return true;
  });

  const handleAmen = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    playCelebrationChime('amen');
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x, y },
      colors: ['#F59E0B', '#FBBF24', '#FFFFFF'],
    });

    onAmenTribute(id);
  };

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onLikeTribute(id);
  };

  const handleShare = (e: React.MouseEvent, tribute: Tribute) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Happy Birthday Pastor Paul Rika! Read this heartfelt tribute from ${tribute.authorName}: "${tribute.message.slice(0, 100)}..."`
      );
      setCopiedId(tribute.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section id="tributes" className="relative py-20 bg-slate-950 min-h-screen">
      {/* Background celestial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tributes From Around the World</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
            Celebration & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">Tribute Wall</span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Watch heartfelt video tributes and read testimonies of how Pastor Paul Rika's uncompromising holiness teachings transformed lives globally.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onOpenUploadModal('video-record')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <Video className="w-4 h-4 fill-slate-950" />
              <span>Record Your Video Tribute Now</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              All Tributes ({tributes.length})
            </button>

            <button
              onClick={() => setActiveFilter('video')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeFilter === 'video'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({tributes.filter((t) => t.type !== 'text').length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('text')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeFilter === 'text'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Written Letters ({tributes.filter((t) => t.type !== 'video').length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('featured')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeFilter === 'featured'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Spotlighted</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, city, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

        </div>

        {/* Tribute Cards Grid */}
        {filteredTributes.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-4">
            <Video className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-lg font-serif font-bold text-slate-300">
              No tributes match this filter yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to record a video tribute or write a birthday greeting in this category!
            </p>
            <button
              onClick={() => onOpenUploadModal('video-record')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
            >
              Record First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTributes.map((tribute) => {
              const hasVideo = tribute.type === 'video' || tribute.type === 'both';

              return (
                <div
                  key={tribute.id}
                  className="rounded-2xl bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/50 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div>
                    {/* VIDEO PLAYER PREVIEW IF APPLICABLE */}
                    {hasVideo && (
                      <div 
                        onClick={() => onSelectVideo(tribute)}
                        className="relative aspect-video bg-black overflow-hidden cursor-pointer group/video"
                      >
                        {tribute.videoUrl ? (
                          <video
                            src={tribute.videoUrl}
                            preload="metadata"
                            className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-950">
                            <Video className="w-10 h-10 text-amber-400/50" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover/video:scale-110 group-hover/video:bg-amber-400 transition-all">
                            <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                          </div>
                        </div>

                        {/* Video Duration Badge */}
                        {tribute.videoDuration && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold text-white">
                            {tribute.videoDuration}
                          </span>
                        )}

                        {/* Video Tribute Badge */}
                        <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center gap-1 uppercase">
                          <Video className="w-3 h-3 text-amber-400" />
                          Video Tribute
                        </span>
                      </div>
                    )}

                    {/* TEXT CONTENT / TESTIMONY */}
                    <div className="p-6 space-y-4">
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {tribute.photoUrl ? (
                            <img
                              src={tribute.photoUrl}
                              alt={tribute.authorName}
                              className="w-11 h-11 rounded-full object-cover border border-amber-500/40"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-sm font-serif">
                              {tribute.authorName.charAt(0)}
                            </div>
                          )}

                          <div>
                            <h4 className="font-serif font-bold text-white text-base leading-snug">
                              {tribute.authorName}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{tribute.authorLocation}</span>
                            </div>
                          </div>
                        </div>

                        {tribute.isFeatured && (
                          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Premium Featured Tribute">
                            <Crown className="w-4 h-4 fill-amber-400" />
                          </span>
                        )}
                      </div>

                      {/* Relationship Pill */}
                      <div className="inline-block px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-semibold text-amber-300/90">
                        {tribute.relationship}
                      </div>

                      {/* Message Body */}
                      <div className="text-slate-300 text-xs sm:text-sm leading-relaxed relative">
                        <p className="line-clamp-4 italic">
                          “{tribute.message}”
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-500">
                        {new Date(tribute.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER: REACTION & ACTION BAR */}
                  <div className="px-6 py-3.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Amen Button */}
                      <button
                        onClick={(e) => handleAmen(e, tribute.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors group/amen"
                      >
                        <span className="group-hover/amen:scale-125 transition-transform">🙏</span>
                        <span className="text-[11px] font-mono font-bold">{tribute.amens}</span>
                      </button>

                      {/* Heart Button */}
                      <button
                        onClick={(e) => handleLike(e, tribute.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                        <span className="text-[11px] font-mono font-bold">{tribute.likes}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Share link button */}
                      <button
                        onClick={(e) => handleShare(e, tribute)}
                        title="Copy tribute link"
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                      >
                        {copiedId === tribute.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
