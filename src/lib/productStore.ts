// ─── Product Store — API-backed ─────────────────────────────────────
import { api } from '@/lib/api/client';

/** Admin saves can include large base64 image payloads */
const ADMIN_PRODUCT_TIMEOUT_MS = 120_000;

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  image: string;
  hover_image?: string;
  sub_images?: string[];
  category: string;
  subcategory?: string;
  /** Leaf category row (subcategory) when set */
  category_id?: string | null;
  sizes: string[];
  colors: string[];
  /** JSON map from API; optional until migration applied */
  color_images?: Record<string, string> | null;
  badge?: string | null;
  rating: number;
  reviews: number;
  description: string;
  material: string;
  fit?: string;
  sleeve_length?: string;
  /** Women's pants: Ankle / Long / Chudidar */
  pants_length?: string;
  neck_type?: string;
  design?: string;
  purpose?: string;
  inventory: number;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  created_at?: string;
  updated_at?: string;
}

// ─── CRUD helpers ───────────────────────────────────────────────────

/**
 * @param options.skipAdminAuth - Default `true` (storefront). Set `false` from admin pages so the
 *   request sends the JWT and the API returns `Cache-Control: no-store` — avoids a stale list vs pgAdmin/DB.
 */
export async function getProducts(
  params?: Record<string, any>,
  options?: { skipAdminAuth?: boolean },
): Promise<{ data: Product[]; total: number }> {
  const skipAdminAuth = options?.skipAdminAuth ?? true;
  return api.get('/products', params, { skipAdminAuth });
}

export async function getProductFilters(): Promise<{ 
  sizes: string[], 
  colors: string[], 
  materials: string[], 
  fits: string[], 
  sleeve_lengths: string[], 
  neck_types: string[],
  designs: string[],
  purposes: string[],
  categories: string[]
}> {
  // Public endpoint; do not attach admin auth
  return api.get('/products/filters', undefined, { skipAdminAuth: true });
}

export async function getProduct(id: string): Promise<Product> {
  // Public endpoint; do not attach admin auth
  return api.get(`/products/${id}`, undefined, { skipAdminAuth: true });
}

/** Next `VRN-TSH-###` SKU based on all rows in the database (avoids duplicate SKU when the admin list is paginated). */
export async function getNextProductSku(): Promise<string> {
  const res = await api.get<{ sku: string }>('/products/next-sku');
  return res.sku;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  return api.post('/products', product, { timeoutMs: ADMIN_PRODUCT_TIMEOUT_MS });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return api.put(`/products/${id}`, data, { timeoutMs: ADMIN_PRODUCT_TIMEOUT_MS });
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`, { timeoutMs: 30_000 });
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  await api.post('/products/bulk-delete', { ids }, { timeoutMs: 30_000 });
}

// ─── Legacy compat (for any remaining localStorage refs) ────────────
export function getAllProducts(): Product[] {
  console.warn('[productStore] getAllProducts() is deprecated — use getProducts() async');
  return [];
}

// Backward-compat aliases (renamed during API migration)
export const addProduct = createProduct;
export const deleteProducts = bulkDeleteProducts;

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

