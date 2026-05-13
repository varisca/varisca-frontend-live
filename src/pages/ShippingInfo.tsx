import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, CheckCircle } from 'lucide-react';

const shippingInfo = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On all orders above Rs.999. No hidden fees, no minimum hassle.',
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Standard delivery in 5-7 business days. Express options available.',
  },
  {
    icon: MapPin,
    title: 'Pan-India Coverage',
    description: 'We deliver to all serviceable pincodes across India.',
  },
  {
    icon: Package,
    title: 'Secure Packaging',
    description: 'Every order is carefully packed to ensure it reaches you in perfect condition.',
  },
];

const deliveryTimes = [
  { zone: 'Metro Cities', standard: '3-5 days', express: '1-2 days' },
  { zone: 'Tier 1 Cities', standard: '4-6 days', express: '2-3 days' },
  { zone: 'Tier 2 Cities', standard: '5-7 days', express: '3-4 days' },
  { zone: 'Remote Areas', standard: '7-10 days', express: '4-5 days' },
];

const ShippingInfo = () => {
  return (
    <main className="min-h-screen">
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Shipping Information
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about getting your Varisca order delivered.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {shippingInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-card border border-border rounded-xl text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon size={28} className="text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">
              Estimated Delivery Times
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-6 py-4 text-left font-semibold border border-border">Zone</th>
                    <th className="px-6 py-4 text-left font-semibold border border-border">Standard (Free)</th>
                    <th className="px-6 py-4 text-left font-semibold border border-border">Express (Rs.99)</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryTimes.map((row) => (
                    <tr key={row.zone} className="hover:bg-muted/50">
                      <td className="px-6 py-4 border border-border font-medium">{row.zone}</td>
                      <td className="px-6 py-4 border border-border">{row.standard}</td>
                      <td className="px-6 py-4 border border-border">{row.express}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16 space-y-8">
            <h2 className="text-2xl font-display font-bold mb-6">Shipping Policies</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Order Processing</h3>
                  <p className="text-muted-foreground">
                    Orders placed before 2 PM IST are processed the same day. Orders after 2 PM
                    are processed the next business day. Weekends and holidays may delay processing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Tracking Your Order</h3>
                  <p className="text-muted-foreground">
                    Once shipped, you&apos;ll receive a tracking number via email and SMS. You can
                    track your order in real-time through our website or the courier&apos;s platform.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Delivery Attempts</h3>
                  <p className="text-muted-foreground">
                    Our courier partners will make 3 delivery attempts. If all attempts fail,
                    the package will be returned to us. Please ensure someone is available to receive.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Cash on Delivery</h3>
                  <p className="text-muted-foreground">
                    COD is not available right now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ShippingInfo;
