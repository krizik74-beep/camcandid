import React from 'react';
import { Camera, Tv, Settings, Users, Calendar } from 'lucide-react';
import type { CandidEvent } from '../types';

interface NavbarProps {
  currentTab: 'guest' | 'camera' | 'display' | 'admin';
  setCurrentTab: (tab: 'guest' | 'camera' | 'display' | 'admin') => void;
  currentEvent: CandidEvent;
  events: CandidEvent[];
  onSelectEvent: (event: CandidEvent) => void;
  guestName: string;
  photosRemaining: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentEvent,
  events,
  onSelectEvent,
  guestName,
  photosRemaining,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD3] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('guest')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#24211E] to-[#433B32] text-[#F3ECE1] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-lg tracking-tight text-[#24211E]">CandidSnap</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#EAE2D5] text-[#635543]">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-[#8C7D6B] hidden sm:block">Digital Disposable Camera for Events</p>
            </div>
          </button>
        </div>

        {/* Event Quick Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0E8DC] border border-[#E3D6C5] text-xs text-[#524536]">
          <span className="font-medium text-[#24211E] truncate max-w-[140px]">{currentEvent.hosts}</span>
          <span className="text-[#A89885]">•</span>
          <span className="text-[#756653] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#A89885]" />
            {currentEvent.date}
          </span>
          {events.length > 1 && (
            <select
              value={currentEvent.id}
              onChange={(e) => {
                const found = events.find((ev) => ev.id === e.target.value);
                if (found) onSelectEvent(found);
              }}
              className="ml-1 bg-transparent text-xs font-medium text-[#24211E] outline-none cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.hosts}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Switchers */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Guest Portal */}
          <button
            onClick={() => setCurrentTab('guest')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'guest'
                ? 'bg-[#24211E] text-[#F5EFE6] shadow-sm'
                : 'text-[#615241] hover:bg-[#F0E8DC]'
            }`}
            title="Tampilan Tamu / Beranda Acara"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tamu</span>
            {guestName && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#EAE2D5] text-[#24211E]">
                {photosRemaining}
              </span>
            )}
          </button>

          {/* Retro Camera */}
          <button
            onClick={() => setCurrentTab('camera')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'camera'
                ? 'bg-[#8F3E22] text-white shadow-sm'
                : 'text-[#8F3E22] bg-[#FAF0EB] hover:bg-[#F5E2DA]'
            }`}
            title="Buka Kamera Disposable"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="font-semibold">Kamera</span>
          </button>

          {/* Live Display */}
          <button
            onClick={() => setCurrentTab('display')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'display'
                ? 'bg-[#1D2128] text-white shadow-sm'
                : 'text-[#485361] hover:bg-[#EAEFF5]'
            }`}
            title="Layar Proyektor Live Venue"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Layar Proyektor</span>
            <span className="md:hidden">Layar</span>
          </button>

          {/* Host Admin */}
          <button
            onClick={() => setCurrentTab('admin')}
            className={`p-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              currentTab === 'admin'
                ? 'bg-[#E3D6C5] text-[#24211E]'
                : 'text-[#615241] hover:bg-[#F0E8DC]'
            }`}
            title="Pengaturan Penyelenggara"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
};
