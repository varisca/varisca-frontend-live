import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/data';

export const CategoryGrid = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find your perfect fit from our curated collections
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/shop?category=${category.id}`}
                className="group relative block aspect-[3/4] rounded-xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-primary-foreground font-display text-lg sm:text-xl md:text-2xl font-bold">
                        {category.name}
                      </h3>
                      <p className="text-primary-foreground/70 text-sm">
                        {category.count} Products
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                      <ArrowRight size={18} className="text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
