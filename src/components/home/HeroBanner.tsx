import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ensureBannerSeeded, getActiveBanners, getBannerUpdateEventName, type BannerRecord } from '@/lib/bannerStore';

const FALLBACK_SLIDES = [
  {
    id: 'fallback-1',
    image_url: '/images/black_oversized_tee_street_style_1770113164208.png',
    title: 'Oversized Collection',
    link_url: '/shop?collection=new-drops',
  },
  {
    id: 'fallback-2',
    image_url: '/images/womens_graphic_tee_lifestyle_1770113146661.png',
    title: 'Urban Streetwear',
    link_url: '/shop?category=women',
  },
  {
    id: 'fallback-3',
    image_url: '/images/mens_white_tee_lifestyle_1770113127002.png',
    title: 'Urban Streetwear',
    link_url: '/shop?category=men',
  },
];

type HeroSlide = Pick<BannerRecord, 'id' | 'image_url' | 'title' | 'link_url'>;

function getHeroSlides(): HeroSlide[] {
  ensureBannerSeeded();
  const records = getActiveBanners('hero').filter((banner) => banner.image_url);
  if (records.length > 0) {
    return records.map((banner) => ({
      id: banner.id,
      image_url: banner.image_url,
      title: banner.title,
      link_url: banner.link_url || '/shop',
    }));
  }
  return FALLBACK_SLIDES;
}

export const HeroBanner = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(() => getHeroSlides());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const syncSlides = () => {
      const nextSlides = getHeroSlides();
      setSlides(nextSlides);
      setCurrentIndex((current) => Math.min(current, Math.max(nextSlides.length - 1, 0)));
    };

    syncSlides();
    const eventName = getBannerUpdateEventName();
    window.addEventListener(eventName, syncSlides);
    return () => window.removeEventListener(eventName, syncSlides);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex] || FALLBACK_SLIDES[0];

  return (
    <section className="relative min-h-[85vh] sm:min-h-[80vh] lg:min-h-[90vh] pt-8 sm:pt-12 lg:pt-16 flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted pb-16 lg:pb-0">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative group order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={currentSlide.image_url}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1.5 transition-all duration-300 rounded-full${index === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-foreground/30 hover:bg-foreground/50'}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {slides.length > 1 && (
              <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 hidden sm:flex justify-between pointer-events-none z-20">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/70 hover:bg-background/90 backdrop-blur-sm border border-white/20 flex items-center justify-center text-foreground transition-all duration-300 pointer-events-auto opacity-0 group-hover:opacity-100 shadow-lg"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/70 hover:bg-background/90 backdrop-blur-sm border border-white/20 flex items-center justify-center text-foreground transition-all duration-300 pointer-events-auto opacity-0 group-hover:opacity-100 shadow-lg"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </button>
              </div>
            )}

            <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-accent/10 rounded-full blur-3xl -z-10" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                New Collection Dropped
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-black leading-[0.9] tracking-tighter"
              >
                Express
                Your
                <br />
                <span className="text-gradient pt-10">Vibe</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-md mx-auto lg:mx-0"
              >
                Express yourself with premium wear that speaks your language.
                Quality fashion for the bold and expressive.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <Button variant="hero" size="xl" asChild className="min-h-[52px] sm:min-h-[56px] text-base sm:text-lg px-8 sm:px-10 flex-1 sm:flex-initial min-w-[160px]">
                <Link to={currentSlide.link_url || '/shop'} className="gap-3">
                  Shop Now
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="min-h-[52px] sm:min-h-[56px] text-base sm:text-lg px-8 sm:px-10 flex-1 sm:flex-initial min-w-[160px]">
                <Link to="/shop?collection=new-drops">
                  New Drops
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
