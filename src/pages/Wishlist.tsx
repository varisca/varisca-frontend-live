import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingBag, LogIn, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=wishlist');
    }
  }, [isAuthenticated, navigate]);

  const handleMoveToCart = (productId: string) => {
    const product = items.find(p => p.id === productId);
    if (product) {
      addToCart(product, product.sizes[0], product.colors[0], 1);
      removeFromWishlist(productId);
      setIsCartOpen(true);
    }
  };

  // Show login required message while redirecting
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen">
        <div className="container-custom py-20 text-center">
          <Heart size={64} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-8">Please login to view your wishlist</p>
          <Button variant="accent" size="lg" asChild>
            <Link to="/login?redirect=wishlist" className="gap-2">
              <LogIn size={18} />
              Login to Continue
            </Link>
          </Button>
        </div>
      </main>
    );
  }

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
              <span className="text-4xl">💖</span>
            </div>
            <h1 className="text-2xl font-display font-bold mb-3">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-8">
              Save your favorite items here to buy them later!
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/shop">Explore Products</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <div className="container-custom py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/shop" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display font-bold"
          >
            Wishlist ({items.length})
          </motion.h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-3">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <Link to={`/product/${product.id}`}>
                <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleMoveToCart(product.id)}
              >
                <ShoppingBag size={16} />
                Move to Cart
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Wishlist;
