import { motion } from 'framer-motion';
import { RefreshCcw, Package, CreditCard, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const steps = [
  {
    step: 1,
    title: 'Initiate Return',
    description: 'Log in to your account, go to "My Orders", and click "Return" on the item you wish to return.',
  },
  {
    step: 2,
    title: 'Pack the Item',
    description: 'Pack the item securely in the original packaging with tags attached. Print the return label.',
  },
  {
    step: 3,
    title: 'Schedule Pickup',
    description: 'Our courier partner will pick up the package from your doorstep within 24-48 hours.',
  },
  {
    step: 4,
    title: 'Receive Refund',
    description: 'Once we receive and inspect the item, your refund will be processed within 5-7 business days.',
  },
];

const Returns = () => {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
              <RefreshCcw size={32} className="text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Returns & Exchanges
            </h1>
            <p className="text-muted-foreground text-lg">
              Hassle-free returns within 7 days. Your satisfaction is our priority.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-12 md:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-card border border-border rounded-xl text-center"
            >
              <Clock size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">7-Day Window</h3>
              <p className="text-sm text-muted-foreground">
                Return anything within 7 days of delivery
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-card border border-border rounded-xl text-center"
            >
              <Package size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Free Returns</h3>
              <p className="text-sm text-muted-foreground">
                We'll pick up from your doorstep at no cost
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-card border border-border rounded-xl text-center"
            >
              <CreditCard size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Quick Refunds</h3>
              <p className="text-sm text-muted-foreground">
                Get your money back in 5-7 business days
              </p>
            </motion.div>
          </div>

          {/* Return Process */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-display font-bold mb-8 text-center">
              How to Return
            </h2>
            <div className="space-y-6">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold mb-6">Return Eligibility</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Eligible */}
              <div className="p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-4">
                  ✓ Eligible for Returns
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Items within 7 days of delivery</li>
                  <li>• Unworn and unwashed items</li>
                  <li>• Items with original tags attached</li>
                  <li>• Items in original packaging</li>
                  <li>• Defective or damaged items</li>
                  <li>• Wrong size or color received</li>
                </ul>
              </div>

              {/* Not Eligible */}
              <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4">
                  ✗ Not Eligible for Returns
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Items after 7 days of delivery</li>
                  <li>• Worn, washed, or altered items</li>
                  <li>• Items without original tags</li>
                  <li>• Items marked as "Final Sale"</li>
                  <li>• Intimate apparel and underwear</li>
                  <li>• Customized or personalized items</li>
                </ul>
              </div>
            </div>

            {/* Exchange Info */}
            <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-xl">
              <div className="flex gap-4">
                <AlertCircle size={24} className="text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Need a Different Size?</h3>
                  <p className="text-muted-foreground mb-4">
                    We don't do direct exchanges. Simply return your item and place a new order 
                    for the size you need. This ensures you get your new item as quickly as possible!
                  </p>
                  <Button asChild>
                    <Link to="/account">Start a Return</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Returns;
