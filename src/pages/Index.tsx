import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { CollectionBanner } from '@/components/home/CollectionBanner';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';

const Index = () => {
  const [showCurtain, setShowCurtain] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const alreadyShown = sessionStorage.getItem('variscaCurtainShown');
    const isDesktop = window.innerWidth >= 1024;

    if (!alreadyShown && isDesktop) {
      setShowCurtain(true);
      sessionStorage.setItem('variscaCurtainShown', '1');
    }
  }, []);

  return (
    <main className="relative overflow-hidden">
      <AnimatePresence>
        {showCurtain && (
          <motion.div
            className="fixed inset-0 z-[120] pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, delay: 0.9 }}
            onAnimationComplete={() => setShowCurtain(false)}
          >
            <div className="relative w-full h-full overflow-hidden bg-background">
              <motion.div
                className="absolute inset-x-0 top-0 h-1/2 bg-background"
                initial={{ translateY: 0 }}
                animate={{ translateY: '-100%' }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              />
              <motion.div
                className="absolute inset-x-0 bottom-0 h-1/2 bg-background"
                initial={{ translateY: 0 }}
                animate={{ translateY: '100%' }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroBanner />
      <TrendingProducts />
      <CollectionBanner />
      <RecentlyViewed />
      <FeaturesSection />
      <NewsletterSignup />
    </main>
  );
};

export default Index;
