import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, formatPrice } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { addToCart, setIsCartOpen } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showAddedToCart, showAddedToWishlist, showRemovedFromWishlist } = useToastNotifications();

  if (!product) return null;

  const images = [product.image, product.hoverImage].filter(Boolean) as string[];
  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    showAddedToCart(product.name);
    setIsCartOpen(true);
    onClose();
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      showRemovedFromWishlist(product.name);
    } else {
      addToWishlist(product);
      showAddedToWishlist(product.name);
    }
  };

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="bg-background rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/90 hover:bg-background flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>

              <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
                {/* Image Section */}
                <div className="relative aspect-square bg-muted">
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>

                      {/* Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              activeImage === index ? "bg-accent w-6" : "bg-white/50"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4">
                      {product.badge === 'new' && <span className="badge-new">NEW</span>}
                      {product.badge === 'sale' && <span className="badge-sale">-{discount}%</span>}
                      {product.badge === 'bestseller' && (
                        <span className="badge-bestseller">BESTSELLER</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 md:p-8 space-y-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-bold mb-2">
                      {product.name}
                    </h2>

                    {/* Price */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <>
                          <span className="text-lg text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="text-accent font-semibold">
                            {discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <h3 className="font-medium mb-2 text-sm">
                      Color: <span className="text-muted-foreground">{selectedColor || 'Select'}</span>
                    </h3>
                    <div className="flex gap-2">
                      {product.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                            selectedColor === color
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          )}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div>
                    <h3 className="font-medium mb-2 text-sm">
                      Size: <span className="text-muted-foreground">{selectedSize || 'Select'}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "w-10 h-10 rounded-lg border text-sm font-medium transition-all",
                            selectedSize === size
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Quantity</h3>
                    <div className="inline-flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="accent"
                      size="lg"
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={!selectedSize || !selectedColor}
                    >
                      <ShoppingBag size={18} />
                      Add to Cart
                    </Button>
                    <button
                      onClick={handleWishlist}
                      className={cn(
                        "w-12 h-12 rounded-lg border flex items-center justify-center transition-all",
                        inWishlist
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent hover:text-accent"
                      )}
                    >
                      <Heart size={20} className={inWishlist ? "fill-current" : ""} />
                    </button>
                  </div>

                  {(!selectedSize || !selectedColor) && (
                    <p className="text-sm text-muted-foreground">
                      Please select size and color to continue
                    </p>
                  )}

                  {/* View Full Details Link */}
                  <Link
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="inline-block text-sm text-accent hover:underline"
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
