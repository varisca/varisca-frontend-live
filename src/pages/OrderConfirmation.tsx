import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { formatPrice } from '@/lib/data';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const stateOrderNumber = location.state?.orderNumber;
  const stateEmail = location.state?.email;
  const queryOrderNumber = searchParams.get('order');
  
  const orderNumber = stateOrderNumber || queryOrderNumber;

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      navigate('/');
      return;
    }

    async function fetchOrder() {
      try {
        const data = await api.get(`/orders/by-number/${orderNumber}`);
        setOrderData(data);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Order fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber, navigate]);

  if (!orderNumber || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-8 h-8" />
      </main>
    );
  }

  const email = orderData?.customer_email || stateEmail || 'your email';

  return (
    <main className="min-h-screen flex items-center justify-center py-16 bg-muted/30">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
            >
              <CheckCircle size={48} className="text-accent" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8"
          >
            Thank you for shopping with Varisca. Your order has been placed successfully and is pending admin payment verification.
          </motion.p>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6 mb-8 text-left"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="text-muted-foreground">Order Number</span>
              <span className="font-mono font-semibold">{orderNumber}</span>
            </div>

            <div className="py-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmation sent to</p>
                  <p className="font-medium truncate max-w-[200px] sm:max-w-full">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Package size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">3-5 Business Days</p>
                </div>
              </div>

              {orderData?.total && (
                <div className="pt-4 border-t border-border mt-4 flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-base">{formatPrice(orderData.total)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                You can track your order status anytime from your account.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="accent" size="lg" asChild>
              <Link to="/shop" className="gap-2 w-full sm:w-auto">
                Continue Shopping
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/account" className="w-full sm:w-auto">View Orders</Link>
            </Button>
          </motion.div>

          {/* Fun Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-sm text-muted-foreground"
          >
            🎉 Get ready to express your Varisca!
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
};

export default OrderConfirmation;
