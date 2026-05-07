import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { formatPrice } from '@/lib/data';

export const RecentlyViewed = () => {
  const { items } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Clock className="text-accent" size={24} />
            <h2 className="text-2xl md:text-3xl font-display font-bold">Recently Viewed</h2>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-2 text-accent hover:underline font-medium"
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {items.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-36 sm:w-44 snap-start"
              >
                <Link to={`/product/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm font-medium line-clamp-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-accent">{formatPrice(product.price)}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
