import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The quality of their oversized tees is unmatched! Super comfortable and the fit is exactly as described. Will definitely buy more.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    product: 'Urban Street Oversized Tee',
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Delhi',
    rating: 5,
    text: 'Fast delivery and amazing packaging! The long sleeve I ordered is so soft and looks even better in person. Highly recommend Varisca!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    product: 'Long Sleeve Basic',
  },
  {
    id: 3,
    name: 'Arjun Reddy',
    location: 'Bangalore',
    rating: 5,
    text: 'Been buying from Varisca for 6 months now. Their classic crews are top-notch and returns are hassle-free. Love the brand!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    product: 'Classic White Crew',
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    location: 'Chennai',
    rating: 5,
    text: 'The graphic tee fits perfectly! Great quality material and the print is vibrant. Will be ordering more designs soon.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    product: 'Artistic Vibe Graphic Tee',
  },
];

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goTo = (index: number) => setCurrentIndex(index);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join thousands of happy customers who love shopping with us
          </p>
        </motion.div>

        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel */}
          <div className="overflow-hidden rounded-2xl bg-background shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="p-8 md:p-12"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-accent/20">
                      <img
                        src={testimonials[currentIndex].avatar}
                        alt={testimonials[currentIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <Quote size={18} className="text-accent-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    {/* Rating */}
                    <div className="flex justify-center md:justify-start gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={cn(
                            i < testimonials[currentIndex].rating
                              ? 'fill-accent text-accent'
                              : 'fill-muted text-muted'
                          )}
                        />
                      ))}
                    </div>

                    <p className="text-lg md:text-xl mb-6 text-foreground/90 leading-relaxed">
                      "{testimonials[currentIndex].text}"
                    </p>

                    <div>
                      <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                      <p className="text-muted-foreground text-sm">
                        {testimonials[currentIndex].location} • Bought {testimonials[currentIndex].product}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-background shadow-lg flex items-center justify-center hover:bg-muted transition-colors hidden md:flex"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-background shadow-lg flex items-center justify-center hover:bg-muted transition-colors hidden md:flex"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === currentIndex ? 'bg-accent w-8' : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
