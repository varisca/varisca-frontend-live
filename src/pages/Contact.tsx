import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: ['varisca.team@gmail.com'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+91 88668 60624', 'Mon-Sat, 9AM-6PM IST'],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Monday - Saturday', '9:00 AM - 6:00 PM IST'],
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Have a question or feedback? We'd love to hear from you. 
              Our team is here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-12 md:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {contactInfo.map((item, index) => (
                <div 
                  key={item.title}
                  className="flex gap-4 p-4 bg-card border border-border rounded-xl"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={22} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.details.map(detail => (
                      <p key={detail} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              {isSubmitted ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <Send size={28} className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="accent" 
                    size="lg" 
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
