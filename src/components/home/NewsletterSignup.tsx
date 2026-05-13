import { motion } from 'framer-motion';

export const NewsletterSignup = () => {
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};
