export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  is_verified: boolean;
  credits: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  created_at: string;
}

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'pending' | 'active' | 'sold' | 'removed';
export type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

export interface CreditPurchase {
  id: string;
  user_id: string;
  amount: number;
  credits: number;
  status: PurchaseStatus;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category_id: string;
  price: number;
  images: string[];
  seller_id: string;
  location: string;
  condition: ListingCondition;
  is_featured: boolean;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface ListingWithDetails extends Listing {
  seller: User;
  category: Category;
}
