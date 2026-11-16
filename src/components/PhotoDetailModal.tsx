import React from 'react';
import { X, Heart, Download, User, Calendar, Trash2 } from 'lucide-react';
import type { CandidPhoto } from '../types';

interface PhotoDetailModalProps {
  photo: CandidPhoto;
  onClose: () => void;
  onToggleLike: (photoId: string) => void;
  onDelete?: (photoId: string) => void;
  isAdmin?: boolean;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  onClose,
  onToggleLike,
  onDelete,
  isAdmin = false,
}) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photo.photoUrl;
    a.download = `candid-${photo.guestName.replace(/[^a-zA-Z0-9]/g, '_')}-${photo.id}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full max-h-[92svh] flex flex-col overflow-hidden shadow-2xl border border-[#E8DFD3] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EAE2D5] flex items-center justify-center text-[#5C4F3E]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#24211E]">{photo.guestName}</h4>
              <p className="text-[11px] text-[#8C7D6B] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(photo.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} •{' '}
                {new Date(photo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Hapus foto ini dari galeri acara?')) {
                    onDelete(photo.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Hapus Foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-[#5C4F3E] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Photo View */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-black/5">
          <img
            src={photo.photoUrl}
            alt={photo.caption || 'Candid snap'}
            className="max-h-[58svh] w-auto object-contain rounded-xl shadow-polaroid"
          />
        </div>

        {/* Bottom Details & Actions */}
        <div className="p-5 border-t border-[#E8DFD3] bg-white">
          {photo.caption && (
            <p className="text-sm font-handwriting text-lg text-[#24211E] mb-3 leading-snug">
              "{photo.caption}"
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onToggleLike(photo.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all cursor-pointer ${
                photo.likedByMe
                  ? 'bg-rose-50 border-rose-200 text-rose-600 font-semibold'
                  : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#5C4F3E] hover:bg-[#F3ECE1]'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${photo.likedByMe ? 'fill-rose-500 text-rose-500 scale-110' : ''}`}
              />
              <span className="text-xs">{photo.likes} Suka</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#24211E] hover:bg-[#3D3732] text-[#F5EFE6] text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Simpan Foto High-Res
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
