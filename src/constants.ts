import { OmenaItem, Vendor, Fisherman } from './types';

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Ziwa Omena House',
    description: 'The authentic taste of Lake Victoria. Specializing in traditional recipes.',
    image: 'https://picsum.photos/seed/vendor1/600/400',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 150,
    category: 'Traditional'
  },
  {
    id: 'v2',
    name: 'Pishori & Omena Junction',
    description: 'Modern fusion kitchen blending coastal rice with lakeside delicacy.',
    image: 'https://picsum.photos/seed/vendor2/600/400',
    rating: 4.5,
    deliveryTime: '30-45 min',
    deliveryFee: 120,
    category: 'Fusion'
  },
  {
    id: 'v3',
    name: 'Dala Delicacies',
    description: 'Premium quality sun-dried and smoked Omena sourced directly from Winam Gulf.',
    image: 'https://picsum.photos/seed/vendor3/600/400',
    rating: 4.9,
    deliveryTime: '20-30 min',
    deliveryFee: 180,
    category: 'Premium'
  }
];

export const OMENA_ITEMS: OmenaItem[] = [
  {
    id: '1',
    vendorId: 'v1',
    name: 'Classic Deep Fried (Kavu)',
    description: 'Perfectly crunchy deep-fried Omena, seasoned with Kenyan salt and a hint of lemon. Best served with ugali.',
    price: 350,
    category: 'Deep Fried',
    image: 'https://picsum.photos/seed/omina1/600/400',
    tags: ['Crunchy', 'Traditional']
  },
  {
    id: '2',
    vendorId: 'v1',
    name: 'Rich Tomato Wet Fry',
    description: 'Tender Omena simmered in a rich tomato, onion, and fresh coriander gravy. The ultimate kenyian comfort food.',
    price: 450,
    category: 'Wet Fry',
    image: 'https://picsum.photos/seed/omina2/600/400',
    tags: ['Hearty', 'Spicy']
  },
  {
    id: '3',
    vendorId: 'v2',
    name: 'Ziwa Masala Omena',
    description: 'A fusion twist! Omena tossed in aromatic masala spices, ginger, and garlic. A bold flavor experience.',
    price: 500,
    category: 'Masala',
    image: 'https://picsum.photos/seed/omina3/600/400',
    tags: ['Spicy', 'Fusion']
  },
  {
    id: '4',
    vendorId: 'v3',
    name: 'Traditional Suna Mix',
    description: 'Omena cooked with traditional bitter greens (Managu/Suna) and cream. Authentic lakeside recipe.',
    price: 550,
    category: 'Traditional',
    image: 'https://picsum.photos/seed/omina4/600/400',
    tags: ['Nutritious', 'Lakeside']
  },
  {
    id: '5',
    vendorId: 'v1',
    name: 'Garlic Butter Omena',
    description: 'Infused with roasted garlic and fresh butter, a modern take on the classic Omena.',
    price: 480,
    category: 'Specialty',
    image: 'https://picsum.photos/seed/omina5/600/400',
    tags: ['Modern', 'Garlicky']
  },
  {
    id: '6',
    vendorId: 'v2',
    name: 'Lakeside Breakfast Tray',
    description: 'Smoked Omena served with roasted sweet potatoes and local ginger tea. A hearty Kisumu morning.',
    price: 650,
    category: 'Breakfast',
    image: 'https://picsum.photos/seed/ominabreakfast/600/400',
    tags: ['Traditional', 'Full Meal']
  },
  {
    id: '7',
    vendorId: 'v2',
    name: 'Omena Pizza (Fusion)',
    description: 'Thin crust pizza topped with deep-fried Omena, green olives, and fresh dhania.',
    price: 950,
    category: 'Fusion',
    image: 'https://picsum.photos/seed/ominapizza/600/400',
    tags: ['Modern', 'Lakeside']
  }
];

export const CATEGORIES = ['All', 'Wet Fry', 'Deep Fried', 'Masala', 'Traditional', 'Breakfast', 'Fusion', 'Specialty'];

export const FISHERMEN: Fisherman[] = [
  {
    id: 'f1',
    name: 'Baba Otieno',
    village: 'Dunga Beach',
    experience: '32 Years',
    story: 'A third-generation fisherman who knows every current in the Winam Gulf. He prides himself on using sustainable nets that protect young fingerlings.',
    image: 'https://picsum.photos/seed/fisher1/600/800',
    impactScore: 98
  },
  {
    id: 'f2',
    name: 'Mama Mercy',
    village: 'Asat Beach',
    experience: '15 Years',
    story: 'Leading the first all-women sustainable fishing cooperative in Asat. She oversees the careful sun-drying process that gives our Omena its premium quality.',
    image: 'https://picsum.photos/seed/fisher2/600/800',
    impactScore: 95
  },
  {
    id: 'f3',
    name: 'Captain Joseph',
    village: 'Mbita Point',
    experience: '22 Years',
    story: 'Specializes in deep-water harvesting during the dark moon cycles. His techniques minimize bycatch while ensuring the highest yield for the community.',
    image: 'https://picsum.photos/seed/fisher3/600/800',
    impactScore: 92
  }
];
