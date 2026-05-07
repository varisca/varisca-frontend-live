import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/lib/data';

const CART_STORAGE_KEY = 'Varisca_cart';

interface CartItem {
  id: string; // unique identifier for cart item
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemOptions: (itemId: string, next: { size?: string; color?: string }) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate a unique ID for each cart item based on product, size, color
const generateItemId = (productId: string, size: string, color: string) =>
  `${productId}-${size}-${color}`;

function findNeedleId(item: CartItem): string {
  return String(item.id || generateItemId(item.product.id, item.size, item.color));
}

/** Ensures stable `id` and numeric price (localStorage / legacy carts often omit `id` or use string prices). */
function normalizeCartItem(raw: CartItem): CartItem {
  const product = raw.product;
  if (!product?.id) return raw;
  const size = String(raw.size ?? '');
  const color = String(raw.color ?? '');
  const id =
    raw.id && String(raw.id).length > 0
      ? String(raw.id)
      : generateItemId(product.id, size, color);
  const p = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  const op = product.original_price != null
    ? (typeof product.original_price === 'string' ? parseFloat(product.original_price) : Number(product.original_price))
    : product.originalPrice != null
      ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : Number(product.originalPrice))
      : undefined;
  return {
    ...raw,
    id,
    size,
    color,
    quantity: Math.max(1, Math.floor(Number(raw.quantity) || 1)),
    product: {
      ...product,
      price: Number.isFinite(p) ? p : 0,
      ...(Number.isFinite(op as number) ? { original_price: op, originalPrice: op as number } : {}),
    },
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed.map((row: CartItem) => normalizeCartItem(row)));
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [items, isHydrated]);

  const addToCart = useCallback((product: Product, size: string, color: string, quantity = 1) => {
    setItems(prev => {
      const itemId = generateItemId(product.id, size, color);
      const existingIndex = prev.findIndex((item) => {
        const nid = String(item.id || generateItemId(item.product.id, item.size, item.color));
        return nid === itemId;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        const cur = normalizeCartItem(updated[existingIndex]);
        updated[existingIndex] = normalizeCartItem({
          ...cur,
          quantity: cur.quantity + quantity,
        });
        return updated;
      }

      return [...prev, normalizeCartItem({ id: itemId, product, quantity, size, color })];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    const needle = String(itemId);
    setItems((prev) =>
      prev.filter((item) => {
        const nid = findNeedleId(item);
        return nid !== needle;
      })
    );
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const needle = String(itemId);
    setItems((prev) =>
      prev.map((item) => {
        const nid = findNeedleId(item);
        return nid === needle ? normalizeCartItem({ ...item, id: nid, quantity }) : normalizeCartItem(item);
      })
    );
  }, []);

  const updateItemOptions = useCallback((itemId: string, next: { size?: string; color?: string }) => {
    const needle = String(itemId);
    const nextSize = typeof next.size === 'string' ? next.size : undefined;
    const nextColor = typeof next.color === 'string' ? next.color : undefined;
    if (nextSize == null && nextColor == null) return;

    setItems((prev) => {
      const normalized = prev.map(normalizeCartItem);
      const idx = normalized.findIndex((it) => findNeedleId(it) === needle);
      if (idx < 0) return normalized;

      const cur = normalized[idx];
      const size = nextSize != null ? nextSize : cur.size;
      const color = nextColor != null ? nextColor : cur.color;
      const newId = generateItemId(cur.product.id, size, color);

      // No change
      if (newId === findNeedleId(cur)) return normalized;

      // If there is already an item with that product+size+color, merge quantities
      const otherIdx = normalized.findIndex((it, j) => j !== idx && findNeedleId(it) === newId);
      if (otherIdx > -1) {
        const mergedQty = normalized[otherIdx].quantity + cur.quantity;
        const kept = normalizeCartItem({ ...normalized[otherIdx], id: newId, quantity: mergedQty });
        return normalized.filter((_, j) => j !== idx && j !== otherIdx).concat([kept]);
      }

      const updated = [...normalized];
      updated[idx] = normalizeCartItem({ ...cur, id: newId, size, color });
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemOptions,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      setIsCartOpen,
      isHydrated,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
