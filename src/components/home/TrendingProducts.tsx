import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/lib/data';
import { TrendingCollectionCard } from '@/components/home/TrendingCollectionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // ← add this import

function pickTshirts(products: Product[]): Product[] {
  const isTshirt = (p: Product) => /tshirt|t-?shirt|tee/i.test((p.subcategory || '').trim());
  const men = products.filter(
    (p) => (p.category || '').toLowerCase() === 'men' && isTshirt(p),
  );
  if (men.length >= 4) return men.slice(0, 4);
  const anyTs = products.filter((p) => isTshirt(p));
  const seen = new Set(men.map((p) => p.id));
  const merged = [...men, ...anyTs.filter((p) => !seen.has(p.id))];
  return merged.slice(0, 4);
}

function pickKurtis(products: Product[]): Product[] {
  return products
    .filter(
      (p) =>
        (p.category || '').toLowerCase() === 'women' &&
        (p.subcategory || '').toLowerCase() === 'kurti',
    )
    .slice(0, 4);
}

// ─── NEW: skeleton that mirrors the real card grid ────────────────────────
const SkeletonSection = () => (
  <div>
    <div className="mb-6 flex justify-center">
      <Skeleton className="h-5 w-24 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/3 rounded" />
        </div>
      ))}
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────

export const TrendingProducts = () => {
  const { data: products, isLoading } = useProducts();

  const { tshirts, kurtis } = useMemo(() => {
    const list = products ?? [];
    return { tshirts: pickTshirts(list), kurtis: pickKurtis(list) };
  }, [products]);

  // Temporary: hide this home block until these collections have listings.
  if (!isLoading && tshirts.length === 0 && kurtis.length === 0) {
    return null;
  }

  // ← REMOVED: the early return that caused the layout jump

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-center text-center md:flex-row md:items-end md:justify-between md:text-left"
        >
          <div className="mb-6 md:mb-0">
            <h2 className="section-title mb-2">Trending Now</h2>
            <p className="text-lg text-muted-foreground">Most loved pieces this week</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/shop" className="gap-2">
              View All
              <ArrowRight size={16} />
            </Link>
          </Button>
        </motion.div>

        <div className="space-y-14">
          {isLoading ? (
            // ← CHANGED: text → shimmer skeletons matching the real grid
            <>
              <SkeletonSection />
              <SkeletonSection />
            </>
          ) : (
            <>
              {tshirts.length > 0 && (
                <div>
                  <h3 className="mb-6 text-center text-base font-semibold tracking-tight md:text-lg">
                    T-Shirts
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                    {tshirts.map((product) => (
                      <TrendingCollectionCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {kurtis.length > 0 && (
                <div>
                  <h3 className="mb-6 text-center text-base font-semibold tracking-tight md:text-lg">
                    Kurtis
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                    {kurtis.map((product) => (
                      <TrendingCollectionCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
