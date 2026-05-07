export interface CustomOrderLine {
  size: string;
  quantity: number;
}

export interface CustomOrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomOrderRecord {
  id: string;
  createdAt: string;
  customer: CustomOrderCustomer;
  productType: string;
  variety: string;
  printType: string;
  printPositions: string[];
  color: string;
  notes?: string;
  lines: CustomOrderLine[];
  unitPrice: number;
  itemsTotal: number;
  shipping: number;
  total: number;
  status: 'awaiting_confirmation' | 'confirmed' | 'cancelled';
  backendOrderId?: string;
  backendOrderNumber?: string;
}

const STORAGE_KEY = "Varisca_custom_orders_v1";

export function getCustomOrders(): CustomOrderRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addCustomOrder(order: CustomOrderRecord) {
  const next = [order, ...getCustomOrders()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("custom-orders-updated"));
}

export function updateCustomOrder(id: string, patch: Partial<CustomOrderRecord>) {
  const current = getCustomOrders();
  const next = current.map((order) =>
    order.id === id ? { ...order, ...patch } : order
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("custom-orders-updated"));
}

