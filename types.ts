export interface MenuItem {
  name: string;
  price: number | string; // Some prices are ranges or text like "洽櫃台"
  tags?: string[];
  description?: string;
  soldOut?: boolean;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface SalesData {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'Normal' | 'Warning' | 'Critical';
  lastUpdated: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  timestamp: Date;
  status: 'Pending' | 'Paid' | 'Completed';
}

// New Types for Manager Modules
export interface SocialPost {
  id: string;
  content: string;
  date: string;
  likes: number;
  shares: number;
  platform: 'FB' | 'IG';
}

export interface ProductIdea {
  id: string;
  name: string;
  stage: 'Idea' | 'Testing' | 'Launch';
  notes: string;
  recipe?: string; // AI generated recipe
  imageUrl?: string; // AI generated image base64
}

export interface FeedbackItem {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  date: string;
  positivePoints?: string[]; // AI extracted pros
  negativePoints?: string[]; // AI extracted cons
  advice?: string; // AI analyzed advice for the owner
}

export interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
}

export interface ESGItem {
    id: string;
    name: string;
    score: number; // 0-100
    fullMark: number;
}