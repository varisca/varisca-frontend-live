import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const collectionCards = [
  {
    title: "Men's Collection",
    description: 'Comfort meets style',
    image: '/images/mens_white_tee_lifestyle_1770113127002.png',
    link: '/shop?category=men',
    overlay: 'from-charcoal/80 via-charcoal/35 to-transparent',
  },
  {
    title: "Women's Collection",
    description: 'Confident fits with effortless edge',
    image: '/images/womens_graphic_tee_lifestyle_1770113146661.png',
    link: '/shop?category=women',
    overlay: 'from-charcoal/85 via-charcoal/40 to-transparent',
  },
];

export const CollectionBanner = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {collectionCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative aspect-[3/2] lg:aspect-[2/1] rounded-xl sm:rounded-2xl overflow-hidden group"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${card.overlay}`} />

              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 md:p-10">
                <h3 className="text-white font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                  {card.title}
                </h3>
                <p className="text-white/75 mb-5 text-sm sm:text-base md:text-lg max-w-sm">
                  {card.description}
                </p>
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
