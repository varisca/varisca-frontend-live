import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/lib/data';

const RECENTLY_VIEWED_KEY = 'Varisca_recently_viewed';
const MAX_ITEMS = 10;

interface RecentlyViewedContextType {
  items: Product[];
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load recently viewed from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save recently viewed to localStorage:', error);
    }
  }, [items]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setItems(prev => {
      // Already at the front — same reference stability: avoid setState loop when PDP re-renders with a new object for the same id
      if (prev[0]?.id === product.id) return prev;
      const filtered = prev.filter(item => item.id !== product.id);
      const updated = [product, ...filtered];
      return updated.slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{
      items,
      addToRecentlyViewed,
      clearRecentlyViewed,
    }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};
