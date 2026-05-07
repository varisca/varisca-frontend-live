import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';

export const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-display font-bold flex items-center gap-2">
                <ShoppingBag size={20} />
                Your Cart ({items.length})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={64} className="text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Looks like you haven't added anything yet.
                  </p>
                  <Button onClick={() => setIsCartOpen(false)} asChild>
                    <Link to="/shop">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="flex gap-4 p-3 bg-muted/50 rounded-lg"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.size} • {item.color}
                        </p>
                        <p className="font-semibold mt-2">{formatPrice(item.product.price)}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <Button variant="accent" size="lg" className="w-full" asChild>
                  <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                    View Cart
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
