import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/lib/data';

const WISHLIST_STORAGE_KEY = 'varisca_wishlist';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
  isHydrated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save wishlist to localStorage:', error);
      }
    }
  }, [items, isHydrated]);

  const addToWishlist = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      totalItems,
      isHydrated,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
