import React, { useState } from 'react';
import {
  Save,
  Download,
  Printer,
  Plus,
  Check,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import type { CandidEvent, CandidPhoto, FrameStyle } from '../types';
import { saveEvent, downloadAllPhotosAsZip } from '../utils/storage';

interface HostDashboardProps {
  currentEvent: CandidEvent;
  events?: CandidEvent[];
  onSelectEvent?: (event: CandidEvent) => void;
  onUpdateEvent: (updated: CandidEvent) => void;
  onCreateNewEvent: (newEvent: CandidEvent) => void;
  photos: CandidPhoto[];
  onOpenPrintCard: () => void;
  onViewPhoto: (photo: CandidPhoto) => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  currentEvent,
  events = [],
  onSelectEvent,
  onUpdateEvent,
  onCreateNewEvent,
  photos,
  onOpenPrintCard,
  onViewPhoto,
}) => {
  const [formData, setFormData] = useState<CandidEvent>({ ...currentEvent });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // New Event Modal State
  const [showNewEventModal, setShowNewEventModal] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventHosts, setNewEventHosts] = useState<string>('');
  const [newEventDate, setNewEventDate] = useState<string>('');
  const [newEventVenue, setNewEventVenue] = useState<string>('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveEvent(formData);
    onUpdateEvent(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await downloadAllPhotosAsZip(currentEvent.id, currentEvent.hosts || currentEvent.title);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventHosts.trim()) return;

    const newEv: CandidEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: newEventTitle.trim() || 'The Wedding Celebration',
      hosts: newEventHosts.trim(),
      date: newEventDate.trim() || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      venue: newEventVenue.trim() || 'Grand Ballroom, Jakarta',
      description: 'Abadikan momen tak terlupakan bersama kami!',
      hashtag: `#${newEventHosts.replace(/[^a-zA-Z0-9]/g, '')}`,
      maxPhotosPerGuest: 10,
      allowGalleryUpload: true,
      defaultFrameStyle: 'polaroid',
      frameCaption: `${newEventHosts} • ${newEventDate}`,
    };

    onCreateNewEvent(newEv);
    setShowNewEventModal(false);
    setFormData(newEv);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD3]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8F3E22]">Studio Penyelenggara</span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#24211E] mt-1">
            Kelola Acara & Foto Tamu
          </h1>
          <p className="text-sm text-[#7C6C58]">
            Atur kuota kamera tamu, bingkai foto polaroid, cetak kartu meja tamu, dan unduh seluruh galeri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {events.length > 1 && onSelectEvent && (
            <select
              value={currentEvent.id}
              onChange={(e) => {
                const found = events.find((ev) => ev.id === e.target.value);
                if (found) {
                  onSelectEvent(found);
                  setFormData(found);
                }
              }}
              className="bg-white border border-[#DCD1C2] text-xs font-semibold px-3 py-2 rounded-xl text-[#24211E] outline-none cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.hosts}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowNewEventModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#24211E] hover:bg-[#3D3732] text-white text-xs font-semibold shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Acara Baru
          </button>

          <button
            onClick={onOpenPrintCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8F3E22] hover:bg-[#78341C] text-white text-xs font-semibold shadow-sm cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak Kartu Meja QR
          </button>
        </div>
      </div>

      {/* Grid: Settings Form & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Form (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8DFD3]">
          <h3 className="font-serif text-lg font-bold text-[#24211E] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Pengaturan Acara & Bingkai Tamu
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Nama Pasangan / Penyelenggara:
                </label>
                <input
                  type="text"
                  value={formData.hosts}
                  onChange={(e) => setFormData({ ...formData, hosts: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DCD1C2] focus:ring-2 focus:ring-[#8F3E22] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Tanggal Acara:
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DCD1C2] focus:ring-2 focus:ring-[#8F3E22] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Lokasi / Venue:
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DCD1C2] focus:ring-2 focus:ring-[#8F3E22] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Hashtag Acara:
                </label>
                <input
                  type="text"
                  value={formData.hashtag}
                  onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DCD1C2] focus:ring-2 focus:ring-[#8F3E22] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Kuota Foto Per Tamu:
                </label>
                <select
                  value={formData.maxPhotosPerGuest}
                  onChange={(e) => setFormData({ ...formData, maxPhotosPerGuest: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DCD1C2] bg-white focus:ring-2 focus:ring-[#8F3E22] outline-none"
                >
                  <option value={5}>5 Foto per tamu</option>
                  <option value={10}>10 Foto per tamu (Rekomendasi)</option>
                  <option value={15}>15 Foto per tamu</option>
                  <option value={25}>25 Foto per tamu</option>
                  <option value={0}>Unlimited (Tanpa Batas)</option>
                </select>
                <p className="text-[11px] text-[#8C7D6B] mt-1">
                  Membatasi jepretan layaknya roll film disposable jadul.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Default Gaya Bingkai Foto:
                </label>
                <select
                  value={formData.defaultFrameStyle}
                  onChange={(e) => setFormData({ ...formData, defaultFrameStyle: e.target.value as FrameStyle })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DCD1C2] bg-white focus:ring-2 focus:ring-[#8F3E22] outline-none"
                >
                  <option value="polaroid">Classic Polaroid</option>
                  <option value="film35mm">35mm Film Strip</option>
                  <option value="gold_luxury">Gold Foil Luxury</option>
                  <option value="editorial">Minimalist Editorial</option>
                  <option value="kraft">Vintage Kraft Card</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowGalleryUpload}
                  onChange={(e) => setFormData({ ...formData, allowGalleryUpload: e.target.checked })}
                  className="w-4 h-4 text-[#8F3E22] rounded focus:ring-[#8F3E22]"
                />
                <span className="text-xs font-medium text-[#24211E]">
                  Izinkan tamu mengunggah foto dari galeri HP (jika kamera tidak aktif)
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Pengaturan berhasil disimpan!
                </span>
              ) : (
                <div />
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8F3E22] hover:bg-[#78341C] text-white text-xs sm:text-sm font-semibold shadow-md cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* Quick Stats & Export Side Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DFD3] space-y-4">
            <h4 className="font-serif font-bold text-base text-[#24211E]">Statistik Galeri</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
                <div className="text-2xl font-bold font-serif text-[#24211E]">{photos.length}</div>
                <div className="text-[11px] text-[#7C6C58]">Foto Terkumpul</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3]">
                <div className="text-2xl font-bold font-serif text-rose-600">
                  {photos.reduce((acc, p) => acc + p.likes, 0)}
                </div>
                <div className="text-[11px] text-[#7C6C58]">Total Suka</div>
              </div>
            </div>

            <button
              onClick={handleExportZip}
              disabled={isExporting || photos.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-[#24211E] hover:bg-[#3D3732] text-white text-xs font-semibold shadow flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Mengompres ZIP...' : 'Unduh Semua Foto (ZIP)'}
            </button>
            <p className="text-[11px] text-center text-[#8C7D6B]">
              Unduh arsip lengkap kenangan pesta beresolusi tinggi dalam 1 file ZIP.
            </p>
          </div>

          <div className="bg-[#FAF0EB] rounded-3xl p-6 border border-[#F2D7CC] space-y-3">
            <div className="flex items-center gap-2 text-[#8F3E22]">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-serif font-bold text-sm">Privasi & Keamanan</span>
            </div>
            <p className="text-xs text-[#7A402D] leading-relaxed">
              Semua foto tersimpan aman di sistem acara. Sebagai penyelenggara, kamu memiliki hak penuh untuk
              menghapus foto yang tidak pantas kapan saja.
            </p>
          </div>
        </div>
      </div>

      {/* Photo Moderation Gallery */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E8DFD3]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8DFD3]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#24211E]">Moderasi Foto Tamu</h3>
            <p className="text-xs text-[#8C7D6B]">Klik foto untuk melihat resolusi penuh atau menghapus foto yang tidak pantas.</p>
          </div>
          <span className="text-xs font-bold text-[#6B5E4F]">{photos.length} Foto</span>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-[#8C7D6B] text-sm">
            Belum ada foto yang masuk dari tamu.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group relative rounded-xl overflow-hidden bg-black/5 aspect-[4/5] border border-black/5 cursor-pointer"
                onClick={() => onViewPhoto(p)}
              >
                <img src={p.photoUrl} alt="Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                  <div className="text-[11px] font-semibold truncate">{p.guestName}</div>
                  <div className="text-[9px] text-white/70">{p.likes} suka</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8DFD3]">
            <h3 className="font-serif text-xl font-bold text-[#24211E] mb-2">Buat Acara Baru</h3>
            <p className="text-xs text-[#7C6C58] mb-4">
              Buat ruang digital disposable camera untuk pernikahan atau selebrasimu berikutnya.
            </p>

            <form onSubmit={handleCreateEventSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Judul Acara:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: The Wedding Celebration"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD1C2] bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Nama Pasangan / Tokoh Acara:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Maya & Roy"
                  value={newEventHosts}
                  onChange={(e) => setNewEventHosts(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD1C2] bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Tanggal Acara:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 12 Desember 2026"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD1C2] bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B5E4F] uppercase tracking-wide mb-1">
                  Lokasi Venue:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: The Dharmawangsa, Jakarta"
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCD1C2] bg-white outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-black/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8F3E22] hover:bg-[#78341C] text-white text-xs font-semibold shadow"
                >
                  Buat Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
