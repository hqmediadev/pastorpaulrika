import React from 'react';
import { Video, ArrowUp, Lock } from 'lucide-react';

interface FooterProps {
  onOpenUploadModal: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenUploadModal, onOpenAdmin, isAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-amber-500/20 text-slate-400 py-16 relative overflow-hidden">
      {/* Subtle gold footer aura */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-12 border-b border-slate-800">
          
          <div className="md:col-span-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                PASTOR PAUL RIKA
              </span>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase">
                HOREMOW Worldwide
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              International Director of Holiness Revival Movement Worldwide. Celebrating decades of uncompromising holiness, truth, and preparation for heaven.
            </p>
            <p className="text-xs text-amber-200/80 italic font-serif">
              “Follow peace with all men, and holiness, without which no man shall see the Lord.” — Hebrews 12:14
            </p>
          </div>

          <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-3">
            <button
              onClick={onOpenUploadModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:from-amber-300 hover:to-yellow-400"
            >
              <Video className="w-4 h-4 fill-slate-950" />
              <span>Record Video Tribute</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Admin Portal'}</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} Holiness Revival Movement Worldwide (HOREMOW). All glory belongs to Jesus Christ.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with love & prayers for God’s servant</span>
            <span className="text-rose-500">♥</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
