# 📸 CandidSnap — Live Event Disposable Camera & Guest Gallery

**CandidSnap** adalah aplikasi web kamera disposable digital (*digital disposable camera*) dan galeri *live* untuk acara pernikahan, ulang tahun, dan selebrasi lainnya, yang terinspirasi dari fitur Candid Cam pada Invistory dengan berbagai modifikasi dan peningkatan eksklusif.

---

## ✨ Fitur & Modifikasi Utama (Differentiation)

Dibandingkan dengan versi asli, projek ini mengusung modifikasi desain dan fitur:

1. **Retro Tactile Disposable Camera Experience**:
   - Tampilan kamera analog disposable bergaya retro modern dengan *viewfinder lens ring*, indikator *exposure counter* mekanik, dan tombol rana (*shutter button*) timbul.
   - **Synthesizer Suara Kamera Asli (Web Audio API)**: Suara *shutter click*, motor penggulung *film roll winding*, desisan pengisian kapasitor *flash*, dan denting sukses saat foto berhasil dicetak tanpa memerlukan file audio eksternal.
   - **Efek Kilat Layar (Visual Flash Burst)**: Layar berkedip terang sesaat saat mengambil gambar dalam mode flash.
   - **Pilihan 6 Filter Warna Analog Otomatis**: *Kodak '90s*, *Fuji Clean*, *Ilford B&W*, *Golden Hour Sunset*, *Warm '70s*, dan *Natural*.

2. **5 Gaya Bingkai Foto Fisik (Physical Print Frames)**:
   - **Classic Polaroid**: Bingkai putih vintage dengan teks tulisan tangan nama tamu dan ucapan.
   - **35mm Film Strip**: Potongan roll film 35mm lengkap dengan lubang gerigi (*sprockets*) dan kode film Kodak.
   - **Gold Foil Luxury**: Aksen garis emas mewah dan sudut ornamen cocok untuk *royal wedding* / gala.
   - **Minimalist Editorial**: Tata letak tipografi serif modern elegan.
   - **Vintage Kraft Card**: Bingkai kertas karton cokelat daur ulang bernuansa hangat.

3. **Layar Proyektor Live Venue (Live Projector Display)**:
   - Tampilan *full-screen* dinamis untuk diproyeksikan ke layar proyektor / videowall panggung pesta.
   - 2 Mode Tampilan: **Slideshow Ken Burns** dengan transisi lembut dan **Dynamic Polaroid Wall**.
   - **Notifikasi Live Toast**: Banner animasi muncul otomatis saat ada tamu yang baru saja menjepret foto.
   - QR Code interaktif di sudut layar agar tamu pesta bisa langsung scan kapan pun.

4. **Kartu Meja Tamu Siap Cetak (Printable Table Tent Card)**:
   - Studio generator kartu meja lipat (*table tent card*) dengan nomor meja yang dapat diubah dan tombol cetak (`window.print()`).

5. **Panel Penyelenggara & Ekspor Arsip (Host Studio)**:
   - Pengaturan kuota foto per tamu (5, 10, 15, atau Unlimited).
   - Pengaturan hashtag, nama pasangan, tanggal, dan lokasi.
   - Moderasi foto (hapus foto tak pantas).
   - **Unduh Semua Foto (ZIP)**: Mengompres seluruh galeri tamu beresolusi tinggi ke dalam 1 file zip.

---

## 🚀 Cara Menjalankan Projek

Pastikan [Node.js](https://nodejs.org/) sudah terinstal di komputer.

```bash
# Jalankan mode pengembangan
npm run dev

# Atau jika di Windows PowerShell yang membatasi script:
cmd /c npm run dev
```

Buka URL lokal yang muncul (default: `http://localhost:5173/`).

### Untuk Build Produksi:
```bash
cmd /c npm run build
cmd /c npm run preview
```

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans + Playfair Display + Caveat (Google Fonts)
- **Icons**: Lucide React
- **Audio Engine**: Native Web Audio API (tanpa aset eksternal)
- **Canvas Rendering**: HTML5 2D Canvas Engine untuk *baking* filter warna, efek noise kertas, dan bingkai foto
- **Utils**: `qrcode` (generator QR), `jszip` (bulk zip export), `canvas-confetti` (efek selebrasi)
