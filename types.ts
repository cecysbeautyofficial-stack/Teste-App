
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
  // New fields
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isFeatured?: boolean;
  reviews?: Review[];
  pdfUrl?: string;
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
  avatarUrl?: string;
  whatsapp?: string;
  preferredPaymentMethod?: string;
  notificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean; // New email notification setting
  following?: string[]; // Array of Author IDs
  authorOnboardingData?: AuthorOnboardingData; // Store survey results
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

export type View = 'home' | 'library' | 'book_store' | 'search' | 'detail' | 'reader' | 'preview' | 'author_profile' | 'dashboard' | 'collection';

export interface Purchase {
  userId: string;
  bookId: string;
  purchaseDate: string;
  paymentMethod: string;
  amount: number;
}

export type SortOrder = 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'publicationDate_asc' | 'publicationDate_desc';
