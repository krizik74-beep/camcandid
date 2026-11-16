import React, { useState, useEffect, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Grid,
  Square,
  QrCode,
  Sparkles,
  Heart,
  X
} from 'lucide-react';
import type { CandidEvent, CandidPhoto } from '../types';
import { generateEventQRCode } from '../utils/storage';

interface LiveDisplayProps {
  currentEvent: CandidEvent;
  photos: CandidPhoto[];
  onClose: () => void;
}

export const LiveDisplay: React.FC<LiveDisplayProps> = ({ currentEvent, photos, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [slideSpeed, setSlideSpeed] = useState<number>(5000); // 5s default
  const [displayMode, setDisplayMode] = useState<'slideshow' | 'wall'>('slideshow');
  const [theme, setTheme] = useState<'dark' | 'warm'>('dark');
  const [showQrCorner, setShowQrCorner] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [newPhotoNotification, setNewPhotoNotification] = useState<CandidPhoto | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate QR
  useEffect(() => {
    generateEventQRCode(currentEvent.id).then((url) => setQrDataUrl(url));
  }, [currentEvent.id]);

  // Slideshow interval
  useEffect(() => {
    if (!isPlaying || photos.length === 0 || displayMode !== 'slideshow') return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, slideSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, photos.length, slideSpeed, displayMode]);

  // Listen for real-time photo events
  useEffect(() => {
    const handleNewPhoto = (e: Event) => {
      const customEvent = e as CustomEvent<CandidPhoto>;
      if (customEvent.detail) {
        setNewPhotoNotification(customEvent.detail);
        setCurrentIndex(0); // Jump to newest photo
        setTimeout(() => {
          setNewPhotoNotification(null);
        }, 7000);
      }
    };

    window.addEventListener('candidsnap_new_photo', handleNewPhoto);
    return () => window.removeEventListener('candidsnap_new_photo', handleNewPhoto);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const activePhoto = photos[currentIndex] || photos[0];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden transition-colors duration-700 ${
        theme === 'dark' ? 'bg-[#0E0D0C] text-white' : 'bg-[#FAF7F2] text-[#24211E]'
      }`}
    >
      {/* Top Ambient Bar */}
      <div className="w-full px-6 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow">
              {currentEvent.hosts}
            </h1>
            <p className="text-xs text-white/70 flex items-center gap-2">
              <span>{currentEvent.venue}</span>
              <span>•</span>
              <span className="font-mono-retro text-amber-300">{currentEvent.hashtag}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white">
          {/* Mode Switcher */}
          <button
            onClick={() => setDisplayMode(displayMode === 'slideshow' ? 'wall' : 'slideshow')}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            title={displayMode === 'slideshow' ? 'Ganti ke Tampilan Dinding Grid' : 'Ganti ke Slideshow'}
          >
            {displayMode === 'slideshow' ? <Grid className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            title={isPlaying ? 'Jeda Slideshow' : 'Lanjutkan'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Speed Switcher */}
          <button
            onClick={() => setSlideSpeed((prev) => (prev === 3000 ? 5000 : prev === 5000 ? 8000 : 3000))}
            className="px-2 py-1 text-[11px] rounded-full hover:bg-white/20 font-mono-retro font-bold cursor-pointer"
            title="Kecepatan Slideshow"
          >
            {slideSpeed / 1000}s
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'warm' : 'dark')}
            className="px-2 py-1 text-[11px] rounded-full hover:bg-white/20 font-medium cursor-pointer"
          >
            {theme === 'dark' ? '🌙 Dark' : '☀️ Warm'}
          </button>

          {/* QR Corner Toggle */}
          <button
            onClick={() => setShowQrCorner(!showQrCorner)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            title="Tampilkan/Sembunyikan QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-red-500/80 transition-colors cursor-pointer"
            title="Keluar Layar Proyektor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Toast Pop-up Notification */}
      {newPhotoNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-[#FAF7F2] text-[#24211E] px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-3 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            📸
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Momen Baru Tertangkap!</div>
            <div className="text-sm font-semibold">{newPhotoNotification.guestName} baru saja mengirim foto!</div>
          </div>
        </div>
      )}

      {/* Main Display Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {photos.length === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-3xl backdrop-blur-md max-w-md">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-spin" />
            <h3 className="text-xl font-bold font-serif mb-2">Menunggu Foto Candid Pertama</h3>
            <p className="text-sm opacity-70">
              Ayo para tamu, scan QR Code di sudut layar dan ambil foto pertama kalian!
            </p>
          </div>
        ) : displayMode === 'slideshow' && activePhoto ? (
          <div className="relative max-h-[78svh] max-w-4xl flex items-center justify-center">
            {/* The Featured Polaroid Card */}
            <div className="relative group p-4 sm:p-6 rounded-3xl bg-white shadow-2xl border border-white/20 transition-all duration-700 transform">
              <img
                key={activePhoto.id}
                src={activePhoto.photoUrl}
                alt={activePhoto.caption || 'Candid display'}
                className="max-h-[62svh] w-auto object-contain rounded-2xl shadow-polaroid animate-in fade-in zoom-in-95 duration-500"
              />

              {/* Bottom Info Banner */}
              <div className="mt-4 flex items-center justify-between text-[#24211E]">
                <div>
                  <h4 className="font-serif font-bold text-lg sm:text-xl">{activePhoto.guestName}</h4>
                  {activePhoto.caption && (
                    <p className="text-sm font-handwriting text-xl text-[#524536] mt-0.5">
                      "{activePhoto.caption}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-[#FAF7F2] px-3.5 py-1.5 rounded-full border border-[#E8DFD3]">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span className="text-xs font-bold">{activePhoto.likes} Suka</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Masonry Grid Mode */
          <div className="w-full max-h-[80svh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
            {photos.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-2xl shadow-md border border-black/5 flex flex-col text-[#24211E] transform hover:scale-102 transition-transform"
              >
                <img
                  src={p.photoUrl}
                  alt={p.caption || 'Grid item'}
                  className="w-full aspect-[4/5] object-cover rounded-xl"
                />
                <div className="mt-2 text-xs font-semibold truncate">{p.guestName}</div>
                {p.caption && (
                  <p className="text-[11px] font-handwriting text-[#6E5C4E] truncate">"{p.caption}"</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Floating QR Code Corner Banner */}
        {showQrCorner && qrDataUrl && (
          <div className="absolute bottom-6 right-6 z-30 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border-2 border-[#D8C7B2] flex items-center gap-4 text-[#24211E] animate-in fade-in slide-in-from-bottom-6 duration-300">
            <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 object-contain rounded-xl" />
            <div className="max-w-[160px]">
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#8F3E22] text-white mb-1">
                Ikutan Foto
              </span>
              <h5 className="font-serif font-bold text-sm leading-tight text-[#24211E]">
                Scan QR & Ambil Candid
              </h5>
              <p className="text-[11px] text-[#7A6C5B] mt-0.5">Langsung tampil di layar ini!</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Progress Bar for Slideshow */}
      {displayMode === 'slideshow' && isPlaying && (
        <div className="w-full h-1 bg-white/10">
          <div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-amber-400 to-[#E3542C] transition-all"
            style={{
              animation: `progress-fill ${slideSpeed}ms linear infinite`,
            }}
          />
        </div>
      )}
    </div>
  );
};
