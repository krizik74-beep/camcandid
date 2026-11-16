import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Image as ImageIcon,
  X,
  Film,
  Send
} from 'lucide-react';
import type { CandidEvent, CandidPhoto, FrameStyle, PhotoFilter } from '../types';
import { cameraSound } from '../utils/audio';
import { renderFramedPhoto } from '../utils/canvas';
import confetti from 'canvas-confetti';

interface CameraScreenProps {
  currentEvent: CandidEvent;
  guestName: string;
  setGuestName: (name: string) => void;
  photosRemaining: number;
  setPhotosRemaining: React.Dispatch<React.SetStateAction<number>>;
  onPhotoSaved: (newPhoto: CandidPhoto) => void;
  onClose: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  currentEvent,
  guestName,
  setGuestName,
  photosRemaining,
  setPhotosRemaining,
  onPhotoSaved,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('kodak90s');
  const [selectedFrame, setSelectedFrame] = useState<FrameStyle>(currentEvent.defaultFrameStyle || 'polaroid');

  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Captured snapshot state for confirmation modal
  const [capturedRawUrl, setCapturedRawUrl] = useState<string | null>(null);
  const [framedPreviewUrl, setFramedPreviewUrl] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState<string>('');
  const [tempGuestName, setTempGuestName] = useState<string>(guestName || '');

