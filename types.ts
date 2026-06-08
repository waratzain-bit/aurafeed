export interface Post {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  categoryColor: string; // Tailwind class, e.g., "emerald", "sky", "violet", "pink", "amber"
  imageUrl: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  author: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  avatarColor: string;
}

export interface SheetsConfig {
  webAppUrl: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

