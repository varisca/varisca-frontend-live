import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X, LogIn } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCoupon } from '@/context/CouponContext';
import { useAuth } from '@/context/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, updateItemOptions, totalPrice, clearCart } = useCart();
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();
  const { isAuthenticated } = useAuth();
  const { showCouponApplied, showCouponError, showRemovedFromCart } = useToastNotifications();
  const [couponCode, setCouponCode] = useState('');

  const discount = calculateDiscount(totalPrice);
  const finalTotal = totalPrice - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    const result = await applyCoupon(couponCode, totalPrice);
    if (result.success) {
      showCouponApplied(couponCode.toUpperCase(), formatPrice(result.discount || calculateDiscount(totalPrice)));
      setCouponCode('');
    } else {
      showCouponError(result.message);
    }
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    removeFromCart(itemId);
    showRemovedFromCart(productName);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="container-custom py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag size={40} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-3">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet. 
              Start shopping and find something you love!
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/shop" className="gap-2">
                Start Shopping
                <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <div className="container-custom py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowRight size={18} className="rotate-180" />
          Back
        </button>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-6 sm:mb-8"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-xl border border-border"
              >
                <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-28 sm:w-24 sm:h-32 md:w-32 md:h-40 object-cover rounded-lg flex-shrink-0"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex-1">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="font-medium hover:text-accent transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.product.subcategory || item.product.category || ''}
                    </p>
                  </div>

                  {/* Size + Quantity row (match checkout look) */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="w-[6.25rem] sm:w-[6.75rem]">
                      <Select
                        value={item.size}
                        onValueChange={(v) => updateItemOptions(item.id, { size: v })}
                      >
                        <SelectTrigger className="h-9 bg-muted">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {(item.product.sizes && item.product.sizes.length ? item.product.sizes : [item.size]).map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Qty:</span>
                      <div className="flex items-center gap-1 border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1" />

                    <button
                      onClick={() => handleRemoveItem(item.id, item.product.name)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Price row (match checkout look) */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-lg sm:text-xl font-bold">{formatPrice(item.product.price)}</span>
                    {(item.product.original_price ?? item.product.originalPrice) && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice((item.product.original_price ?? item.product.originalPrice) as number)}
                        </span>
                        <span className="text-sm font-semibold text-accent">
                          ({Math.round((((item.product.original_price ?? item.product.originalPrice) as number) - item.product.price) / (item.product.original_price ?? item.product.originalPrice) as number * 100)}% OFF)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
              <button
                onClick={clearCart}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-28 mt-6 lg:mt-0"
          >
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-accent" />
                      <span className="font-medium text-accent">{appliedCoupon.code}</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="p-1 hover:bg-accent/20 rounded transition-colors"
                    >
                      <X size={16} className="text-accent" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="w-full h-10 pl-10 pr-4 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <Button variant="outline" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-accent font-medium">FREE</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button variant="accent" size="lg" className="w-full mt-6" asChild>
                <Link to="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Secure checkout powered by industry-standard encryption
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
