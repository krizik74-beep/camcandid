export type FrameStyle = 'polaroid' | 'film35mm' | 'editorial' | 'gold_luxury' | 'kraft';

export type PhotoFilter = 'normal' | 'kodak90s' | 'fuji_clean' | 'bw_noir' | 'golden_hour' | 'vintage_warm';

export interface CandidPhoto {
  id: string;
  eventId: string;
  guestName: string;
  photoUrl: string; // Base64 or URL
  caption?: string;
  filter: PhotoFilter;
  frameStyle: FrameStyle;
  likes: number;
  likedByMe?: boolean;
  createdAt: string; // ISO string
}

export interface CandidEvent {
  id: string;
  title: string;
  hosts: string; // e.g. "Sarah & Dimas"
  date: string; // e.g. "2026-11-28"
  venue: string; // e.g. "The Glasshouse Ballroom, Jakarta"
  description: string;
  hashtag: string;
  maxPhotosPerGuest: number; // e.g. 10 or 0 for unlimited
  allowGalleryUpload: boolean;
  defaultFrameStyle: FrameStyle;
  frameCaption: string; // e.g. "Sarah & Dimas • 28.11.2026"
  passcode?: string;
  coverImage?: string;
}

export interface GuestSession {
  guestName: string;
  photosRemaining: number;
  takenPhotoIds: string[];
}
