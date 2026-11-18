import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Menangkap error runtime agar aplikasi tidak berubah menjadi layar putih.
 * Pengguna tetap bisa memuat ulang atau mereset data lokal yang rusak.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Kesalahan tidak diketahui',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('CandidCam crashed:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('candidsnap_'))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // localStorage tidak tersedia — abaikan
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#F5EAD8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DFD3] shadow-sm p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF0EB] text-[#8F3E22] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#24211E]">Terjadi kesalahan tampilan</h1>
          <p className="text-sm text-[#7C6C58]">
            Halaman gagal dimuat karena data lokal tidak valid. Muat ulang halaman, atau reset data demo jika masalah berlanjut.
          </p>
          <p className="text-[11px] text-[#A69581] break-words">{this.state.errorMessage}</p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24211E] hover:bg-[#3D3732] text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Muat Ulang
            </button>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF0EB] hover:bg-[#F5E2DA] border border-[#F2D7CC] text-[#8F3E22] text-xs font-semibold cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Data Demo
            </button>
          </div>
        </div>
      </div>
    );
  }
}
