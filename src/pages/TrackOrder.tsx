import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - would integrate with order tracking API
  };

  return (
    <main className="min-h-screen pb-16">
      <div className="container-custom py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <Package size={32} className="text-accent" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order ID and email to check delivery status
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. VAR-12345"
                className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email used for order"
                className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              <Search size={20} />
              Track Order
            </Button>
          </form>
        </motion.div>
      </div>
    </main>
  );
};

export default TrackOrder;
