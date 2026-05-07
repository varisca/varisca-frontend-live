// ─── Admin Constants ────────────────────────────────────────────────

export const STORAGE_KEYS = {
  orders: 'varisca_orders',
  customers: 'varisca_customers',
  products: 'varnika_products',
  categories: 'varisca_categories',
  brands: 'varisca_brands',
  inventory: 'varisca_inventory_logs',
  coupons: 'varisca_coupons',
  transactions: 'varisca_transactions',
  shipping: 'varisca_shipping',
  deliveryPartners: 'varisca_delivery_partners',
  adminUsers: 'varisca_admin_users',
  settings: 'varisca_settings',
  banners: 'varisca_banners',
  campaigns: 'varisca_campaigns',
} as const;

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export const PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const;

export const RETURN_STATUSES = ['requested', 'approved', 'rejected', 'received', 'refunded'] as const;

export const DELIVERY_STATUSES = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'] as const;
