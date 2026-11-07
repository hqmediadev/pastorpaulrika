/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tribute } from './types';
import { 
  loadStoredTributes, 
  saveStoredTributes,
  loadStoredBlessings,
  saveStoredBlessings,
  fetchServerTributes,
  syncTributeToServer,
  deleteTributeFromServer,
  deleteVideoBlob,
  getAdminSession,
  setAdminSession
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutPastor } from './components/AboutPastor';
import { TributeWall } from './components/TributeWall';
import { FlyerShowcase } from './components/FlyerShowcase';
import { TributeUploadModal } from './components/TributeUploadModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { Video, Crown } from 'lucide-react';

export default function App() {
  const [tributes, setTributes] = useState<Tribute[]>(() => loadStoredTributes() ?? []);

  const [blessingsCount, setBlessingsCount] = useState<number>(loadStoredBlessings);
  const [isAdmin, setIsAdmin] = useState<boolean>(getAdminSession);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadModalTab, setUploadModalTab] = useState<'video-record' | 'text'>('video-record');
  const [selectedVideoTribute, setSelectedVideoTribute] = useState<Tribute | null>(null);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);

  // Load from VPS server on mount
  useEffect(() => {
    fetchServerTributes().then((serverTributes) => {
      if (serverTributes !== null) {
        setTributes(serverTributes);
      }
    });
  }, []);

  // Save tributes whenever they change
  useEffect(() => {
    saveStoredTributes(tributes);
  }, [tributes]);

  // Save blessings count
  useEffect(() => {
    saveStoredBlessings(blessingsCount);
  }, [blessingsCount]);

  const handleOpenUpload = (tab: 'video-record' | 'text' = 'video-record') => {
    setUploadModalTab(tab);
    setUploadModalOpen(true);
  };

  const handleAddTribute = (newTribute: Tribute) => {
    setTributes((prev) => [newTribute, ...prev]);
    // Sync to VPS server storage
    syncTributeToServer(newTribute);
  };

  const handleLikeTribute = (id: string) => {
    setTributes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, likes: t.likes + 1 } : t))
    );
  };

  const handleAmenTribute = (id: string) => {
    setTributes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, amens: t.amens + 1 } : t))
    );
    setBlessingsCount((prev) => prev + 1);
  };

  const handleSendBlessing = () => {
    setBlessingsCount((prev) => prev + 1);
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'admin1234') {
      setIsAdmin(true);
      setAdminSession(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminSession(false);
  };

  // Only Admin can delete
  const handleDeleteTribute = async (id: string) => {
    await deleteTributeFromServer(id, 'admin1234');
    await deleteVideoBlob(id);
    setTributes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleSpotlight = (id: string) => {
    setTributes((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, isFeatured: !t.isFeatured } : t
      );
      const modified = updated.find((t) => t.id === id);
      if (modified) syncTributeToServer(modified);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Clean, Simple Navigation Header with Admin Access */}
      <Navbar
        onOpenUploadModal={handleOpenUpload}
        onOpenAdmin={() => setAdminPortalOpen(true)}
        isAdmin={isAdmin}
      />

      <main>
        {/* Dignified Hero Section */}
        <Hero
          blessingsCount={blessingsCount}
          onSendBlessing={handleSendBlessing}
          onOpenUploadModal={handleOpenUpload}
        />

        {/* Biography & Holiness Movement Impact */}
        <AboutPastor onOpenUploadModal={handleOpenUpload} />

        {/* Community Tribute Wall (Public visitors can watch & listen, only Admin can download) */}
        <TributeWall
          tributes={tributes}
          onSelectVideo={(t) => setSelectedVideoTribute(t)}
          onOpenUploadModal={handleOpenUpload}
          onLikeTribute={handleLikeTribute}
          onAmenTribute={handleAmenTribute}
        />

        {/* Official Birthday Flyer & Personalized Social Card Generator */}
        <FlyerShowcase onOpenUploadModal={() => handleOpenUpload('video-record')} />
      </main>

      {/* Footer with Admin Access */}
      <Footer
        onOpenUploadModal={() => handleOpenUpload('video-record')}
        onOpenAdmin={() => setAdminPortalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Persistent floating tribute button */}
      <div className="fixed right-3 z-40 bottom-[calc(env(safe-area-inset-bottom)+1rem)] sm:right-6 sm:bottom-6">
        <button
          onClick={() => handleOpenUpload('video-record')}
          className="group relative flex items-center gap-2 px-3.5 py-3 sm:gap-2.5 sm:px-5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative">
            <Video className="w-4 h-4 fill-slate-950" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-ping" />
          </div>
          <span className="tracking-wide">Record Tribute</span>
          <div className="hidden sm:flex w-5 h-5 rounded-full bg-slate-950/20 items-center justify-center" title="Premium Featured">
            <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
          </div>
        </button>
      </div>

      {/* Tribute submission modal */}
      <TributeUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultTab={uploadModalTab}
        onSubmitTribute={handleAddTribute}
      />

      {/* Theater Video Player Modal (Public Playback, No Public Download) */}
      <VideoPlayerModal
        tribute={selectedVideoTribute}
        onClose={() => setSelectedVideoTribute(null)}
        onAmen={handleAmenTribute}
        onLike={handleLikeTribute}
      />

      {/* Admin Portal (Password: admin1234 - Download Videos & Delete Submissions) */}
      <AdminPortal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        isAdmin={isAdmin}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
        tributes={tributes}
        onDeleteTribute={handleDeleteTribute}
        onToggleSpotlight={handleToggleSpotlight}
        onPlayVideo={(t) => {
          setSelectedVideoTribute(t);
        }}
      />

    </div>
  );
}
