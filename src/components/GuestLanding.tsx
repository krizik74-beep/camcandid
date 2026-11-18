import React, { useState } from 'react';
import {
  Camera,
  Heart,
  Upload,
  User,
  Tv
} from 'lucide-react';
import type { CandidEvent, CandidPhoto } from '../types';

interface GuestLandingProps {
  currentEvent: CandidEvent;
  photos: CandidPhoto[];
  guestName: string;
  setGuestName: (name: string) => void;
  photosRemaining: number;
  onOpenCamera: () => void;
  onOpenLiveDisplay: () => void;
  onToggleLike: (photoId: string) => void;
  onSelectPhoto: (photo: CandidPhoto) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GuestLanding: React.FC<GuestLandingProps> = ({
  currentEvent,
  photos,
  guestName,
  setGuestName,
  photosRemaining,
  onOpenCamera,
  onOpenLiveDisplay,
  onToggleLike,
  onSelectPhoto,
  onFileUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'popular'>('all');
  const [isEditingName, setIsEditingName] = useState<boolean>(!guestName);
  const [tempName, setTempName] = useState<string>(guestName);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setGuestName(tempName.trim());
      setIsEditingName(false);
    }
  };

  // Filter photos
  const filteredPhotos = photos.filter((p) => {
    if (activeTab === 'mine') {
      return guestName && p.guestName.toLowerCase() === guestName.toLowerCase();
    }
    return true;
  });

  if (activeTab === 'popular') {
    filteredPhotos.sort((a, b) => b.likes - a.likes);
  }

