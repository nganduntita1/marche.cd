export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  is_verified: boolean;
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
