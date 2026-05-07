import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqCategories = [
  { id: 'orders', name: 'Orders & Shipping' },
  { id: 'returns', name: 'Returns & Exchanges' },
  { id: 'products', name: 'Products' },
  { id: 'payment', name: 'Payment' },
  { id: 'account', name: 'Account' },
];

const faqs = [
  {
    category: 'orders',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days within India. Express shipping is available for 2-3 business days delivery. Metro cities may receive orders faster.',
  },
  {
    category: 'orders',
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can also track your order from your Account page under "My Orders".',
  },
  {
    category: 'orders',
    question: 'Do you ship internationally?',
    answer: 'Currently, we only ship within India. International shipping is coming soon! Subscribe to our newsletter to be notified when we launch.',
  },
  {
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day hassle-free return policy. Items must be unworn, unwashed, and in original condition with tags attached. Simply initiate a return from your account.',
  },
  {
    category: 'returns',
    question: 'How do I exchange an item?',
    answer: 'To exchange, first return your item and place a new order for the size/color you need. This ensures you get your new item as quickly as possible.',
  },
  {
    category: 'returns',
    question: 'When will I receive my refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive your return. The amount will be credited to your original payment method.',
  },
  {
    category: 'products',
    question: 'How do I find my size?',
    answer: 'Check our detailed Size Guide for measurements. Most of our oversized pieces are meant to fit loose. When in doubt, we recommend sizing down for a regular fit.',
  },
  {
    category: 'products',
    question: 'Are your products sustainable?',
    answer: 'We\'re committed to sustainability. We use organic cotton, recycled packaging, and partner with ethical manufacturers. We\'re constantly improving our practices.',
  },
  {
    category: 'products',
    question: 'How should I care for my clothes?',
    answer: 'Machine wash cold, inside out, with like colors. Tumble dry low or hang dry. Do not bleach or dry clean. Detailed care instructions are on each product label.',
  },
  {
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe. Cash on Delivery is also available.',
  },
  {
    category: 'payment',
    question: 'Is it safe to pay online?',
    answer: 'Absolutely! We use industry-standard SSL encryption and partner with trusted payment gateways. Your payment information is never stored on our servers.',
  },
  {
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot password?" on the login page, enter your email, and we\'ll send you a reset link. The link expires in 24 hours for security.',
  },
  {
    category: 'account',
    question: 'Can I delete my account?',
    answer: 'Yes, you can request account deletion by contacting our support team. Note that this will permanently delete your order history and saved information.',
  },
];

const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState('orders');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchQuery !== '' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Find answers to common questions about orders, shipping, returns, and more.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-custom">
          {/* Category Pills */}
          {!searchQuery && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {faqCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setOpenItems([]);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Items */}
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={cn(
                      "flex-shrink-0 transition-transform",
                      openItems.includes(index) && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-muted-foreground">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No matching questions found.</p>
              </div>
            )}
          </div>

          {/* Still Need Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <a 
              href="/contact"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              Contact our support team →
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default FAQ;
