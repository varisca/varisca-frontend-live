import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';

/** Short label for “collection” style tiles — type/style, not full product title or price */
export function trendingStyleLabel(product: Product): string {
  const candidates = [
    product.design,
    product.neck_type,
    product.fit,
    product.sleeve_length,
  ]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);
  const pick = candidates[0];
  if (pick) return pick.length > 52 ? `${pick.slice(0, 49)}…` : pick;
  const words = product.name.trim().split(/\s+/).slice(0, 5).join(' ');
  return words || 'View product';
}

type TrendingCollectionCardProps = {
  product: Product;
  className?: string;
};

export function TrendingCollectionCard({ product, className }: TrendingCollectionCardProps) {
  const caption = trendingStyleLabel(product);

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn('group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl', className)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <img
          src={product.image}
          alt={caption}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div
          className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm ring-1 ring-black/5"
          aria-hidden
        >
          <Plus className="h-4 w-4 stroke-[1.5]" />
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-medium leading-snug text-foreground line-clamp-2">
        {caption}
      </p>
    </Link>
  );
}
