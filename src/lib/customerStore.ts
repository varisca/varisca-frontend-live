// ─── Customer Store — API-backed ────────────────────────────────────
import { api } from '@/lib/api/client';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orders_count: number;
  total_spent: number;
  joined_date: string;
  last_order_date?: string;
  created_at?: string;
}

// ─── CRUD ───────────────────────────────────────────────────────────

export async function getCustomers(params?: Record<string, any>): Promise<{ data: Customer[]; total: number }> {
  return api.get('/customers', params);
}

export async function getCustomer(id: string): Promise<Customer> {
  return api.get(`/customers/${id}`);
}

export async function upsertCustomer(customer: Partial<Customer>): Promise<Customer> {
  return api.post('/customers', customer);
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  return api.put(`/customers/${id}`, data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}

export async function getCustomerStats() {
  return api.get('/customers/stats/summary');
}

// ─── Legacy compat ──────────────────────────────────────────────────
export function getAllCustomers(): Customer[] {
  console.warn('[customerStore] getAllCustomers() is deprecated — use getCustomers() async');
  return [];
}
