// ─── Razorpay payment API — same URL rules as orderStore `api.post('/orders', …)` ─
import { storefrontPost } from '@/lib/api/client';

export interface CreatePaymentOrderResponse {
  success: boolean;
  rzOrderId: string;
  amount: number;
  currency: string;
  key: string;
  message?: string;
}

/**
 * After `POST /api/orders` creates the DB order, call this to get a Razorpay order id.
 * Path mirrors orders: `api.post('/orders')` → `storefrontPost('/payment/create-order')` under `getApiBase()`.
 */
export async function createRazorpayPaymentOrder(body: {
  orderId: string;
  amount: number;
  email: string;
  contact?: string;
}): Promise<CreatePaymentOrderResponse> {
  const data = await storefrontPost<CreatePaymentOrderResponse & { error?: string; message?: string }>(
    '/payment/create-order',
    {
      orderId: body.orderId,
      amount: body.amount,
      email: body.email,
      contact: body.contact || '',
    },
  );
  if (!data.success || !data.key || !data.rzOrderId) {
    throw new Error(data.message || 'Invalid response from payment server');
  }
  return data;
}

export async function verifyRazorpayPayment(body: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; message?: string }> {
  const data = await storefrontPost<{ success?: boolean; message?: string; error?: string }>(
    '/payment/verify',
    body,
  );
  if (!data.success) {
    throw new Error(data.message || data.error || 'Verification failed');
  }
  return { success: true, message: data.message };
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { Razorpay?: unknown };
  if (w.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Razorpay checkout'));
    document.body.appendChild(s);
  });
}
