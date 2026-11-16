import type { CandidEvent, CandidPhoto, GuestSession } from '../types';
import QRCode from 'qrcode';
import JSZip from 'jszip';

const STORAGE_KEY_EVENTS = 'candidsnap_events';
const STORAGE_KEY_PHOTOS = 'candidsnap_photos';
const STORAGE_KEY_GUEST_PREFIX = 'candidsnap_guest_';

// Initial realistic seed event
export const DEFAULT_EVENT: CandidEvent = {
  id: '01a0bbd0-8124-701f-9aa2-e7d3eca1df95',
  title: 'The Wedding of',
  hosts: 'Dimas & Devi',
  date: '28 November 2026',
  venue: 'Plataran Hutan Kota, Senayan, Jakarta',
  description: 'Abadikan tawa, haru, dan setiap momen spontan kita malam ini. Semua foto langsung tayang di layar proyektor!',
  hashtag: '#DimasDeviStory',
  maxPhotosPerGuest: 10,
  allowGalleryUpload: true,
  defaultFrameStyle: 'polaroid',
  frameCaption: 'Dimas & Devi • 28.11.2026',
  coverImage: '/dimas_devi.jpg',
};

// Seed gallery photos with high-quality candid celebration pictures
export const INITIAL_PHOTOS: CandidPhoto[] = [
  {
    id: 'p-1',
    eventId: DEFAULT_EVENT.id,
    guestName: 'Bima & Tania',
    photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    caption: 'Happy wedding Sarah & Dimas! Dansa pertama kalian romantis banget 🥺✨',
    filter: 'kodak90s',
    frameStyle: 'polaroid',
    likes: 24,
    likedByMe: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'p-2',
    eventId: DEFAULT_EVENT.id,
    guestName: 'Geng Meja 4',
    photoUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    caption: 'Cheers to the newly weds! Makanan dessert-nya juara!',
    filter: 'golden_hour',
    frameStyle: 'film35mm',
    likes: 19,
    likedByMe: true,
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
  {
    id: 'p-3',
    eventId: DEFAULT_EVENT.id,
    guestName: 'Jessica Anastasia',
    photoUrl: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    caption: 'Sarah cantik banget ya ampun dress-nya beneran timeless!',
    filter: 'fuji_clean',
    frameStyle: 'editorial',
    likes: 31,
    likedByMe: false,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'p-4',
    eventId: DEFAULT_EVENT.id,
    guestName: 'Reza Pratama',
    photoUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    caption: 'Dimas waktu lempar bunga tegang tapi seru pol haha!',
    filter: 'vintage_warm',
    frameStyle: 'polaroid',
    likes: 15,
    likedByMe: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'p-5',
    eventId: DEFAULT_EVENT.id,
    guestName: 'Uncle Hendra & Auntie',
    photoUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    caption: 'Semoga langgeng hingga kakek nenek dan dilimpahi kebahagiaan.',
    filter: 'bw_noir',
    frameStyle: 'gold_luxury',
    likes: 27,
    likedByMe: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

// Load Events
export function getStoredEvents(): CandidEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify([DEFAULT_EVENT]));
      return [DEFAULT_EVENT];
    }
    const events: CandidEvent[] = JSON.parse(raw);
    if (!events.find((e) => e.id === DEFAULT_EVENT.id)) {
      events.unshift(DEFAULT_EVENT);
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    }
    return events;
  } catch (err) {
    console.error('Failed to get events from storage', err);
    return [DEFAULT_EVENT];
  }
}

export function saveEvent(event: CandidEvent) {
  const events = getStoredEvents();
  const index = events.findIndex((e) => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.unshift(event);
  }
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  window.dispatchEvent(new Event('candidsnap_storage_updated'));
}

export function getEventById(id: string): CandidEvent | undefined {
  const events = getStoredEvents();
  return events.find((e) => e.id === id) || events[0];
}

// Load Photos
export function getStoredPhotos(eventId?: string): CandidPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHOTOS);
    let photos: CandidPhoto[] = [];
    if (!raw) {
      photos = INITIAL_PHOTOS;
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
    } else {
      photos = JSON.parse(raw);
    }
    if (eventId) {
      return photos.filter((p) => p.eventId === eventId);
    }
    return photos;
  } catch (err) {
    console.error('Failed to get photos', err);
    return INITIAL_PHOTOS;
  }
}

export function saveNewPhoto(photo: CandidPhoto) {
  const photos = getStoredPhotos();
  photos.unshift(photo);
  localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));

  // Trigger cross-component and multi-tab reactive update
  window.dispatchEvent(new CustomEvent('candidsnap_new_photo', { detail: photo }));
  window.dispatchEvent(new Event('candidsnap_storage_updated'));
}

export function togglePhotoLike(photoId: string): { likes: number; likedByMe: boolean } {
  const photos = getStoredPhotos();
  const photo = photos.find((p) => p.id === photoId);
  if (!photo) return { likes: 0, likedByMe: false };

  photo.likedByMe = !photo.likedByMe;
  photo.likes += photo.likedByMe ? 1 : -1;
  localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
  window.dispatchEvent(new Event('candidsnap_storage_updated'));

  return { likes: photo.likes, likedByMe: photo.likedByMe };
}

export function deletePhoto(photoId: string) {
  const photos = getStoredPhotos();
  const filtered = photos.filter((p) => p.id !== photoId);
  localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(filtered));
  window.dispatchEvent(new Event('candidsnap_storage_updated'));
}

// Guest Session (Quota & Name)
export function getGuestSession(eventId: string, defaultQuota = 10): GuestSession {
  const key = `${STORAGE_KEY_GUEST_PREFIX}${eventId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through
    }
  }
  const newSession: GuestSession = {
    guestName: '',
    photosRemaining: defaultQuota,
    takenPhotoIds: [],
  };
  localStorage.setItem(key, JSON.stringify(newSession));
  return newSession;
}

export function saveGuestSession(eventId: string, session: GuestSession) {
  const key = `${STORAGE_KEY_GUEST_PREFIX}${eventId}`;
  localStorage.setItem(key, JSON.stringify(session));
}

// QR Code Generator
export async function generateEventQRCode(eventId: string): Promise<string> {
  const url = `${window.location.origin}${window.location.pathname}?candidId=${eventId}`;
  try {
    return await QRCode.toDataURL(url, {
      width: 480,
      margin: 2,
      color: {
        dark: '#24211E',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

// Bulk ZIP Downloader for Host
export async function downloadAllPhotosAsZip(eventId: string, eventTitle: string) {
  const photos = getStoredPhotos(eventId);
  if (photos.length === 0) {
    alert('Belum ada foto yang diambil tamu untuk acara ini.');
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder(`candid-photos-${eventId.substring(0, 8)}`);

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    try {
      // If base64 data url
      if (p.photoUrl.startsWith('data:image')) {
        const base64Data = p.photoUrl.split(',')[1];
        const filename = `${i + 1}_${p.guestName.replace(/[^a-zA-Z0-9]/g, '_')}_${p.id}.jpg`;
        folder?.file(filename, base64Data, { base64: true });
      } else {
        // Fetch external image
        const resp = await fetch(p.photoUrl);
        const blob = await resp.blob();
        const filename = `${i + 1}_${p.guestName.replace(/[^a-zA-Z0-9]/g, '_')}_${p.id}.jpg`;
        folder?.file(filename, blob);
      }
    } catch (e) {
      console.warn('Skipped archiving photo', p.id, e);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `CandidSnap-${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
  a.click();
}
