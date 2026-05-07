import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product, formatPrice } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showAddedToCart, showAddedToWishlist, showRemovedFromWishlist } = useToastNotifications();

  const inWishlist = isInWishlist(product.id);
  const listPrice = product.original_price ?? product.originalPrice;
  const hasDiscount =
    listPrice != null && listPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((listPrice - product.price) / listPrice) * 100)
    : 0;
  const offAmount = hasDiscount ? listPrice - product.price : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0], 1);
    showAddedToCart(product.name);
    setIsCartOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      showRemovedFromWishlist(product.name);
    } else {
      addToWishlist(product);
      showAddedToWishlist(product.name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-500",
              isHovered && product.hover_image ? "opacity-0 scale-105" : "opacity-100 scale-100"
            )}
          />
          
          {/* Hover Image */}
          {product.hover_image && (
            <img
              src={product.hover_image}
              alt={product.name}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
              )}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badge === 'new' && (
              <span className="badge-new">NEW</span>
            )}
            {product.badge === 'sale' && discount > 0 && (
              <span className="badge-sale">-{discount}%</span>
            )}
            {product.badge === 'bestseller' && (
              <span className="badge-bestseller">BESTSELLER</span>
            )}
          </div>

          {/* Quick Actions - Heart always visible on mobile, on hover on desktop */}
          <div className={cn(
            "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300",
            "opacity-100 translate-x-0 md:opacity-0 md:translate-x-2",
            "md:group-hover:opacity-100 md:group-hover:translate-x-0"
          )}>
            <button
              onClick={handleWishlist}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                inWishlist 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} className={inWishlist ? "fill-current" : ""} />
            </button>
          </div>

          {/* Add to Cart Button - Hidden on mobile, visible on desktop hover */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 hidden md:block",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <button
              onClick={handleAddToCart}
              className="w-full h-10 bg-charcoal text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-charcoal-light transition-colors"
            >
              <ShoppingBag size={16} />
              Quick Add
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-bold">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(listPrice)}
                </span>
                <span className="text-xs font-semibold text-accent">
                  {formatPrice(offAmount)} off
                </span>
              </>
            )}
          </div>

        </div>
      </Link>
    </motion.div>
  );
};
