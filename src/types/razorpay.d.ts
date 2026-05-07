/** Loaded from https://checkout.razorpay.com/v1/checkout.js */
export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  prefill?: { email?: string; contact?: string; name?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpaySuccessResponse) => void;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', cb: (response: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export {};
