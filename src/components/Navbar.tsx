import React from 'react';
import { Video, Lock, Unlock, Crown } from 'lucide-react';

interface NavbarProps {
  onOpenUploadModal: (defaultTab?: 'video-record' | 'video-upload' | 'text') => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUploadModal,
  onOpenAdmin,
  isAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Simple, clean title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400 font-serif font-black text-lg">
              ✝
            </div>
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-lg sm:text-xl text-white tracking-wide leading-tight">
              Pastor Paul Rika
            </h1>
            <p className="text-xs sm:text-sm text-amber-300/90 font-medium tracking-wide">
              International Director, Holiness Revival Movement Worldwide
            </p>
          </div>
        </div>

        {/* Minimal actions: Upload Tribute with Premium Icon and Admin Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenUploadModal('video-record')}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span>Upload Tribute</span>
            <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
          </button>

          {/* Admin Button */}
          <button
            onClick={onOpenAdmin}
            title={isAdmin ? 'Admin Dashboard (Logged in)' : 'Admin Login (Download & Manage Videos)'}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isAdmin
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
