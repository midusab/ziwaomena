export interface Fisherman {
  id: string;
  name: string;
  village: string;
  experience: string;
  story: string;
  image: string;
  impactScore: number;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  category: string;
}

export interface OmenaItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: OmenaCategory;
  image: string;
  tags: string[];
}

export type OmenaCategory = 'All' | 'Deep Fried' | 'Wet Fry' | 'Masala' | 'Traditional' | 'Specialty' | 'Breakfast' | 'Fusion';

export interface CartItem extends OmenaItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'out-for-delivery' | 'delivered';
  paymentMethod: 'mpesa' | 'stripe';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  uid: string;
  createdAt: any; // Firestore Timestamp
  riderLocation?: {
    lat: number;
    lng: number;
  };
}
