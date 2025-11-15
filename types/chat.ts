export type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    images: string[];
    price: number;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  };
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};