  // 15 sprocket holes for the 35mm film roll effect (matches taller 9/16 portrait frame)
  const sprocketCount = 15;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen px-4 pt-3 pb-16 flex flex-col items-center relative overflow-hidden select-none bg-[#F5EAD8]">
      {/* Pressed Daisy Sticker in Top-Right Corner with Washi Tape */}
      <div className="absolute top-1 right-2 w-16 h-16 pointer-events-none z-20 transform rotate-6">
        <img
          src="/daisy_sticker.png"
          alt="Daisy"
          className="w-full h-full object-contain filter drop-shadow-sm opacity-95"
          onError={(e) => {
            // Fallback decorative daisy if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* First Screen Hero — hanya menampilkan foto & judul sampai "The Wedding of" */}
      <section className="w-full min-h-[100svh] flex flex-col items-center justify-center pb-2">
        {/* Top Powered-by Pill Badge */}
        <div className="mt-1 mb-2 inline-flex items-center justify-center">
          <div className="border border-[#D4C3AC] bg-[#F5EAD8]/80 backdrop-blur-xs rounded-full px-4 py-1 text-[11px] font-mono tracking-wider text-[#635543] shadow-2xs">
            Powered by Invistory.com
          </div>
        </div>

        {/* Main Title: Candid Cam with Hand-drawn Heart */}
        <div className="text-center my-1">
          <h1 className="font-calligraphy text-[44px] sm:text-[48px] text-[#28211A] flex items-center justify-center gap-1.5 leading-tight tracking-wide">
            Candid Cam
            <span className="text-[#DE7771] text-2xl filter drop-shadow-xs transform rotate-6 inline-block">
              ♥
            </span>
          </h1>
        </div>

        {/* Centerpiece 35mm Film Roll Frame — includes wedding title overlay */}
        <div className="w-full max-w-[340px] mt-2 relative">
          {/* Dark film border frame with padding */}
          <div className="w-full bg-[#1A1816] rounded-3xl p-2 shadow-2xl border border-black/50 relative">

            {/* Photo container — height capped so wedding title stays above the fold, name input pushed below */}
            <div className="relative rounded-2xl overflow-hidden w-full bg-[#221F1D]"
                 style={{ aspectRatio: '9/16', maxHeight: '58svh' }}>

              {/* Full-Frame Photo */}
              <img
                src="/dimas_devi.jpg"
                alt={currentEvent.hosts}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = currentEvent.coverImage || '/hero_couple.png';
                }}
              />

              {/* Subtle vintage warm vignette overlay */}
              <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/35 pointer-events-none" />

              {/* Left Sprocket Strip — garis putih vertikal dengan lubang film */}
              <div className="absolute top-0 left-0 bottom-0 w-4 bg-white border-r border-black/10 flex flex-col items-center justify-between py-4 select-none z-10">
                <span className="absolute top-1/2 -translate-y-1/2 left-0.5 z-20 text-[5px] font-mono font-bold text-[#B5842E] -rotate-90 whitespace-nowrap tracking-widest pointer-events-none">
                  KODAK 400
                </span>
                {Array.from({ length: sprocketCount }).map((_, i) => (
                  <div
                    key={`left-sprocket-${i}`}
                    className="w-2 h-3 rounded-[2px] bg-[#1A1816] shrink-0"
                  />
                ))}
              </div>

              {/* Right Sprocket Strip — garis putih vertikal dengan lubang film */}
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white border-l border-black/10 flex flex-col items-center justify-between py-4 select-none z-10">
                <span className="absolute top-1/3 right-0.5 z-20 text-[5px] font-mono font-bold text-[#B5842E] rotate-90 whitespace-nowrap tracking-wider pointer-events-none">
                  3A
                </span>
                <span className="absolute top-2/3 right-0.5 z-20 text-[5px] font-mono font-bold text-[#B5842E] rotate-90 whitespace-nowrap tracking-wider pointer-events-none">
                  04A
                </span>
                {Array.from({ length: sprocketCount }).map((_, i) => (
                  <div
                    key={`right-sprocket-${i}`}
                    className="w-2 h-3 rounded-[2px] bg-[#1A1816] shrink-0"
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Decorative Sparkle */}
          <div className="absolute -bottom-4 -right-3 text-[#A89885] text-xl select-none pointer-events-none font-serif">
            ✳
          </div>
        </div>

        {/* Couple Calligraphy Heading — batas akhir tampilan pertama */}
        <div className="text-center mt-4 space-y-0 relative z-10">
          <h2 className="font-calligraphy text-[32px] sm:text-[36px] text-[#2B231C] font-normal leading-tight tracking-wide text-balance">
            The Wedding of Dimas & Devi
          </h2>
          <p className="text-xs text-[#8C7A65] font-medium tracking-wide pt-0.5">
            4/5 peserta bergabung
          </p>
        </div>
      </section>

      {/* Guest Greeting & Remaining Quota Box */}
      <div className="w-full mt-6 bg-white/70 backdrop-blur-sm border border-[#E3D6C5] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EAE0D3] text-[#5C4D3B] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Nama kamu..."
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#D5C6B3] bg-white outline-none w-36 focus:ring-1 focus:ring-[#8F3E22]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-[#8F3E22] text-white text-xs font-semibold cursor-pointer"
                >
                  OK
                </button>
              </form>
            ) : (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#28211A]">{guestName || 'Tamu Istimewa'}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[10px] text-[#8F3E22] underline cursor-pointer"
                  >
                    Ubah
                  </button>
                </div>
                <p className="text-[11px] text-[#786754]">
                  {currentEvent.maxPhotosPerGuest > 0
                    ? `${photosRemaining} foto tersisa`
                    : 'Foto sepuasnya'}
                </p>
              </div>
            )}
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#EAE0D3] text-[#61503C]">
            Tamu
          </span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full space-y-2.5 mt-4">
        {/* Big Shutter / Open Camera Button */}
        <button
          onClick={onOpenCamera}
          className="w-full py-3.5 px-6 rounded-full bg-[#8F3E22] hover:bg-[#78331B] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer tracking-wide"
        >
          <Camera className="w-4 h-4" />
          Buka Disposable Cam
        </button>

        {/* Secondary Buttons Row */}
        <div className="grid grid-cols-2 gap-2.5">
          {currentEvent.allowGalleryUpload && (
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-full bg-white/80 hover:bg-white border border-[#D8C7B2] text-[#4F4132] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Galeri
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileUpload}
                className="hidden"
              />
            </div>
          )}

          <button
            onClick={onOpenLiveDisplay}
            className="w-full py-2.5 px-3 rounded-full bg-white/80 hover:bg-white border border-[#D8C7B2] text-[#4F4132] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Tv className="w-3.5 h-3.5" />
            Layar Proyektor
          </button>
        </div>
      </div>

      {/* Event Photo Feed & Gallery Section */}
      <div className="w-full mt-10 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3D6C5] pb-2">
          <div>
            <h3 className="font-calligraphy text-2xl text-[#2B231C]">Galeri Candid</h3>
            <p className="text-[11px] text-[#7C6C58]">Foto jepretan tamu acara malam ini</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#E8DCcb] p-0.5 rounded-full text-[11px]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#24211E] shadow-2xs font-semibold'
                  : 'text-[#6B5A46]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-white text-[#24211E] shadow-2xs font-semibold'
                  : 'text-[#6B5A46]'
              }`}
            >
              Populer
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-white text-[#24211E] shadow-2xs font-semibold'
                  : 'text-[#6B5A46]'
              }`}
            >
              Milik Saya
            </button>
          </div>
        </div>

        {/* Polaroid Photos Masonry Feed */}
        {filteredPhotos.length === 0 ? (
          <div className="bg-white/60 rounded-2xl p-8 text-center border border-[#E3D6C5] space-y-2">
            <Camera className="w-8 h-8 text-[#8F3E22] mx-auto opacity-70" />
            <p className="text-xs text-[#7C6C58]">
              {activeTab === 'mine'
                ? 'Belum ada foto yang kamu ambil. Buka kamera dan jepret momen candid pertamamu!'
                : 'Belum ada foto. Jadilah yang pertama mengabadikan momen!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => onSelectPhoto(photo)}
                className="bg-white rounded-xl p-2.5 shadow-sm border border-[#E3D6C5] flex flex-col justify-between cursor-pointer transform hover:scale-[1.02] transition-transform"
                style={{
                  transform: `rotate(${((idx % 4) - 1.5) * 1.5}deg)`,
                }}
              >
                <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/5">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || 'Candid'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="pt-2 px-0.5">
                  {photo.caption && (
                    <p className="font-handwriting text-xs text-[#2B231C] line-clamp-1">
                      "{photo.caption}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-[#F0E8DC] text-[10px]">
                    <span className="font-medium text-[#7C6C58] truncate max-w-[80px]">
                      {photo.guestName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(photo.id);
                      }}
                      className="flex items-center gap-1 text-[#7C6C58] cursor-pointer"
                    >
                      <Heart
                        className={`w-3 h-3 ${
                          photo.likedByMe ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      <span>{photo.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
