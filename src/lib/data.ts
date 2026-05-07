export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  /** Same as `original_price` when set from the API normalizer (detail/cart paths). */
  originalPrice?: number;
  image: string;
  hover_image?: string;
  /** Same as `hover_image` when set from the API normalizer. */
  hoverImage?: string;
  sub_images: string[]; // Up to 4 sub-images for gallery
  /** Same as `sub_images` when set from the API normalizer. */
  subImages?: string[];
  category: string;
  subcategory: string;
  sizes: string[];
  colors: string[];
  /** Optional image per color name (URL or data URL), used for swatches and color-specific gallery */
  color_images?: Record<string, string>;
  badge?: 'new' | 'sale' | 'bestseller';
  rating: number;
  reviews: number;
  description: string;
  material: string;
  neck_type?: string;
  design?: string;
  purpose?: string;
  fit?: string;
  sleeve_length?: string;
  /** Women's pants hem length */
  pants_length?: string;
  variants?: any[]; // For Medusa integration
  inventory?: number;
  sku?: string;
  status?: 'active' | 'draft' | 'archived';
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  { id: 'men', name: 'Men', image: '/images/mens_white_tee_lifestyle_1770113127002.png', count: 18 },
  { id: 'women', name: 'Women', image: '/images/womens_graphic_tee_lifestyle_1770113146661.png', count: 12 },
];

export const collections: Collection[] = [
  { id: 'new-drops', name: 'New Drops', description: 'Fresh arrivals just landed', image: '/images/black_oversized_tee_street_style_1770113164208.png' },
  { id: 'streetwear', name: 'Streetwear Edit', description: 'Urban essentials', image: '/images/long_sleeve_tshirt_1770113309403.png' },
  { id: 'summer', name: 'Summer Vibes', description: 'Beat the heat in style', image: '/images/v_neck_tshirt_1770113330903.png' },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

