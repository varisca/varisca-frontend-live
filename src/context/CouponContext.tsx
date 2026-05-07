import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '@/lib/api/client';

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  /** Caps percentage discounts; mirrors DB `coupons.max_discount`. */
  maxDiscount?: number | null;
  /** Minimum cart subtotal required; used when bag total changes. */
  minOrder?: number;
}

interface CouponContextType {
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string, orderTotal: number) => Promise<{ success: boolean; message: string; discount?: number }>;
  removeCoupon: () => void;
  calculateDiscount: (orderTotal: number) => number;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const applyCoupon = useCallback(async (code: string, orderTotal: number): Promise<{ success: boolean; message: string; discount?: number }> => {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const res = await api.post<{
        valid: boolean;
        message: string;
        discount?: number;
        code?: string;
        type?: 'percentage' | 'fixed';
        value?: number;
        max_discount?: number | null;
        min_order?: number;
      }>('/marketing/coupons/validate', {
        code: normalizedCode,
        orderTotal,
      }, { skipAdminAuth: true });

      if (!res.valid) {
        return { success: false, message: res.message || 'Invalid coupon' };
      }

      setAppliedCoupon({
        code: res.code!,
        type: res.type!,
        value: Number(res.value),
        maxDiscount: res.max_discount != null && res.max_discount > 0 ? Number(res.max_discount) : null,
        minOrder: res.min_order != null ? Number(res.min_order) : 0,
      });
      return { success: true, message: res.message, discount: res.discount };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error validating coupon' };
    }
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const calculateDiscount = useCallback((orderTotal: number): number => {
    if (!appliedCoupon) return 0;
    const total = Math.max(0, Number(orderTotal) || 0);
    if (appliedCoupon.minOrder != null && appliedCoupon.minOrder > 0 && total < appliedCoupon.minOrder) {
      return 0;
    }
    let d = 0;
    if (appliedCoupon.type === 'percentage') {
      d = (total * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount != null && appliedCoupon.maxDiscount > 0) {
        d = Math.min(d, appliedCoupon.maxDiscount);
      }
    } else {
      d = appliedCoupon.value;
    }
    d = Math.min(d, total);
    return Math.round(d * 100) / 100;
  }, [appliedCoupon]);

  return (
    <CouponContext.Provider value={{
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      calculateDiscount,
    }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    // Fallback to avoid hard-crashing if a component renders outside CouponProvider
    return {
      appliedCoupon: null as Coupon | null,
      applyCoupon: async () => ({ success: false, message: 'Coupons are unavailable right now.' }),
      removeCoupon: () => {},
      calculateDiscount: () => 0,
    };
  }
  return context;
};
