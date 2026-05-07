import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CollectionBanner = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Large Banner */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/5] sm:aspect-auto lg:row-span-2 rounded-xl sm:rounded-2xl overflow-hidden group"
          >
            <img
              src="/images/black_oversized_tee_street_style_1770113164208.png"
              alt="Streetwear Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
              <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded mb-4">
                NEW COLLECTION
              </span>
              <h3 className="text-white font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                Streetwear<br />Edit 2024
              </h3>
              <p className="text-white/70 mb-4 sm:mb-6 max-w-sm text-sm sm:text-base">
                Urban essentials designed for the streets. Bold, comfortable, and undeniably stylish.
              </p>
              <Button variant="accent" asChild>
                <Link to="/shop?collection=streetwear" className="gap-2">
                  Explore Collection
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Small Banners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative aspect-[3/2] sm:aspect-[2/1] rounded-xl sm:rounded-2xl overflow-hidden group"
          >
            <img
              src="/images/mens_white_tee_lifestyle_1770113127002.png"
              alt="Oversized Tees"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6 md:p-8">
              <h3 className="text-white font-display text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                Oversized Tees
              </h3>
              <p className="text-white/70 mb-4 text-sm md:text-base">
                Comfort meets style
              </p>
              <Link
                to="/shop?category=oversized"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative aspect-[3/2] sm:aspect-[2/1] rounded-xl sm:rounded-2xl overflow-hidden group"
          >
            <img
              src="/images/v_neck_tshirt_1770113330903.png"
              alt="Premium Tees"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6 md:p-8">
              <span className="inline-block px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-semibold rounded w-fit mb-2">
                SALE
              </span>
              <h3 className="text-white font-display text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                Premium Tees
              </h3>
              <p className="text-white/70 mb-4 text-sm md:text-base">
                Up to 40% off
              </p>
              <Link
                to="/shop?subcategory=tshirts"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
