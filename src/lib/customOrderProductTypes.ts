import { api } from '@/lib/api/client';

export interface CustomOrderProductType {
  id: string;
  slug: string;
  name: string;
  image: string;
  base_price: number;
  original_price: number;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const FALLBACK_CUSTOM_ORDER_PRODUCT_TYPES: CustomOrderProductType[] = [
  {
    id: 'fallback-tees',
    slug: 'tees',
    name: 'Crew Neck',
    image: '/images/mens_white_tee_lifestyle_1770113127002.png',
    base_price: 499,
    original_price: 749,
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'fallback-long-sleeve',
    slug: 'long-sleeve',
    name: 'Long Sleeve',
    image: '/images/long_sleeve_tshirt_1770113309403.png',
    base_price: 799,
    original_price: 1199,
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'fallback-v-neck',
    slug: 'v-neck',
    name: 'V-Neck',
    image: '/images/v_neck_tshirt_1770113330903.png',
    base_price: 699,
    original_price: 999,
    sort_order: 3,
    is_active: true,
  },
];

const LOCAL_TYPES_KEY = 'varisca_custom_order_product_types_v1';

function sortTypes(types: CustomOrderProductType[]) {
  return [...types].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

function readLocalTypes() {
  try {
    const raw = localStorage.getItem(LOCAL_TYPES_KEY);
    if (!raw) return FALLBACK_CUSTOM_ORDER_PRODUCT_TYPES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as CustomOrderProductType[] : FALLBACK_CUSTOM_ORDER_PRODUCT_TYPES;
  } catch {
    return FALLBACK_CUSTOM_ORDER_PRODUCT_TYPES;
  }
}

function writeLocalTypes(types: CustomOrderProductType[]) {
  localStorage.setItem(LOCAL_TYPES_KEY, JSON.stringify(sortTypes(types)));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getCustomOrderProductTypes(admin = false) {
  try {
    const res = await api.get<{ data: CustomOrderProductType[] }>(
      admin ? '/custom-order-product-types/admin' : '/custom-order-product-types',
      undefined,
      { skipAdminAuth: !admin }
    );
    return res.data;
  } catch {
    const localTypes = readLocalTypes();
    return admin ? sortTypes(localTypes) : sortTypes(localTypes.filter((type) => type.is_active));
  }
}

export async function saveCustomOrderProductType(
  body: Pick<CustomOrderProductType, 'name' | 'slug' | 'image' | 'base_price' | 'original_price' | 'sort_order' | 'is_active'>,
  id?: string
) {
  try {
    if (id) return await api.put<CustomOrderProductType>(`/custom-order-product-types/${id}`, body);
    return await api.post<CustomOrderProductType>('/custom-order-product-types', body);
  } catch {
    const existing = readLocalTypes();
    const now = new Date().toISOString();
    const slug = slugify(body.slug || body.name);
    if (id) {
      const next = existing.map((type) =>
        type.id === id
          ? { ...type, ...body, slug, updated_at: now }
          : type
      );
      writeLocalTypes(next);
      return next.find((type) => type.id === id) as CustomOrderProductType;
    }

    const created: CustomOrderProductType = {
      id: `local-${Date.now()}`,
      ...body,
      slug,
      created_at: now,
      updated_at: now,
    };
    writeLocalTypes([...existing, created]);
    return created;
  }
}

export async function deleteCustomOrderProductType(id: string) {
  try {
    await api.delete(`/custom-order-product-types/${id}`);
  } catch {
    writeLocalTypes(readLocalTypes().filter((type) => type.id !== id));
  }
}
