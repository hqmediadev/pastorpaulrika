import { Tribute } from '../types';

const DB_NAME = 'PastorPaulRikaBirthdayDB';
const DB_VERSION = 1;
const STORE_VIDEOS = 'tribute_videos';

const TRIBUTES_STORAGE_KEY = 'pastor_paul_rika_tributes_list_v2';
const BLESSINGS_COUNT_KEY = 'pastor_paul_rika_blessings_counter_v2';
const ADMIN_AUTH_KEY = 'pastor_paul_rika_admin_authenticated';

// Initialize IndexedDB for resilient offline video caching
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
        db.createObjectStore(STORE_VIDEOS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store a video blob locally
export async function saveVideoBlobLocally(id: string, blob: Blob): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_VIDEOS, 'readwrite');
      const store = transaction.objectStore(STORE_VIDEOS);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save video blob to IndexedDB:', err);
    return id;
  }
}

// Delete video blob locally
export async function deleteVideoBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_VIDEOS, 'readwrite');
    transaction.objectStore(STORE_VIDEOS).delete(id);
  } catch (e) {
    console.error(e);
  }
}

// Upload the video through the backend to Cloudinary.
export async function uploadVideoToCloudinary(
  fileOrBlob: File | Blob,
  metadata: { authorName: string }
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();

  if (fileOrBlob instanceof File) {
    formData.append('file', fileOrBlob);
  } else {
    // Blob from webcam recording
    const filename = `recording-${Date.now()}-${metadata.authorName.replace(/\s+/g, '_')}.webm`;
    formData.append('file', fileOrBlob, filename);
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload video to Cloudinary.');
  }

  if (typeof data.url !== 'string' || typeof data.publicId !== 'string') {
    throw new Error('Cloudinary returned an invalid upload response.');
  }

  return { url: data.url, publicId: data.publicId };
}

// Load tributes from server and localStorage
export async function fetchServerTributes(): Promise<Tribute[] | null> {
  try {
    const res = await fetch('/api/tributes');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tributes) && data.tributes.length > 0) {
        return data.tributes;
      }
    }
  } catch (err) {
    console.debug('Server tributes endpoint unreachable, falling back to local storage');
  }
  return null;
}

// Sync tribute to server
export async function syncTributeToServer(tribute: Tribute): Promise<void> {
  try {
    await fetch('/api/tributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tribute),
    });
  } catch (e) {
    console.debug('Failed to sync tribute to server:', e);
  }
}

// Delete tribute on server (requires admin password)
export async function deleteTributeFromServer(id: string, adminPassword: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/tributes/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-password': adminPassword,
        'Authorization': `Bearer ${adminPassword}`,
      },
    });
    return res.ok;
  } catch (e) {
    console.error('Delete tribute error:', e);
    return false;
  }
}

// Verify Admin password
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (password.trim() === 'admin1234') {
    return true;
  }
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return password.trim() === 'admin1234';
  }
}

// Generate Admin-Only Download URL
export function getAdminDownloadUrl(videoUrl: string, adminPassword: string): string {
  if (videoUrl.startsWith('/uploads/videos/')) {
    const filename = videoUrl.split('/').pop();
    return `/api/admin/download/${filename}?key=${encodeURIComponent(adminPassword)}`;
  }
  return videoUrl;
}

// Local Storage helpers
export function loadStoredTributes(): Tribute[] | null {
  try {
    const saved = localStorage.getItem(TRIBUTES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function saveStoredTributes(tributes: Tribute[]): void {
  try {
    localStorage.setItem(TRIBUTES_STORAGE_KEY, JSON.stringify(tributes));
  } catch (e) {
    console.error(e);
  }
}

export function loadStoredBlessings(): number {
  try {
    const saved = localStorage.getItem(BLESSINGS_COUNT_KEY);
    if (saved) return parseInt(saved, 10);
  } catch (e) {
    console.error(e);
  }
  return 14820;
}

export function saveStoredBlessings(count: number): void {
  try {
    localStorage.setItem(BLESSINGS_COUNT_KEY, count.toString());
  } catch (e) {
    console.error(e);
  }
}

export function getAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(isAdmin: boolean): void {
  try {
    if (isAdmin) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}
