import React, { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import type { CandidEvent } from '../types';
import { generateEventQRCode } from '../utils/storage';

interface PrintableTentCardProps {
  currentEvent: CandidEvent;
  onClose: () => void;
}

export const PrintableTentCard: React.FC<PrintableTentCardProps> = ({ currentEvent, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('01');

  useEffect(() => {
    generateEventQRCode(currentEvent.id).then((url) => setQrDataUrl(url));
  }, [currentEvent.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E8DFD3] flex flex-col items-center">
        {/* Controls bar (hidden during print) */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-[#E8DFD3] print:hidden">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#24211E]">Kartu Meja Tamu (Table Tent Card)</h3>
            <p className="text-xs text-[#8C7D6B]">Siap cetak untuk ditaruh di atas meja tamu resepsi</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8F3E22] hover:bg-[#78341C] text-white text-xs font-semibold shadow cursor-pointer transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-gray-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customizable Table Number (hidden in print) */}
        <div className="w-full flex items-center justify-between py-3 print:hidden">
          <label className="text-xs font-medium text-[#615241]">Nomor Meja:</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-20 px-2 py-1 text-xs text-center border border-[#DCD1C2] rounded-lg bg-white"
          />
        </div>

        {/* The Printable Card Body (styled for print & screen) */}
        <div className="w-full max-w-md bg-white border-2 border-[#D8C7B2] rounded-2xl p-8 my-2 shadow-sm text-center text-[#24211E] relative overflow-hidden print:m-0 print:border-none print:shadow-none">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#CBB89F]" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#CBB89F]" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#CBB89F]" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#CBB89F]" />

          {/* Table Badge */}
          {tableNumber && (
            <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] text-[11px] font-bold uppercase tracking-widest text-[#7C6C58]">
              MEJA {tableNumber}
            </div>
          )}

          {/* Couple / Event Header */}
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#24211E]">
            {currentEvent.hosts}
          </h2>
          <p className="text-xs font-serif italic text-[#8C7D6B] mt-1">{currentEvent.date}</p>

          <div className="w-16 h-[1px] bg-[#CBB89F] mx-auto my-4" />

          {/* QR Code Container */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE2D5] inline-block shadow-inner my-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 object-contain mx-auto" />
            ) : (
              <div className="w-44 h-44 bg-gray-100 flex items-center justify-center">Memuat QR...</div>
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[#8F3E22] mt-2">
            SCAN UNTUK BUKA CANDID CAM
          </p>
          <p className="text-[11px] text-[#7C6C58] mt-0.5">Tanpa unduh aplikasi • Langsung dari browser HP</p>

          {/* Simple Steps */}
          <div className="mt-5 pt-4 border-t border-[#F0E8DC] text-left text-xs text-[#524536] space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#EAE2D5] text-[#24211E] font-bold text-[10px] flex items-center justify-center">
                1
              </span>
              <span>Buka kamera HP & scan QR code di atas</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#EAE2D5] text-[#24211E] font-bold text-[10px] flex items-center justify-center">
                2
              </span>
              <span>Jepret momen seru & candid bersama teman mejamu</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#EAE2D5] text-[#24211E] font-bold text-[10px] flex items-center justify-center">
                3
              </span>
              <span>Foto langsung tayang live di layar panggung utama! 📸</span>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-[#A69581] font-mono-retro">
            {currentEvent.hashtag}
          </div>
        </div>
      </div>
    </div>
  );
};
