import React, { useState, useEffect } from 'react';
import type { CandidEvent, CandidPhoto } from './types';
import {
  getStoredEvents,
  getStoredPhotos,
  saveNewPhoto,
  togglePhotoLike,
  deletePhoto,
  getGuestSession,
  saveGuestSession,
  DEFAULT_EVENT
} from './utils/storage';
import { renderFramedPhoto } from './utils/canvas';
import { cameraSound } from './utils/audio';

import { GuestLanding } from './components/GuestLanding';
import { CameraScreen } from './components/CameraScreen';
import { LiveDisplay } from './components/LiveDisplay';
import { HostDashboard } from './components/HostDashboard';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { PrintableTentCard } from './components/PrintableTentCard';

import { Settings, Tv, ArrowLeft, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import './App.css';

export function App() {
  const [events, setEvents] = useState<CandidEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<CandidEvent>(DEFAULT_EVENT);
  const [photos, setPhotos] = useState<CandidPhoto[]>([]);
  const [currentTab, setCurrentTab] = useState<'guest' | 'camera' | 'display' | 'admin'>('guest');

  // Guest State
  const [guestName, setGuestName] = useState<string>('');
  const [photosRemaining, setPhotosRemaining] = useState<number>(10);

  // Modals
  const [selectedPhoto, setSelectedPhoto] = useState<CandidPhoto | null>(null);
  const [showPrintCard, setShowPrintCard] = useState<boolean>(false);

  // Initialize events & check URL params
  useEffect(() => {
    const loadedEvents = getStoredEvents();
    setEvents(loadedEvents);

    const urlParams = new URLSearchParams(window.location.search);
    const candidId = urlParams.get('candidId');
    if (candidId) {
      const match = loadedEvents.find((e) => e.id === candidId);
      if (match) {
        setCurrentEvent(match);
      }
    } else {
      setCurrentEvent(loadedEvents[0] || DEFAULT_EVENT);
    }
  }, []);

  // Load photos and guest session whenever currentEvent changes
  useEffect(() => {
    if (!currentEvent) return;

    // Photos
    const eventPhotos = getStoredPhotos(currentEvent.id);
    setPhotos(eventPhotos);

    // Guest Session
    const session = getGuestSession(currentEvent.id, currentEvent.maxPhotosPerGuest);
    setGuestName(session.guestName || '');
    setPhotosRemaining(session.photosRemaining);
  }, [currentEvent]);

  // Sync photos from local events
  useEffect(() => {
    const handleStorageUpdate = () => {
      if (currentEvent) {
        setPhotos(getStoredPhotos(currentEvent.id));
        setEvents(getStoredEvents());
      }
    };

    window.addEventListener('candidsnap_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('candidsnap_storage_updated', handleStorageUpdate);
  }, [currentEvent]);

  // Save guest session on changes
  useEffect(() => {
    if (!currentEvent) return;
    saveGuestSession(currentEvent.id, {
      guestName,
      photosRemaining,
      takenPhotoIds: [],
    });
  }, [guestName, photosRemaining, currentEvent]);

  // Handler: Photo Saved
  const handlePhotoSaved = (newPhoto: CandidPhoto) => {
    saveNewPhoto(newPhoto);
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  // Handler: Like Photo
  const handleToggleLike = (photoId: string) => {
    const result = togglePhotoLike(photoId);
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, likes: result.likes, likedByMe: result.likedByMe } : p
      )
    );
    if (selectedPhoto && selectedPhoto.id === photoId) {
      setSelectedPhoto((prev) =>
        prev ? { ...prev, likes: result.likes, likedByMe: result.likedByMe } : null
      );
    }
  };

  // Handler: Delete Photo
  const handleDeletePhoto = (photoId: string) => {
    deletePhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Handler: File Upload from Guest Landing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photosRemaining <= 0 && currentEvent.maxPhotosPerGuest > 0) {
      alert('Kuota foto kamu untuk acara ini sudah habis!');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const raw = event.target?.result as string;
      cameraSound.playShutterSound();

      try {
        const framed = await renderFramedPhoto({
          imageSrc: raw,
          frameStyle: currentEvent.defaultFrameStyle || 'polaroid',
          filter: 'kodak90s',
          guestName: guestName || 'Tamu Istimewa',
          caption: 'Candid moments!',
          eventTitle: currentEvent.hosts || currentEvent.title,
          hashtag: currentEvent.hashtag,
        });

        const newPhoto: CandidPhoto = {
          id: `candid-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          eventId: currentEvent.id,
          guestName: guestName || 'Tamu Istimewa',
          photoUrl: framed,
          caption: 'Candid moments!',
          filter: 'kodak90s',
          frameStyle: currentEvent.defaultFrameStyle || 'polaroid',
          likes: 1,
          likedByMe: true,
          createdAt: new Date().toISOString(),
        };

        handlePhotoSaved(newPhoto);
        if (currentEvent.maxPhotosPerGuest > 0) {
          setPhotosRemaining((prev) => Math.max(0, prev - 1));
        }

        cameraSound.playSuccessChime();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#8F3E22', '#24211E'],
        });
      } catch (err) {
        console.error('Failed to process image upload', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset Demo Data
  const handleResetDemo = () => {
    if (confirm('Reset ulang data demo foto dan acara ke kondisi awal?')) {
      localStorage.removeItem('candidsnap_events');
      localStorage.removeItem('candidsnap_photos');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#28211A] flex flex-col justify-between selection:bg-[#E2D1BD]">
      {/* If in admin mode, show a clean header with a back button */}
      {currentTab === 'admin' && (
        <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD3] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentTab('guest')}
            className="flex items-center gap-2 text-xs font-semibold text-[#8F3E22] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Tampilan Tamu
          </button>
          <span className="text-xs font-mono font-medium text-[#7C6C58]">Panel Penyelenggara</span>
        </header>
      )}

      {/* Main Content Area - Headerless and authentic for the guest view */}
      <main className="flex-1">
        {currentTab === 'guest' && (
          <GuestLanding
            currentEvent={currentEvent}
            photos={photos}
            guestName={guestName}
            setGuestName={setGuestName}
            photosRemaining={photosRemaining}
            onOpenCamera={() => setCurrentTab('camera')}
            onOpenLiveDisplay={() => setCurrentTab('display')}
            onToggleLike={handleToggleLike}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
            onFileUpload={handleFileUpload}
          />
        )}

        {currentTab === 'camera' && (
          <CameraScreen
            currentEvent={currentEvent}
            guestName={guestName}
            setGuestName={setGuestName}
            photosRemaining={photosRemaining}
            setPhotosRemaining={setPhotosRemaining}
            onPhotoSaved={handlePhotoSaved}
            onClose={() => setCurrentTab('guest')}
          />
        )}

        {currentTab === 'display' && (
          <LiveDisplay
            currentEvent={currentEvent}
            photos={photos}
            onClose={() => setCurrentTab('guest')}
          />
        )}

        {currentTab === 'admin' && (
          <HostDashboard
            currentEvent={currentEvent}
            events={events}
            onSelectEvent={(ev) => setCurrentEvent(ev)}
            onUpdateEvent={(updated) => setCurrentEvent(updated)}
            onCreateNewEvent={(newEv) => {
              setEvents((prev) => [newEv, ...prev]);
              setCurrentEvent(newEv);
            }}
            photos={photos}
            onOpenPrintCard={() => setShowPrintCard(true)}
            onViewPhoto={(photo) => setSelectedPhoto(photo)}
          />
        )}
      </main>

      {/* Discreet Bottom Controls (Only in Guest View, subtle and unobtrusive) */}
      {currentTab === 'guest' && (
        <div className="py-6 text-center text-xs text-[#8C7A65]">
          <div className="flex items-center justify-center gap-4 text-[11px] mb-2">
            <button
              onClick={() => setCurrentTab('display')}
              className="flex items-center gap-1 hover:text-[#28211A] transition-colors cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              Layar Proyektor
            </button>
            <span>•</span>
            <button
              onClick={() => setShowPrintCard(true)}
              className="flex items-center gap-1 hover:text-[#28211A] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Kartu Meja QR
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('admin')}
              className="flex items-center gap-1 hover:text-[#28211A] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Pengaturan
            </button>
            <span>•</span>
            <button
              onClick={handleResetDemo}
              className="hover:text-red-700 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
          <p className="text-[10px] text-[#A69581]">
            Candid Cam • Diabadikan bersama oleh para tamu pesta
          </p>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onToggleLike={handleToggleLike}
          onDelete={handleDeletePhoto}
          isAdmin={currentTab === 'admin'}
        />
      )}

      {/* Printable Tent Card Modal */}
      {showPrintCard && (
        <PrintableTentCard
          currentEvent={currentEvent}
          onClose={() => setShowPrintCard(false)}
        />
      )}
    </div>
  );
}

export default App;
