import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Ruler, Shirt, Users, Droplet, Wind, Sparkles, Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Interactive Size Lookup Data
const PRODUCTS = [
  {
    id: 'oversized-tshirt',
    name: 'Oversized Classic T-Shirt',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    measurements: {
      'XS': { chest: '40', length: '27' },
      'S': { chest: '42', length: '28' },
      'M': { chest: '44', length: '29' },
      'L': { chest: '46', length: '30' },
      'XL': { chest: '48', length: '31' },
      '2XL': { chest: '50', length: '32' }
    }
  },
  {
    id: 'regular-tshirt',
    name: 'Regular Fit T-Shirt',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    measurements: {
      'XS': { chest: '36', length: '26' },
      'S': { chest: '38', length: '27' },
      'M': { chest: '40', length: '28' },
      'L': { chest: '42', length: '29' },
      'XL': { chest: '44', length: '30' },
      '2XL': { chest: '46', length: '31' }
    }
  },
  {
    id: 'hoodie',
    name: 'Premium Hoodie',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    measurements: {
      'S': { chest: '40', length: '26' },
      'M': { chest: '42', length: '27' },
      'L': { chest: '44', length: '28' },
      'XL': { chest: '46', length: '29' },
      '2XL': { chest: '48', length: '30' }
    }
  }
];

const GSM_OPTIONS = [
  {
    range: '160-180 GSM',
    label: 'Light & Airy',
    icon: Wind,
    color: 'from-blue-400 to-cyan-400',
    feel: 'Airy, soft drape',
    bestFor: 'Summer days, layering',
    whyItMatters: 'Breathable drape that moves with you',
    careTip: 'Gentle wash, hang dry 🌿',
    products: [
      { name: 'Tie-Dye Tees', gsm: '180 GSM' }
    ]
  },
  {
    range: '200-220 GSM',
    label: 'Balanced Comfort',
    icon: Shirt,
    color: 'from-purple-400 to-pink-400',
    feel: 'Balanced, versatile',
    bestFor: 'Everyday wear, all seasons',
    whyItMatters: 'Structured enough to hold shape, soft for all-day comfort',
    careTip: 'Machine wash cold, tumble dry low 👍',
    products: [
      { name: 'Tie-Dye Tees', gsm: '280 GSM' }
    ]
  },
  {
    range: '240+ GSM',
    label: 'Premium Daily',
    icon: Sparkles,
    color: 'from-teal-400 to-green-400',
    feel: 'Structured, substantial',
    bestFor: 'Premium daily wear',
    whyItMatters: 'Holds shape beautifully, lasts longer, feels luxurious',
    careTip: 'Cold wash, reshape while damp ✨',
    products: [
      { name: 'Tees & Hoodies', gsm: '240 GSM' }
    ]
  },
  {
    range: '260 GSM',
    label: 'Tie-Dye Pick',
    icon: Droplet,
    color: 'from-pink-400 to-rose-400',
    feel: 'Heavyweight, thicc',
    bestFor: 'Streetwear statements',
    whyItMatters: 'Absorbs dye beautifully, premium hand-feel',
    careTip: 'Inside out, cold water, air dry 🌸',
    products: [
      { name: 'Tie-Dye Tees', gsm: '260 GSM' }
    ]
  }
];

const SIZE_CHARTS = {
  tshirts: {
    title: 'T-Shirts & Tees',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    measurements: [
      { label: 'Chest (inches)', values: ['36-38', '38-40', '40-42', '42-44', '44-46'] },
      { label: 'Length (inches)', values: ['27', '28', '29', '30', '31'] },
      { label: 'Shoulder (inches)', values: ['16', '17', '18', '19', '20'] },
      { label: 'Sleeve (inches)', values: ['8', '8.5', '9', '9.5', '10'] }
    ]
  },
  hoodies: {
    title: 'Hoodies & Sweatshirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    measurements: [
      { label: 'Chest (inches)', values: ['38-40', '40-42', '42-44', '44-46', '46-48'] },
      { label: 'Length (inches)', values: ['26', '27', '28', '29', '30'] },
      { label: 'Shoulder (inches)', values: ['17', '18', '19', '20', '21'] },
      { label: 'Sleeve (inches)', values: ['24', '25', '26', '27', '28'] }
    ]
  },
  bottoms: {
    title: 'Bottoms & Joggers',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    measurements: [
      { label: 'Waist (inches)', values: ['28-30', '30-32', '32-34', '34-36', '36-38'] },
      { label: 'Hip (inches)', values: ['36-38', '38-40', '40-42', '42-44', '44-46'] },
      { label: 'Inseam (inches)', values: ['28', '29', '30', '31', '32'] },
      { label: 'Rise (inches)', values: ['10', '10.5', '11', '11.5', '12'] }
    ]
  }
};

