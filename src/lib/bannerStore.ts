import { STORAGE_KEYS } from '@/lib/admin/utils/constants';

export type BannerPosition = 'hero' | 'sidebar' | 'footer' | 'popup';
export type BannerStatus = 'active' | 'inactive' | 'scheduled';

export interface BannerRecord {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  position: BannerPosition;
  status: BannerStatus;
  clicks: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = STORAGE_KEYS.banners;
const UPDATE_EVENT = 'varisca-banners-updated';

const defaultBanners: BannerRecord[] = [
  {
    id: 'banner-hero-1',
    title: 'Oversized Collection',
    subtitle: 'Street-led silhouettes for everyday wear.',
    image_url: '/images/black_oversized_tee_street_style_1770113164208.png',
    link_url: '/shop?collection=new-drops',
    position: 'hero',
    status: 'active',
    clicks: 0,
    impressions: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  },
  {
    id: 'banner-hero-2',
    title: 'Urban Streetwear',
    subtitle: 'Premium casualwear with a sharp street edge.',
    image_url: '/images/womens_graphic_tee_lifestyle_1770113146661.png',
    link_url: '/shop?category=women',
    position: 'hero',
    status: 'active',
    clicks: 0,
    impressions: 0,
    createdAt: new Date('2026-01-01T00:00:01.000Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:01.000Z').toISOString(),
  },
  {
    id: 'banner-hero-3',
    title: 'Urban Streetwear',
    subtitle: 'Essentials built for comfort, cut for presence.',
    image_url: '/images/mens_white_tee_lifestyle_1770113127002.png',
    link_url: '/shop?category=men',
    position: 'hero',
    status: 'active',
    clicks: 0,
    impressions: 0,
    createdAt: new Date('2026-01-01T00:00:02.000Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:02.000Z').toISOString(),
  },
];

function emitUpdate() {
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function normalizeBanner(input: Partial<BannerRecord>, fallbackId?: string): BannerRecord {
  const now = new Date().toISOString();
  return {
    id: input.id || fallbackId || `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title?.trim() || 'Untitled banner',
    subtitle: input.subtitle?.trim() || '',
    image_url: input.image_url || '',
    link_url: input.link_url?.trim() || '/shop',
    position: (input.position as BannerPosition) || 'hero',
    status: (input.status as BannerStatus) || 'active',
    clicks: Number(input.clicks || 0),
    impressions: Number(input.impressions || 0),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

function writeBanners(records: BannerRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  emitUpdate();
}

export function getBanners(): BannerRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultBanners;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultBanners;
    return parsed.map((record) => normalizeBanner(record));
  } catch {
    return defaultBanners;
  }
}

export function ensureBannerSeeded() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBanners));
  } catch {
    // Ignore storage errors and keep runtime fallback behavior.
  }
}

export function addBanner(data: Omit<Partial<BannerRecord>, 'id' | 'createdAt' | 'updatedAt'>) {
  const current = getBanners();
  const next = [normalizeBanner(data), ...current];
  writeBanners(next);
  return next[0];
}

export function updateBanner(id: string, patch: Partial<BannerRecord>) {
  const current = getBanners();
  const next = current.map((banner) =>
    banner.id === id
      ? normalizeBanner({ ...banner, ...patch, id, updatedAt: new Date().toISOString() }, id)
      : banner
  );
  writeBanners(next);
}

export function deleteBanner(id: string) {
  const next = getBanners().filter((banner) => banner.id !== id);
  writeBanners(next);
}

export function deleteBanners(ids: string[]) {
  const idSet = new Set(ids);
  const next = getBanners().filter((banner) => !idSet.has(banner.id));
  writeBanners(next);
}

export function getActiveBanners(position?: BannerPosition) {
  return getBanners().filter((banner) => {
    if (banner.status !== 'active') return false;
    return position ? banner.position === position : true;
  });
}

export function getBannerUpdateEventName() {
  return UPDATE_EVENT;
}
