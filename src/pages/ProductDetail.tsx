import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Truck, RefreshCcw, Minus, Plus, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, type Product as UiProduct } from '@/lib/data';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { cn } from '@/lib/utils';
import { STOREFRONT_TRUST_FEATURES } from '@/components/home/FeaturesSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordian';

function chunkPairs<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

function buildKeyHighlights(product: UiProduct): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, v?: string) => {
    const t = v?.trim();
    if (t) rows.push({ label, value: t });
  };
  const sub = (product.subcategory || '').trim();
  const isWomenPants = product.category?.toLowerCase() === 'women' && sub === 'Pants';
  push('Fit', product.fit);
  push('Fabric', product.material);
  push('Neck', product.neck_type);
  if (isWomenPants) {
    push('Length', product.pants_length);
  } else {
    push('Sleeve', product.sleeve_length);
  }
  push('Pattern', product.design);
  return rows;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: products, isLoading, isError, error, refetch } = useProducts();
  const storefrontProducts = products as unknown as UiProduct[] | undefined;
  const product = storefrontProducts?.find(p => p.id === id);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { showAddedToCart, showAddedToWishlist, showRemovedFromWishlist } = useToastNotifications();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!product) return;
    addToRecentlyViewed(product);
    document.title = `${product.name} | Varisca`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const snippet = (product.description ?? '').slice(0, 100);
      metaDesc.setAttribute('content', `Buy ${product.name} at Varisca. ${snippet}${snippet ? '...' : ''}`);
    }
    // Depend only on id — not `product` — so a new object reference for the same product does not re-run this effect (avoids context update loops).
  }, [product?.id, addToRecentlyViewed]);

  useEffect(() => {
    if (!product?.colors?.length) {
      setSelectedColor(null);
      return;
    }
    setSelectedColor((prev) =>
      prev && product.colors.includes(prev) ? prev : product.colors[0]
    );
  }, [product?.id, product?.colors?.join?.('|')]);

  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor, product?.id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const main =
      selectedColor && product.color_images?.[selectedColor]
        ? product.color_images[selectedColor]
        : product.image;
    const out: string[] = [];
    const add = (u?: string) => {
      if (u && !out.includes(u)) out.push(u);
    };
    add(main);
    add(product.hoverImage);
    add(product.hover_image);
    for (const s of product.subImages || []) add(s);
    for (const s of product.sub_images || []) add(s);
    // Duplicate first image for a second thumbnail when needed — do NOT loop on add(image):
    // if main === product.image, add() is a no-op and a `while (out.length < 2)` would hang forever.
    if (out.length === 1 && out[0]) {
      out.push(out[0]);
    }
    return out.filter(Boolean);
  }, [product, selectedColor]);

  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [galleryImages]);

  if (isLoading) {
    return (
      <div className="container-custom py-20 flex justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-custom py-16 text-center max-w-lg mx-auto px-4">
        <p className="text-lg font-medium mb-2">Couldn&apos;t load this product</p>
        <p className="text-sm text-muted-foreground mb-6">
          {error instanceof Error ? error.message : String(error ?? 'Unknown error')}
        </p>
        <Button type="button" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button asChild>
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = galleryImages;
  const inWishlist = isInWishlist(product.id);
  const listPrice = product.originalPrice ?? product.original_price;
  const discount =
    listPrice != null && listPrice > product.price
      ? Math.round(((listPrice - product.price) / listPrice) * 100)
      : 0;

  const relatedProducts = (storefrontProducts || [])
    .filter((p) => {
      if (p.id === product.id) return false;
      if (product.subcategory) return p.subcategory === product.subcategory;
      return p.category === product.category;
    })
    .slice(0, 4);

  const highlightRows = buildKeyHighlights(product);
  const highlightChunks = chunkPairs(highlightRows);

  const handleAddToCart = () => {
    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please choose a color', {
        description: 'Select a color variant to add this item to your bag.',
      });
      return;
    }
    if (!selectedSize) {
      toast.error('Please choose a size', {
        description: 'Select your size to add this item to your bag.',
      });
      return;
    }
    addToCart(product, selectedSize, selectedColor || '', quantity);
    showAddedToCart(product.name);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please choose a color', {
        description: 'Select a color variant to continue to checkout.',
      });
      return;
    }
    if (!selectedSize) {
      toast.error('Please choose a size', {
        description: 'Select your size to continue to checkout.',
      });
      return;
    }
    addToCart(product, selectedSize, selectedColor || '', quantity);
    showAddedToCart(product.name);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      showRemovedFromWishlist(product.name);
    } else {
      addToWishlist(product);
      showAddedToWishlist(product.name);
    }
  };

  const thumbSrc = (colorName: string) =>
    product.color_images?.[colorName] || product.image;

  return (
    <main className="min-h-screen pb-16">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate('/shop');
            }}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>
      </div>

      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={images[activeImage] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
              {product.badge && (
                <div className="absolute top-4 left-4">
                  {product.badge === 'new' && <span className="badge-new">NEW</span>}
                  {product.badge === 'sale' && discount > 0 && (
                    <span className="badge-sale">-{discount}%</span>
                  )}
                  {product.badge === 'bestseller' && (
                    <span className="badge-bestseller">BESTSELLER</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    'aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all',
                    activeImage === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl sm:text-3xl font-bold">{formatPrice(product.price)}</span>
                {listPrice != null && listPrice > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(listPrice)}
                    </span>
                    <span className="text-accent font-semibold">{discount}% OFF</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Inclusive of all taxes</p>
            </div>

            {product.colors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">
                  Color:{' '}
                  <span className="text-muted-foreground">{selectedColor || 'Select'}</span>
                </h3>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'flex flex-col items-center gap-2 w-[4.75rem] text-center transition-all',
                        selectedColor === color ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                      )}
                    >
                      <span
                        className={cn(
                          'relative w-full aspect-[3/4] rounded-lg overflow-hidden border-2 bg-muted transition-all',
                          selectedColor === color
                            ? 'border-primary ring-2 ring-primary/25 shadow-md'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <img
                          src={thumbSrc(color)}
                          alt={color}
                          className="w-full h-full object-cover"
                        />
                      </span>
                      <span
                        className={cn(
                          'text-xs font-medium leading-tight',
                          selectedColor === color ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">
                  Size: <span className="text-muted-foreground">{selectedSize || 'Select'}</span>
                </h3>
                <Link to="/size-guide" className="text-sm text-accent hover:underline">
                  Size Guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'w-12 h-12 rounded-lg border text-sm font-medium transition-all',
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="inline-flex items-center border border-border rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="accent" size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingBag size={20} />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="w-14" onClick={handleWishlistToggle}>
                <Heart size={20} className={inWishlist ? 'fill-current text-accent' : ''} />
              </Button>
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={handleBuyNow}>
              Buy Now
            </Button>

            <section className="border-t border-border pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                {STOREFRONT_TRUST_FEATURES.map((feature) => (
                  <div key={feature.title} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                      <feature.icon size={22} className="text-accent" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-snug">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {highlightChunks.length > 0 && (
              <section className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-4">Key Highlights</h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  {highlightChunks.map((pair, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="grid grid-cols-2 gap-4 px-4 py-4 border-b border-border/70 last:border-b-0"
                    >
                      {pair.map((cell) => (
                        <div key={cell.label} className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">{cell.label}</p>
                          <p className="text-sm font-semibold leading-snug">{cell.value}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {product.description?.trim() && (
              <section className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-2">About this product</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </section>
            )}

            <Accordion type="multiple" defaultValue={[]} className="border-t border-border pt-2">
              <AccordionItem value="shipping" className="border-border">
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Truck size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">Free shipping</p>
                      <p className="text-sm text-muted-foreground font-normal">
                        How we deliver your Varisca order across India
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-3 pl-[3.25rem]">
                  <p>
                    <strong className="text-foreground">Free shipping</strong> on all orders above ₹999. No hidden
                    fees—rates are calculated at checkout for smaller carts.
                  </p>
                  <p>
                    <strong className="text-foreground">Dispatch:</strong> most orders ship within 1–2 business days.
                  </p>
                  <p>
                    <strong className="text-foreground">Delivery:</strong> standard delivery is typically 5–7 business
                    days; metro cities often receive orders sooner. We deliver to serviceable pincodes pan-India.
                  </p>
                  <p>
                    <Link to="/shipping" className="text-accent font-medium hover:underline">
                      Full shipping information
                    </Link>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="returns" className="border-border">
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <RefreshCcw size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">7-day returns &amp; exchange</p>
                      <p className="text-sm text-muted-foreground font-normal">
                        Hassle-free returns for Varisca orders
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-3 pl-[3.25rem]">
                  <p>
                    Items purchased from Varisca are eligible for return or exchange when the request is raised within{' '}
                    <strong className="text-foreground">7 days of delivery</strong>, subject to our quality checks.
                  </p>
                  <p>
                    <strong className="text-foreground">Free returns:</strong> we arrange doorstep pickup at no extra
                    charge in most cases, so you are not paying twice to try your size or color.
                  </p>
                  <p>
                    <strong className="text-foreground">Refunds:</strong> after we receive and inspect the item,
                    refunds are typically processed within 5–7 business days. Timelines may vary by payment method
                    (prepaid vs. cash on delivery).
                  </p>
                  <p>
                    <Link to="/returns" className="text-accent font-medium hover:underline">
                      Full returns &amp; exchanges policy
                    </Link>
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="section-title mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp, index) => (
                <ProductCard key={rp.id} product={rp} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetail;
