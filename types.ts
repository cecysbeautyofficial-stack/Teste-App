export interface Author {
  id: string;
  name: string;
  photoUrl: string;
  bio: string;
  website?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
  }
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: Author;
  coverUrl: string;
  price: number;
  currency: 'MZN';
  rating: number;
  category: string;
  description: string;
  status?: 'Published' | 'Draft' | 'Pending Approval';
  sales?: number;
  readers?: number;
  publishDate?: string;
  pages?: number;
  language?: string;
  isbn?: string;
  // New fields
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isFeatured?: boolean;
  reviews?: Review[];
  pdfUrl?: string;
  audioUrl?: string; // For Audiobooks
  duration?: string; // e.g., "12h 30m"
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  date: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  hashtags: string[];
  date: string;
  authorId: string; // Admin ID
  comments?: Comment[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: 'phone' | 'card' | 'generic';
  enabled: boolean;
}

export interface AuthorOnboardingData {
  experienceLevel: string;
  primaryGenre: string;
  writingGoal: string;
  publishingStatus: string;
}

export interface User {
  id:string;
  name: string;
  email: string;
  password?: string;
  role: 'reader' | 'author' | 'admin';
  status: 'active' | 'pending' | 'blocked'; // New status field
  country?: string; // New country field
  avatarUrl?: string;
  whatsapp?: string;
  preferredPaymentMethod?: string;
  notificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean; // New email notification setting
  following?: string[]; // Array of Author IDs
  authorOnboardingData?: AuthorOnboardingData; // Store survey results
  joinedDate?: string;
}

export interface Notification {
  id: string;
  userId: string; // The recipient
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  date: string;
  read: boolean;
  linkTo?: View; // Optional navigation link
  relatedId?: string; // ID of book/author to select upon navigation
  emailHtml?: string; // Optional HTML content of the email sent
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  participants: string[]; // Array of user IDs
  messages: Message[];
  lastUpdated: string;
}

export type View = 'home' | 'library' | 'book_store' | 'search' | 'detail' | 'reader' | 'preview' | 'author_profile' | 'dashboard' | 'collection' | 'blog' | 'news_detail' | 'authors' | 'audiobooks';

export interface Purchase {
  userId: string;
  bookId: string;
  purchaseDate: string;
  paymentMethod: string;
  amount: number;
}

export type SortOrder = 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'publicationDate_asc' | 'publicationDate_desc';