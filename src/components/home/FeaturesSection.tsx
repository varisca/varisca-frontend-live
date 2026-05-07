import { motion } from 'framer-motion';
import { Truck, RefreshCcw, Shield, Headphones, type LucideIcon } from 'lucide-react';

export const STOREFRONT_TRUST_FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹999',
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    description: '7-day hassle-free returns',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: '100% secure checkout',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We\'re here to help',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-12 border-y border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STOREFRONT_TRUST_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <feature.icon size={24} className="text-accent" />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
