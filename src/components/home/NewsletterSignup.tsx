import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastNotifications } from '@/hooks/useToastNotifications';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showNewsletterSuccess } = useToastNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSuccess(true);
    showNewsletterSuccess();
    setEmail('');

    // Reset success state after animation
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-charcoal-light text-primary-foreground overflow-hidden">
      <div className="container-custom relative">
        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold">
              Join the Varisca Family
            </h2>

            <p className="text-lg text-white/80 max-w-md mx-auto">
              Be the first to know about new drops, exclusive offers, and style tips.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-12 pl-12 pr-4 bg-white text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="h-12 px-8"
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : isSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={20} />
                    Subscribed!
                  </motion.div>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>

            <p className="text-sm text-white/60">
              No spam, unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