const SizeGuide = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<keyof typeof SIZE_CHARTS>('tshirts');
  const [activeGSM, setActiveGSM] = useState(1); // 200-220 GSM as default
  
  // Interactive lookup state
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [selectedSize, setSelectedSize] = useState(2); // M as default
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  const currentProduct = PRODUCTS[selectedProduct];
  const currentMeasurements = currentProduct.measurements[currentProduct.sizes[selectedSize]];

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <div className="bg-muted/50 py-8 sm:py-12">
        <div className="container-custom">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Ruler className="text-accent" size={24} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold">Size Guide</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Find your perfect fit with our comprehensive sizing charts and fabric guide
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8 sm:py-12">
        {/* Interactive Size Lookup Tool */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">
              Size Guide
              {/* Size Guide (no PhD required) */}

            </h2>
            <p className="text-sm text-muted-foreground">
              {/* All measurements in inches. We measured twice. 📏 */}
              All measurements in inches.

            </p>
          </div>

          {/* Product Selector */}
          <div className="relative mb-6">
            <button
              onClick={() => setShowProductDropdown(!showProductDropdown)}
              className="w-full bg-foreground text-background rounded-xl px-6 py-4 flex items-center justify-between hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <Shirt size={20} />
                <div className="text-left">
                  <div className="font-semibold">{currentProduct.name}</div>
                  <div className="text-xs opacity-70">
                    Sizes: {currentProduct.sizes[0]} - {currentProduct.sizes[currentProduct.sizes.length - 1]}
                  </div>
                </div>
              </div>
              <ChevronDown size={20} className={cn("transition-transform", showProductDropdown && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {showProductDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden"
              >
                {PRODUCTS.map((product, idx) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(idx);
                      setSelectedSize(Math.min(selectedSize, product.sizes.length - 1));
                      setShowProductDropdown(false);
                    }}
                    className={cn(
                      "w-full px-6 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3",
                      idx === selectedProduct && "bg-muted"
                    )}
                  >
                    <Shirt size={18} />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.sizes[0]} - {product.sizes[product.sizes.length - 1]}
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Size Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {currentProduct.sizes.map((size, idx) => (
              <button
                key={size}
                onClick={() => setSelectedSize(idx)}
                className={cn(
                  "px-6 py-3 rounded-xl font-semibold transition-all min-w-[60px]",
                  idx === selectedSize
                    ? "bg-foreground text-background shadow-lg scale-105"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Measurement Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              key={`chest-${selectedSize}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-muted/30 border border-border rounded-xl p-6 text-center"
            >
              <Ruler size={24} className="mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">CHEST</div>
              <div className="text-4xl font-bold">{currentMeasurements?.chest}"</div>
            </motion.div>

            <motion.div
              key={`length-${selectedSize}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-muted/30 border border-border rounded-xl p-6 text-center"
            >
              <Shirt size={24} className="mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">LENGTH</div>
              <div className="text-4xl font-bold">{currentMeasurements?.length}"</div>
            </motion.div>
          </div>

          {/* Tips */}
          {/* <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <span>👕</span>
              <span>Oversized? Go true to size</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>📏</span>
              <span>Between sizes? Size up</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>📐</span>
              <span>Tolerance: ±1 inch</span>
            </div>
          </div> */}

          {/* <p className="text-center text-xs text-muted-foreground italic">
            Still confused? DM us. We're literally just vibing and ready to help 💬
          </p> */}
        </motion.div>

        {/* Size Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">Size Charts</h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(SIZE_CHARTS).map(([key, chart]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as keyof typeof SIZE_CHARTS)}
                className={cn(
                  "px-4 py-2.5 rounded-lg font-medium transition-all",
                  activeCategory === key
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {chart.title}
              </button>
            ))}
          </div>

          {/* Size Chart Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold">Measurement</th>
                    {SIZE_CHARTS[activeCategory].sizes.map((size) => (
                      <th key={size} className="px-4 py-4 text-center font-semibold">{size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHARTS[activeCategory].measurements.map((measurement, idx) => (
                    <tr key={measurement.label} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                      <td className="px-4 py-3 font-medium">{measurement.label}</td>
                      {measurement.values.map((value, vIdx) => (
                        <td key={vIdx} className="px-4 py-3 text-center">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* How to Measure Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">How to Measure</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Shirt className="text-accent" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Chest</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape horizontal
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Ruler className="text-accent" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Length</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure from the highest point of the shoulder to the hem
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Users className="text-accent" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shoulder</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure from shoulder seam to shoulder seam across the back
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Ruler className="text-accent" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sleeve</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure from the center of the back neck to the end of the shoulder, down to the wrist
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GSM Explained Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
              GSM, explained like a friend.
            </h2>
            <p className="text-muted-foreground">
              Higher GSM = more structure, not just "heavier" ⚡
            </p>
          </div>

          {/* GSM Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {GSM_OPTIONS.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGSM(idx)}
                className={cn(
                  "relative px-6 py-3 rounded-xl font-medium transition-all",
                  activeGSM === idx
                    ? "bg-foreground text-background shadow-xl scale-105"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold">{option.range}</span>
                  <span className="text-xs opacity-80">{option.label}</span>
                </div>
                {activeGSM === idx && (
                  <div className={cn("absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center", option.color)}>
                    <option.icon size={14} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Weight Indicator */}
          <div className="flex justify-center items-center gap-2 mb-8">
            <span className="text-sm text-muted-foreground">Weight:</span>
            <div className="flex gap-1">
              {GSM_OPTIONS.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-12 h-1 rounded-full transition-all",
                    idx <= activeGSM ? "bg-foreground" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* GSM Details */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3 mb-2">
                <Droplet size={18} className="text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-orange-600 dark:text-orange-400 mb-1">FEEL</p>
                  <p className="font-medium">{GSM_OPTIONS[activeGSM].feel}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-2">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-blue-600 dark:text-blue-400 mb-1">BEST FOR</p>
                  <p className="font-medium">{GSM_OPTIONS[activeGSM].bestFor}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3 mb-2">
                <Shirt size={18} className="text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-purple-600 dark:text-purple-400 mb-1">WHY IT MATTERS</p>
                  <p className="font-medium">{GSM_OPTIONS[activeGSM].whyItMatters}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3 mb-2">
                <Wind size={18} className="text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-green-600 dark:text-green-400 mb-1">CARE TIP</p>
                  <p className="font-medium">{GSM_OPTIONS[activeGSM].careTip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* What We Use */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wide font-semibold">
              WHAT WE USE AT VARISCA
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {GSM_OPTIONS[activeGSM].products.map((product, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950/30 dark:to-purple-950/30 border border-pink-200 dark:border-pink-800"
                >
                  <div className="flex items-center gap-2">
                    <Shirt size={16} className="text-pink-600 dark:text-pink-400" />
                    <span className="font-medium text-sm">{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.gsm}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Check size={16} className="text-green-600" />
            <span>Checked twice. We don't trust machines alone.</span>
          </div> */}
        </motion.div>

        {/* Fit Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">Fit Tips</h2>
          <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20 p-6 sm:p-8">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check size={20} className="text-accent mt-0.5 flex-shrink-0" />
                <p><strong>Between sizes?</strong> Size up for a relaxed fit, size down for a fitted look</p>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-accent mt-0.5 flex-shrink-0" />
                <p><strong>Oversized fit:</strong> Go 1-2 sizes up from your regular size</p>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-accent mt-0.5 flex-shrink-0" />
                <p><strong>Pre-shrunk:</strong> All our garments are pre-shrunk, minimal shrinkage expected</p>
              </li>
              <li className="flex items-start gap-3">
                <Check size={20} className="text-accent mt-0.5 flex-shrink-0" />
                <p><strong>Still unsure?</strong> Reach out to our team - we're here to help you find the perfect fit!</p>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default SizeGuide;