  // Initialize camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setStreamActive(true);
          }
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable. Fallback mode enabled.', err);
        setStreamActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Flash toggle cycle
  const toggleFlash = () => {
    if (flashMode === 'auto') {
      setFlashMode('on');
      cameraSound.playFlashWhine();
    } else if (flashMode === 'on') {
      setFlashMode('off');
    } else {
      setFlashMode('auto');
    }
  };

  // Flip camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture Photo
  const handleShutter = async () => {
    if (photosRemaining <= 0 && currentEvent.maxPhotosPerGuest > 0) {
      alert('Kuota foto kamu untuk acara ini sudah habis! Hubungi penyelenggara bila butuh tambahan.');
      return;
    }

    setIsProcessing(true);

    // Audio & Flash effect
    const shouldFlash = flashMode === 'on' || (flashMode === 'auto' && Math.random() > 0.4);
    if (shouldFlash) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 400);
    }

    cameraSound.playShutterSound();

    let rawDataUrl = '';

    if (streamActive && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          // Mirror selfie camera
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    } else {
      // High-quality mock celebration candid photo if camera is unavailable
      const mockPool = [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1080&q=80',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1080&q=80',
      ];
      rawDataUrl = mockPool[Math.floor(Math.random() * mockPool.length)];
    }

    setCapturedRawUrl(rawDataUrl);

    // Advance film winding sound
    setTimeout(() => {
      cameraSound.playFilmAdvance();
    }, 450);

    // Render framed preview
    try {
      const rendered = await renderFramedPhoto({
        imageSrc: rawDataUrl,
        frameStyle: selectedFrame,
        filter: selectedFilter,
        guestName: tempGuestName || guestName || 'Tamu Istimewa',
        caption: captionInput,
        eventTitle: currentEvent.hosts || currentEvent.title,
        hashtag: currentEvent.hashtag,
      });
      setFramedPreviewUrl(rendered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const raw = event.target?.result as string;
      setCapturedRawUrl(raw);
      cameraSound.playShutterSound();
      cameraSound.playFilmAdvance();

      const rendered = await renderFramedPhoto({
        imageSrc: raw,
        frameStyle: selectedFrame,
        filter: selectedFilter,
        guestName: tempGuestName || guestName || 'Tamu Istimewa',
        caption: captionInput,
        eventTitle: currentEvent.hosts || currentEvent.title,
        hashtag: currentEvent.hashtag,
      });
      setFramedPreviewUrl(rendered);
    };
    reader.readAsDataURL(file);
  };

  // Re-render framed preview when user edits caption or frame in the modal
  const updateFramedPreview = async (
    newFrame: FrameStyle,
    newFilter: PhotoFilter,
    newCaption: string,
    newName: string
  ) => {
    if (!capturedRawUrl) return;
    try {
      const rendered = await renderFramedPhoto({
        imageSrc: capturedRawUrl,
        frameStyle: newFrame,
        filter: newFilter,
        guestName: newName || 'Tamu Istimewa',
        caption: newCaption,
        eventTitle: currentEvent.hosts || currentEvent.title,
        hashtag: currentEvent.hashtag,
      });
      setFramedPreviewUrl(rendered);
    } catch (e) {
      console.error(e);
    }
  };

  // Finalize and save photo
  const handleConfirmPhoto = () => {
    if (!framedPreviewUrl) return;

    const finalGuestName = tempGuestName.trim() || guestName || 'Tamu Tanpa Nama';
    setGuestName(finalGuestName);

    const newPhoto: CandidPhoto = {
      id: `candid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      eventId: currentEvent.id,
      guestName: finalGuestName,
      photoUrl: framedPreviewUrl,
      caption: captionInput.trim(),
      filter: selectedFilter,
      frameStyle: selectedFrame,
      likes: 1,
      likedByMe: true,
      createdAt: new Date().toISOString(),
    };

    onPhotoSaved(newPhoto);

    // Decrement quota
    if (currentEvent.maxPhotosPerGuest > 0) {
      setPhotosRemaining((prev) => Math.max(0, prev - 1));
    }

    // Audio & celebratory confetti
    cameraSound.playSuccessChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#8F3E22', '#24211E', '#FFFFFF'],
    });

    // Reset preview
    setCapturedRawUrl(null);
    setFramedPreviewUrl(null);
    setCaptionInput('');
  };

  const filters: { id: PhotoFilter; label: string; tone: string }[] = [
    { id: 'kodak90s', label: 'Kodak 90s', tone: 'bg-amber-100 text-amber-900 border-amber-300' },
    { id: 'fuji_clean', label: 'Fuji Clean', tone: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
    { id: 'bw_noir', label: 'Ilford B&W', tone: 'bg-neutral-800 text-neutral-100 border-neutral-600' },
    { id: 'golden_hour', label: 'Golden Hour', tone: 'bg-orange-100 text-orange-900 border-orange-300' },
    { id: 'vintage_warm', label: 'Warm 70s', tone: 'bg-stone-200 text-stone-900 border-stone-400' },
    { id: 'normal', label: 'Natural', tone: 'bg-white text-gray-800 border-gray-300' },
  ];

  const frameOptions: { id: FrameStyle; label: string }[] = [
    { id: 'polaroid', label: 'Polaroid' },
    { id: 'film35mm', label: '35mm Film' },
    { id: 'gold_luxury', label: 'Gold Foil' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'kraft', label: 'Kraft Card' },
  ];

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-[#191716] flex flex-col justify-between items-center p-3 sm:p-6 select-none relative overflow-hidden">
      {/* Visual Flash Burst Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* Top Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-between text-white/90 z-10 px-2 py-1">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors cursor-pointer"
          title="Tutup Kamera"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Remaining Photos Counter Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono-retro text-xs font-bold tracking-wider text-amber-300">
            {currentEvent.maxPhotosPerGuest > 0 ? `${photosRemaining} FOTO TERSISA` : 'UNLIMITED'}
          </span>
        </div>

        {/* Flash Mode Toggle */}
        <button
          onClick={toggleFlash}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors flex items-center gap-1 cursor-pointer"
          title="Atur Flash"
        >
          {flashMode === 'off' ? (
            <ZapOff className="w-5 h-5 text-white/60" />
          ) : (
            <Zap className={`w-5 h-5 ${flashMode === 'on' ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider">{flashMode}</span>
        </button>
      </div>

      {/* Retro Disposable Camera Body / Viewfinder */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center items-center my-2 relative">
        <div className="w-full aspect-[4/5] max-h-[58svh] rounded-3xl bg-[#282523] border-4 border-[#3D3834] shadow-2xl overflow-hidden relative flex items-center justify-center">
          {/* Live Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${
              selectedFilter === 'bw_noir'
                ? 'grayscale contrast-125'
                : selectedFilter === 'golden_hour'
                ? 'sepia-[0.3] hue-rotate-[-10deg] brightness-105'
                : selectedFilter === 'kodak90s'
                ? 'contrast-115 saturate-125 sepia-[0.2]'
                : ''
            }`}
          />

          {/* Viewfinder Target Overlay */}
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
              <div className="text-[10px] font-mono-retro tracking-widest text-white/70 bg-black/40 px-2 py-0.5 rounded">
                EXP {11 - photosRemaining}/10
              </div>
              <div className="w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
            </div>

            <div className="self-center flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
              <div className="text-[11px] font-serif text-white/80 bg-black/40 px-2.5 py-0.5 rounded backdrop-blur-sm">
                {currentEvent.hashtag}
              </div>
              <div className="w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
            </div>
          </div>

          {/* Camera Flip Button (Inside Viewfinder) */}
          <button
            onClick={flipCamera}
            className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer z-10"
            title="Ganti Kamera Depan/Belakang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Selection Strip */}
      <div className="w-full max-w-md py-1 overflow-x-auto no-scrollbar flex items-center gap-2 px-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all cursor-pointer ${
              selectedFilter === f.id
                ? 'scale-105 shadow-md ring-2 ring-amber-400 font-bold ' + f.tone
                : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bottom Shutter Controls */}
      <div className="w-full max-w-md bg-[#24211E]/90 border border-white/10 backdrop-blur-lg rounded-2xl p-4 flex items-center justify-between gap-4 mt-2">
        {/* Upload from Gallery fallback */}
        {currentEvent.allowGalleryUpload ? (
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex flex-col items-center"
              title="Unggah dari Galeri HP"
            >
              <ImageIcon className="w-5 h-5 text-white/80" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="w-11" />
        )}

        {/* Big Shutter Button */}
        <div className="flex-1 flex justify-center">
          <button
            disabled={isProcessing || (photosRemaining <= 0 && currentEvent.maxPhotosPerGuest > 0)}
            onClick={handleShutter}
            className={`w-20 h-20 rounded-full border-4 border-[#EAE2D5] bg-gradient-to-tr from-[#94381C] to-[#E3542C] shadow-lg active:scale-90 transition-all flex items-center justify-center cursor-pointer ${
              isProcessing ? 'opacity-50 animate-pulse' : 'hover:scale-105'
            }`}
          >
            <div className="w-14 h-14 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center">
              <Camera className="w-7 h-7 text-white" />
            </div>
          </button>
        </div>

        {/* Frame Style Quick Switcher */}
        <div className="flex flex-col items-end">
          <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1">Bingkai</label>
          <select
            value={selectedFrame}
            onChange={(e) => setSelectedFrame(e.target.value as FrameStyle)}
            className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
          >
            {frameOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#24211E] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Captured Photo Preview & Sign Modal */}
      {framedPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-[#FAF7F2] rounded-3xl p-5 shadow-2xl border border-[#E8DFD3] flex flex-col items-center text-[#24211E] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-[#E8DFD3]">
              <span className="font-serif font-bold text-base">Hasil Jepretan Candid</span>
              <button
                onClick={() => {
                  setFramedPreviewUrl(null);
                  setCapturedRawUrl(null);
                }}
                className="p-1.5 rounded-full hover:bg-black/5 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Framed Photo Output Preview */}
            <div className="w-full max-h-[46svh] flex justify-center items-center my-2 overflow-hidden rounded-xl bg-black/5 p-1">
              <img
                src={framedPreviewUrl}
                alt="Framed Preview"
                className="max-h-[44svh] object-contain rounded-lg shadow-polaroid"
              />
            </div>

            {/* Inputs: Guest Name & Caption/Wishes */}
            <div className="w-full space-y-2.5 mt-2">
              <div>
                <label className="block text-[11px] font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Nama Kamu (Tamu):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi & Sarah"
                  value={tempGuestName}
                  onChange={(e) => {
                    setTempGuestName(e.target.value);
                    updateFramedPreview(selectedFrame, selectedFilter, captionInput, e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD1C2] bg-white focus:outline-none focus:ring-2 focus:ring-[#8F3E22]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Pesan / Ucapan Singkat (opsional):
                </label>
                <input
                  type="text"
                  placeholder="Selamat berbahagia Sarah & Dimas! 🎉"
                  value={captionInput}
                  maxLength={75}
                  onChange={(e) => {
                    setCaptionInput(e.target.value);
                    updateFramedPreview(selectedFrame, selectedFilter, e.target.value, tempGuestName);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD1C2] bg-white focus:outline-none focus:ring-2 focus:ring-[#8F3E22]"
                />
              </div>

              {/* Confirm / Send Button */}
              <button
                onClick={handleConfirmPhoto}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8F3E22] to-[#B34D29] hover:from-[#7C361D] hover:to-[#9E4323] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3 transition-transform active:scale-98"
              >
                <Send className="w-4 h-4" />
                Kirim & Tayangkan ke Galeri Acara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
