import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, Award, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion for Fashion',
    description: 'We pour our heart into every design, ensuring each piece tells a unique story.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Practices',
    description: 'Committed to eco-friendly materials and ethical manufacturing processes.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the finest fabrics and craftsmanship make it into our collections.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Building a community of bold individuals who express themselves fearlessly.',
  },
];

const About = () => {
  useEffect(() => {
    document.title = "About Us | Varisca";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Learn about Varisca's journey, our commitment to quality, and our vision for the future of fashion.");
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-muted/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Express yourself with premium wear that speaks your language. Quality fashion for the bold and expressive.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mt-4 font-medium">
              Mastered in the Mill. Tailored for You.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Varisca */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 max-w-4xl"
          >
            <span className="text-accent font-semibold uppercase tracking-wider">About Varisca</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Where Textile Mastery Meets Modern Style
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Varisca is a fashion brand built on the foundation of Anugraha Textile, a textile manufacturing
              company established in 2022 with deep expertise in dyeing and fabric printing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For years, we perfected the science of creating vibrant fabrics, mastering color, texture, and durability
              at the very source of textile production. But we believed our craftsmanship deserved to be experienced
              beyond the factory floor. That vision led to the creation of Varisca.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Launched in 2026, Varisca transforms our premium fabrics into thoughtfully designed garments that
              combine technical excellence with contemporary fashion. Unlike most fashion brands that simply source
              their fabrics, we create our own, giving us complete control over quality, color, and comfort.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From the first drop of dye to the final stitch, every Varisca piece reflects our commitment to
              precision, authenticity, and timeless style.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold mb-2">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To redefine modern fashion by bringing together textile innovation, vibrant color, and contemporary
                  design, creating garments that feel as exceptional as they look. We envision a world where fashion
                  begins at the fabric itself, crafted with care, expertise, and purpose.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-display font-bold mb-2">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is to deliver factory-direct fashion that offers superior quality, lasting comfort, and
                  distinctive design. By combining the technical mastery of textile manufacturing with creative design,
                  we create clothing that is vibrant in color, exceptional in quality, comfortable for everyday life,
                  and designed for the modern individual.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every Varisca garment is made to be worn, loved, and remembered.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-display font-bold mb-2">Why Choose Varisca?</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>Complete Control Over Fabric:</strong> Because we own the dyeing and printing process, we
                    control every stage of production—ensuring superior fabric quality and long-lasting color vibrancy.
                  </li>
                  <li>
                    <strong>True Color Expertise:</strong> Our roots in textile processing allow us to produce deeper,
                    richer colors that maintain their brilliance even after repeated wear and washing.
                  </li>
                  <li>
                    <strong>Designed from the Source:</strong> Most brands start with fabric suppliers. We start with
                    the fabric itself, designing garments around materials we create and perfect.
                  </li>
                  <li>
                    <strong>Modern Style, Built on Craft:</strong> Varisca blends industrial-grade durability with
                    contemporary silhouettes designed for today’s wardrobe.
                  </li>
                  <li>
                    <strong>Quality Without Compromise:</strong> Every garment reflects the same rigorous standards that
                    define Anugraha Textile’s manufacturing heritage.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What We Stand For
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our values guide everything we do, from design to delivery.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <value.icon size={28} className="text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Join the Movement
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              We're more than a brand – we're a community of creators, dreamers, 
              and rule-breakers. Welcome to Varisca.
            </p>

          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default About;
