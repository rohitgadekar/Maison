export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  badge?: string;
  // Additional fields from Supabase
  image_url?: string;
  images?: string[];
  inventory?: number;
  is_active?: boolean;
  sizes?: string[];
  tag?: string;
  created_at?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Minimal Leather Tote",
    price: 289,
    description: "Handcrafted from premium Italian leather with brass hardware. Features a spacious interior with magnetic closure.",
    category: "Bags",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=750&fit=crop",
    badge: "New Arrival"
  },
  {
    id: "2",
    name: "Cashmere Oversized Sweater",
    price: 345,
    description: "Luxuriously soft 100% cashmere in a relaxed silhouette. Perfect for layering or wearing alone.",
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=750&fit=crop"
  },
  {
    id: "3",
    name: "Sculptural Gold Earrings",
    price: 175,
    description: "18k gold-plated statement earrings with an organic, sculptural form. Lightweight and comfortable.",
    category: "Jewelry",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=750&fit=crop",
    badge: "Bestseller"
  },
  {
    id: "4",
    name: "Linen Wide-Leg Trousers",
    price: 195,
    description: "High-waisted trousers in breathable European linen. Features side pockets and a relaxed fit.",
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop"
  },
  {
    id: "5",
    name: "Ceramic Vase Set",
    price: 145,
    description: "Set of three handmade ceramic vases in neutral tones. Each piece is unique with subtle variations.",
    category: "Home",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=750&fit=crop"
  },
  {
    id: "6",
    name: "Wool Blend Coat",
    price: 495,
    description: "Tailored coat in a soft wool blend. Double-breasted design with horn buttons and satin lining.",
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=750&fit=crop",
    badge: "Limited Edition"
  },
  {
    id: "7",
    name: "Suede Ankle Boots",
    price: 325,
    description: "Italian suede boots with a block heel. Cushioned insole for all-day comfort.",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=750&fit=crop"
  },
  {
    id: "8",
    name: "Silk Scarf",
    price: 125,
    description: "100% mulberry silk scarf with hand-rolled edges. Original artwork print in warm earth tones.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=750&fit=crop"
  }
];
