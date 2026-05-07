import { useCallback } from 'react';
import { toast } from 'sonner';
import { ShoppingBag, Heart, Trash2, Check, Tag, X } from 'lucide-react';

export const useToastNotifications = () => {
  const showAddedToCart = useCallback((productName: string) => {
    toast.success('Added to Cart', {
      description: productName,
      icon: <ShoppingBag className="w-5 h-5 text-accent" />,
      duration: 4000,
    });
  }, []);

  const showRemovedFromCart = useCallback((productName: string) => {
    toast('Removed from Cart', {
      description: productName,
      icon: <Trash2 className="w-5 h-5 text-muted-foreground" />,
      duration: 4000,
    });
  }, []);

  const showAddedToWishlist = useCallback((productName: string) => {
    toast.success('Added to Wishlist', {
      description: productName,
      icon: <Heart className="w-5 h-5 text-accent fill-accent" />,
      duration: 4000,
    });
  }, []);

  const showRemovedFromWishlist = useCallback((productName: string) => {
    toast('Removed from Wishlist', {
      description: productName,
      icon: <Heart className="w-5 h-5 text-muted-foreground" />,
      duration: 4000,
    });
  }, []);

  const showCouponApplied = useCallback((code: string, discount: string) => {
    toast.success('Coupon Applied!', {
      description: `${code} - You save ${discount}`,
      icon: <Tag className="w-5 h-5 text-green-500" />,
      duration: 4000,
    });
  }, []);

  const showCouponError = useCallback((message: string) => {
    toast.error('Coupon Error', {
      description: message,
      icon: <X className="w-5 h-5 text-destructive" />,
      duration: 4000,
    });
  }, []);

  const showOrderError = useCallback((message: string) => {
    toast.error('Order Failed', {
      description: message,
      icon: <X className="w-5 h-5 text-destructive" />,
      duration: 5000,
    });
  }, []);

  const showOrderPlaced = useCallback((orderId: string) => {
    toast.success('Order Placed Successfully!', {
      description: `Order #${orderId}`,
      icon: <Check className="w-5 h-5 text-green-500" />,
      duration: 5000,
    });
  }, []);

  const showNewsletterSuccess = useCallback(() => {
    toast.success('Subscribed!', {
      description: 'Welcome to the Varisca family!',
      duration: 4000,
    });
  }, []);

  return {
    showAddedToCart,
    showRemovedFromCart,
    showAddedToWishlist,
    showRemovedFromWishlist,
    showCouponApplied,
    showCouponError,
    showOrderError,
    showOrderPlaced,
    showNewsletterSuccess,
  };
};
