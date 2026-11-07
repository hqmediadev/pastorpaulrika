export interface Tribute {
  id: string;
  type: 'video' | 'text' | 'both';
  authorName: string;
  authorLocation: string; // e.g. "Lagos, Nigeria", "London, UK"
  relationship: string;   // e.g. "Spiritual Son", "Church Member", "Revival Follower", "Evangelist"
  message: string;
  videoUrl?: string;
  cloudinaryPublicId?: string;
  cloudinaryPhotoPublicId?: string;
  videoBlobKey?: string;  // key in IndexedDB for offline / local video blobs
  videoDuration?: string;
  photoUrl?: string;      // author photo or memory with Pastor Paul Rika
  createdAt: string;
  likes: number;
  amens: number;
  isFeatured?: boolean;
  isApproved: boolean;
  storageProvider?: 'cloudinary' | 'vps' | 'local';
}

export interface CarouselPhoto {
  id: string;
  url: string;
  title: string;
  caption: string;
  category: 'Ministry' | 'Crusade' | 'Revival' | 'Portrait' | 'Celebration';
}

export interface StorageConfig {
  activeProvider: 'cloudinary' | 'vps' | 'local';
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  cloudinaryFolder: string;
  vpsEndpoint: string;
  vpsAuthToken?: string;
}

export interface BirthdayStats {
  yearsOfHoliness: number;
  nationsImpacted: number;
  soulsWonCount: string;
  totalAmensSent: number;
}
