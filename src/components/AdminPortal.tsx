import React, { useState } from 'react';
import { Tribute } from '../types';
import { 
  X, 
  Lock, 
  Unlock, 
  Download, 
  Trash2, 
  Video, 
  Heart, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Star,
  FileSpreadsheet,
  FileJson,
  Play
} from 'lucide-react';
import { verifyAdminPassword, getAdminDownloadUrl } from '../utils/storage';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onAdminLogin: (password: string) => void;
  onAdminLogout: () => void;
  tributes: Tribute[];
  onDeleteTribute: (id: string) => void;
  onToggleSpotlight: (id: string) => void;
  onPlayVideo: (tribute: Tribute) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onAdminLogin,
  onAdminLogout,
  tributes,
  onDeleteTribute,
  onToggleSpotlight,
  onPlayVideo,
}) => {
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'text'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const valid = await verifyAdminPassword(password);
    if (valid) {
      onAdminLogin(password);
      setPassword('');
    } else {
      setLoginError('Invalid admin password. Please try again.');
    }
  };

  const filtered = tributes.filter((t) => {
    if (filterType === 'video' && t.type === 'text') return false;
    if (filterType === 'text' && t.type === 'video') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.authorName.toLowerCase().includes(q) ||
        t.authorLocation.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const videoTributes = tributes.filter((t) => t.type !== 'text' && t.videoUrl);

  const handleExportCSV = () => {
    const headers = ['Author Name', 'Location', 'Relationship', 'Type', 'Message', 'Video Link', 'Date', 'Amens'];
    const rows = tributes.map((t) => [
      `"${t.authorName.replace(/"/g, '""')}"`,
      `"${t.authorLocation.replace(/"/g, '""')}"`,
      `"${t.relationship.replace(/"/g, '""')}"`,
      t.type,
      `"${t.message.replace(/"/g, '""')}"`,
      t.videoUrl || '',
      t.createdAt,
      t.amens,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `pastor-paul-rika-all-tributes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleDownloadSingleVideo = (tribute: Tribute) => {
    if (!tribute.videoUrl) return;
    const downloadUrl = getAdminDownloadUrl(tribute.videoUrl, 'admin1234');
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `pastor-paul-rika-tribute-${tribute.authorName.replace(/\s+/g, '-')}.mp4`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-black text-white flex items-center gap-2">
                <span>Admin Portal</span>
                {isAdmin && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans font-bold uppercase">
                    Authenticated
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Pastor Paul Rika Birthday Hub • Video Download & Moderation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Log Out
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isAdmin ? (
          // LOGIN VIEW
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-serif font-black text-white">
                Admin Authentication
              </h4>
              <p className="text-xs text-slate-400">
                Enter your admin password to manage and download tributes
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 text-center tracking-widest font-mono"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl transition-all"
              >
                Access Admin Dashboard
              </button>
            </form>
          </div>
        ) : (
          // ADMIN DASHBOARD
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total Videos</span>
                  <span className="text-2xl font-black font-serif text-amber-400">
                    {videoTributes.length}
                  </span>
                  <span className="text-[11px] text-emerald-400 block mt-0.5">Ready for Download</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Written Testimonies</span>
                  <span className="text-2xl font-black font-serif text-white">
                    {tributes.filter((t) => t.type !== 'video').length}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Heartfelt stories</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Bulk Export</span>
                  <button
                    onClick={handleExportCSV}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download Excel / CSV</span>
                  </button>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({tributes.length})
                </button>
                <button
                  onClick={() => setFilterType('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                    filterType === 'video' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3 h-3" /> Videos Only ({videoTributes.length})
                </button>
                <button
                  onClick={() => setFilterType('text')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                    filterType === 'text' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-3 h-3" /> Text Only ({tributes.filter((t) => t.type === 'text').length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Tributes List */}
            <div className="space-y-3">
              {filtered.map((tribute) => {
                const hasVideo = tribute.type === 'video' || tribute.type === 'both';

                return (
                  <div
                    key={tribute.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {hasVideo && tribute.videoUrl ? (
                        <div 
                          onClick={() => onPlayVideo(tribute)}
                          className="relative w-20 h-14 bg-black rounded-lg overflow-hidden shrink-0 cursor-pointer group/vid"
                        >
                          <video src={tribute.videoUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/vid:bg-black/20">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center shrink-0">
                          {tribute.authorName.charAt(0)}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            {tribute.authorName}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            • {tribute.authorLocation}
                          </span>
                          <span className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full border border-slate-800 font-medium">
                            {tribute.relationship}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 italic">
                          “{tribute.message}”
                        </p>
                        <span className="text-[10px] text-slate-500 block">
                          Submitted on {new Date(tribute.createdAt).toLocaleDateString()} • {tribute.amens} Amens
                        </span>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {/* Spotlight Toggle */}
                      <button
                        onClick={() => onToggleSpotlight(tribute.id)}
                        title={tribute.isFeatured ? 'Remove Spotlight' : 'Spotlight on Wall'}
                        className={`p-2 rounded-xl transition-colors ${
                          tribute.isFeatured
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${tribute.isFeatured ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Download Button: Only Visible & Accessible by Admin */}
                      {hasVideo && tribute.videoUrl && (
                        <button
                          onClick={() => handleDownloadSingleVideo(tribute)}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                          title="Download this video to your computer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Video</span>
                        </button>
                      )}

                      {/* Delete Button: Only Accessible by Admin */}
                      {deleteConfirmId === tribute.id ? (
                        <div className="flex items-center gap-1.5 bg-red-950/60 p-1 rounded-xl border border-red-500/40">
                          <span className="text-[10px] text-red-300 font-bold px-1">Delete?</span>
                          <button
                            onClick={() => {
                              onDeleteTribute(tribute.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(tribute.id)}
                          className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete tribute"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
