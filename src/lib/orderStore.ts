// ─── Order Store — API-backed ───────────────────────────────────────
import { api, customerApi } from '@/lib/api/client';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
  product_id?: string;
  sku?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  handling_fee?: number;
  total: number;
  shipping_address: string;
  payment_method: string;
  payment_status?: string;
  coupon_code?: string;
  items: OrderItem[];
  notes?: string;
  created_at?: string;
}

// ─── CRUD ───────────────────────────────────────────────────────────

export async function getOrders(params?: Record<string, any>): Promise<{ data: Order[]; total: number }> {
  return api.get('/orders', params);
}

// Customer self-service: get own orders (requires customer JWT)
export async function getMyOrders(): Promise<Order[]> {
  return customerApi.get('/orders/my');
}

export async function getOrder(id: string): Promise<Order> {
  return api.get(`/orders/${id}`);
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  return api.post('/orders', order, { skipAdminAuth: true });
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  return api.put(`/orders/${id}/status`, { status });
}

export async function updateOrderPaymentStatus(id: string, status: string): Promise<Order> {
  return api.put(`/orders/${id}/payment-status`, { payment_status: status });
}

export async function getOrderStats() {
  return api.get('/orders/stats/summary');
}

// ─── Legacy compat ──────────────────────────────────────────────────
export function getAllOrders(): Order[] {
  console.warn('[orderStore] getAllOrders() is deprecated — use getOrders() async');
  return [];
}

// Backward-compat aliases (renamed during API migration)
export const addOrder = createOrder;
export type OrderStatus = Order['status'];

