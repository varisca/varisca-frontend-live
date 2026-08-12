import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Check, MapPin, Plus, Minus, X, Home, Printer, Palette, Ruler, Shirt as ShirtIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAddress } from '@/context/AddressContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { addCustomOrder } from '@/lib/customOrderStore';
import { submitCustomOrderToApi } from '@/lib/customOrderApi';
import {
  FALLBACK_CUSTOM_ORDER_PRODUCT_TYPES,
  getCustomOrderProductTypes,
  type CustomOrderProductType,
} from '@/lib/customOrderProductTypes';

interface ProductTypeOption {
  id: string;
  name: string;
  image: string;
  basePrice: number;
  originalPrice: number;
}

interface ProductVarietyOption {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
}

// Product Varieties
const PRODUCT_VARIETIES: Record<string, ProductVarietyOption[]> = {
  tees: [
    { id: 'premium', name: 'Premium Cotton', price: 499, originalPrice: 749, discount: 33, image: '/images/mens_white_tee_lifestyle_1770113127002.png' },
    { id: 'oversized', name: 'Street Oversized', price: 599, originalPrice: 899, discount: 33, image: '/images/black_oversized_tee_street_style_1770113164208.png' },
    { id: 'graphic', name: 'Graphic', price: 549, originalPrice: 999, discount: 45, image: '/images/womens_graphic_tee_lifestyle_1770113146661.png' }
  ],
  'long-sleeve': [
    { id: 'classic', name: 'Classic Fit', price: 799, originalPrice: 1199, discount: 33, image: '/images/long_sleeve_tshirt_1770113309403.png' }
  ],
  long_sleeve: [
    { id: 'classic', name: 'Classic Fit', price: 799, originalPrice: 1199, discount: 33, image: '/images/long_sleeve_tshirt_1770113309403.png' }
  ],
  'v-neck': [
    { id: 'classic_v', name: 'Classic V-Neck', price: 699, originalPrice: 999, discount: 30, image: '/images/v_neck_tshirt_1770113330903.png' }
  ],
  v_neck: [
    { id: 'classic_v', name: 'Classic V-Neck', price: 699, originalPrice: 999, discount: 30, image: '/images/v_neck_tshirt_1770113330903.png' }
  ]
};

function mapProductType(type: CustomOrderProductType): ProductTypeOption {
  return {
    id: type.slug,
    name: type.name,
    image: type.image || '/images/mens_white_tee_lifestyle_1770113127002.png',
    basePrice: type.base_price,
    originalPrice: type.original_price,
  };
}

function discountPercent(price: number, originalPrice: number): number {
  if (originalPrice <= price || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

// Print Types
const PRINT_TYPES = [
  { id: 'dtf', name: 'DTF', description: 'Direct to Film' },
  { id: 'screen', name: 'Screen', description: 'Screen Print' }
];

// Print Positions
const PRINT_POSITIONS = [
  { id: 'front', name: 'Front', maxSize: '9" x 6"', price: 349, image: '/images/custom-order/print-front.png' },
  { id: 'back', name: 'Back', maxSize: '9" x 6"', price: 349, image: '/images/custom-order/print-back.png' },
  { id: 'left-pocket', name: 'Left Pocket', maxSize: '4" x 4"', price: 149, image: '/images/custom-order/print-left-pocket.png' },
  { id: 'right-pocket', name: 'Right Pocket', maxSize: '4" x 4"', price: 149, image: '/images/custom-order/print-right-pocket.png' }
];

// Colors
const COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'jade', name: 'Jade', hex: '#00D9A3' },
  { id: 'pink', name: 'Light Baby Pink', hex: '#FFB6C1' },
  { id: 'lavender', name: 'Lavender', hex: '#9B7EDE' },
  { id: 'off-white', name: 'Off White', hex: '#F5F5DC' }
];

// Sizes
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const SIZE_CHART = [
  { size: 'S', chest: '38"', length: '26"' },
  { size: 'M', chest: '40"', length: '27"' },
  { size: 'L', chest: '42"', length: '28"' },
  { size: 'XL', chest: '44"', length: '29"' },
  { size: 'XXL', chest: '46"', length: '30"' },
];

const STEPS = [
  { id: 1, name: 'Product Type', icon: ShirtIcon },
  { id: 2, name: 'Variety', icon: Palette },
  { id: 3, name: 'Print Type', icon: Printer },
  { id: 4, name: 'Print Position', icon: MapPin },
  { id: 5, name: 'Color', icon: Palette },
  { id: 6, name: 'Size', icon: Ruler }
];

const CustomOrder = () => {
  const navigate = useNavigate();
  const { addresses, addAddress, selectedAddressId, selectAddress, getSelectedAddress } = useAddress();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>(
    FALLBACK_CUSTOM_ORDER_PRODUCT_TYPES.map(mapProductType)
  );

  const DRAFT_KEY = 'Varisca_custom_order_draft_v1';
  const WHATSAPP_NUMBER = '8866860624';

  // Order state
  const [order, setOrder] = useState({
    productType: '',
    variety: '',
    printType: '',
    printPositions: [] as string[],
    color: '',
    sizeQuantities: {} as Record<string, number>,
    notes: ''
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Policy section state
  const [showPolicySection, setShowPolicySection] = useState(false);

  useEffect(() => {
    let alive = true;
    getCustomOrderProductTypes()
      .then((types) => {
        if (!alive || types.length === 0) return;
        setProductTypes(types.map(mapProductType));
      })
      .catch(() => {
        // Keep fallback product types if the API is unavailable.
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentStep]);

  // Draft persistence (save if customer started selecting)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.order) setOrder(parsed.order);
      if (typeof parsed?.currentStep === 'number') setCurrentStep(parsed.currentStep);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasDraft =
      !!order.productType ||
      !!order.variety ||
      !!order.printType ||
      order.printPositions.length > 0 ||
      !!order.color ||
      Object.keys(order.sizeQuantities).length > 0 ||
      !!order.notes;

    try {
      if (!hasDraft) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ currentStep, order, updatedAt: Date.now() })
      );
    } catch {
      // ignore storage errors
    }
  }, [currentStep, order, DRAFT_KEY]);

  const selectedProductType = productTypes.find(p => p.id === order.productType);
  const currentVarieties = useMemo(() => {
    if (!selectedProductType) return [];
    const configured = PRODUCT_VARIETIES[selectedProductType.id];
    if (configured?.length) return configured;
    return [
      {
        id: 'standard',
        name: selectedProductType.name,
        price: selectedProductType.basePrice,
        originalPrice: selectedProductType.originalPrice,
        discount: discountPercent(selectedProductType.basePrice, selectedProductType.originalPrice),
        image: selectedProductType.image,
      },
    ];
  }, [selectedProductType]);
  const selectedVariety = currentVarieties.find(v => v.id === order.variety) || null;
  const selectedPrintType = PRINT_TYPES.find(p => p.id === order.printType);
  const selectedColor = COLORS.find(c => c.id === order.color);
  const selectedAddress = getSelectedAddress();

  // Calculate pricing
  const basePrice = selectedVariety?.price || 0;
  const printPositionPrice = selectedPrintType?.id === 'dtf'
    ? 0
    : order.printPositions.reduce((total, pos) => {
        const position = PRINT_POSITIONS.find(p => p.id === pos);
        return total + (position?.price || 0);
      }, 0);
  const shipping = 99;
  const unitPrice = basePrice + printPositionPrice;
  const totalQuantity = useMemo(
    () => Object.values(order.sizeQuantities).reduce((sum, q) => sum + (q || 0), 0),
    [order.sizeQuantities]
  );
  const itemsTotal = unitPrice * totalQuantity;
  const total = itemsTotal + shipping;

  const sizeSummary = useMemo(() => {
    if (totalQuantity <= 0) return '-';
    return Object.entries(order.sizeQuantities)
      .map(([size, qty]) => `${size}(${qty})`)
      .join(', ');
  }, [order.sizeQuantities, totalQuantity]);

  const whatsappMessage = useMemo(() => {
    const lines = Object.entries(order.sizeQuantities)
      .filter(([, q]) => (q || 0) > 0)
      .map(([size, qty]) => `- ${size} (${qty})`);

    return [
      "I want to complete my custom order",
      "",
      "Order summary:",
      `Product Type: ${selectedProductType?.name || "-"}`,
      `Variety: ${selectedVariety?.name || "-"}`,
      `Print Type: ${selectedPrintType?.name || "-"}`,
      `Print Positions: ${order.printPositions.length > 0 ? order.printPositions.map(p => PRINT_POSITIONS.find(pos => pos.id === p)?.name).filter(Boolean).join(", ") : "-"}`,
      `Color: ${selectedColor?.name || "-"}`,
      `Sizes: ${sizeSummary}`,
      "",
      "Quantity by size:",
      ...(lines.length ? lines : ["-"]),
      "",
      `Unit price: ₹${unitPrice.toFixed(2)}`,
      `Items total: ₹${itemsTotal.toFixed(2)}`,
      `Shipping: ₹${shipping.toFixed(2)}`,
      `Estimated total: ₹${total.toFixed(2)}`,
      order.notes ? "" : "",
      order.notes ? `Notes: ${order.notes}` : "",
      "",
      "Share Your Design: The Final Step!",
      "✅ Image Quality: High resolution for sharper color",
      "📁 File Format: PNG with transparent background preferred (SVG, EPS, AI work great too)",
      "🎨 Design Dimensions: Share exact cm dimensions for the design via WhatsApp",
      "✅ Proof Approval: We'll send a proof image for your approval before printing",
      "📝 Modifications: Feel free to request edits or changes",
    ]
      .filter(Boolean)
      .join("\n");
  }, [
    itemsTotal,
    order.notes,
    order.printPositions,
    order.sizeQuantities,
    selectedColor?.name,
    selectedPrintType?.name,
    selectedProductType?.name,
    selectedVariety?.name,
    sizeSummary,
    total,
    unitPrice,
  ]);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Before showing address modal, ensure customer is logged in
      if (!isAuthenticated) {
        navigate('/login', { state: { from: { pathname: '/custom-order' } } });
        return;
      }
      // Show shipping address modal
      setShowAddressModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddAddress = () => {
    addAddress({
      name: addressForm.name,
      phone: addressForm.phone,
      address: addressForm.address,
      city: addressForm.city,
      state: addressForm.state,
      pincode: addressForm.pincode,
      type: 'home',
      isDefault: addresses.length === 0
    });
    setAddressForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
    setShowAddressForm(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return order.productType !== '';
      case 2: return order.variety !== '';
      case 3: return order.printType !== '';
      case 4: return order.printPositions.length > 0;
      case 5: return order.color !== '';
      case 6: return totalQuantity > 0;
      default: return false;
    }
  };

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-xl sm:text-2xl font-display font-bold">Custom Order</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>

          {/* Progress Stepper */}
          <div className="mt-6 flex items-center justify-center sm:justify-between max-w-4xl mx-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all",
                        isCompleted ? "bg-green-500 text-white" :
                        isCurrent ? "bg-foreground text-background" :
                        "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 hidden sm:block",
                      isCurrent ? "font-semibold" : "text-muted-foreground"
                    )}>
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      // Align the connector to the circle center (not the label baseline)
                      "flex-1 h-1 mx-2 mt-5 sm:mt-6 self-start",
                      currentStep > step.id ? "bg-green-500" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 sm:hidden">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "h-9 min-w-20 rounded-md px-3 text-xs",
                currentStep === 1 && "opacity-0 pointer-events-none"
              )}
            >
              <ArrowLeft size={15} className="mr-0.5" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="h-9 min-w-20 rounded-md px-3 text-xs"
            >
              {currentStep === 6 ? 'Continue' : 'Next'}
              <ChevronRight size={15} className="ml-0.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Product Type */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-2">Select Your Product Type</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
                    {productTypes.map(product => (
                      <button
                        key={product.id}
                        onClick={() => setOrder({ ...order, productType: product.id, variety: '' })}
                        className={cn(
                          "group relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all sm:rounded-xl",
                          order.productType === product.id ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        {order.productType === product.id && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Check size={18} className="text-primary-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                          <h3 className="text-sm font-semibold leading-tight text-white sm:text-lg">{product.name}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Product Variety */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-2">Select Product Variety</h2>
                  <p className="text-muted-foreground mb-6">{selectedProductType?.name}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
                    {currentVarieties.map(variety => (
                      <button
                        key={variety.id}
                        onClick={() => setOrder({ ...order, variety: variety.id })}
                        className={cn(
                          "group relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all sm:rounded-xl",
                          order.variety === variety.id ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                        <img src={variety.image} alt={variety.name} className="w-full h-full object-cover" />
                        {order.variety === variety.id && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Check size={18} className="text-primary-foreground" />
                          </div>
                        )}
                        {variety.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-accent text-white text-xs px-2 py-1 rounded font-bold">
                            {variety.discount}% OFF
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                          <h3 className="mb-1 text-sm font-semibold leading-tight text-white sm:text-lg">{variety.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-white font-bold">₹{variety.price}</span>
                            <span className="text-white/70 line-through text-sm">₹{variety.originalPrice}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Print Type */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-2">Select Print Type</h2>
                  <p className="text-muted-foreground mb-6">
                    Choose your preferred printing method for {selectedVariety?.name}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
                    {PRINT_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setOrder({ ...order, printType: type.id })}
                        className={cn(
                          "relative rounded-lg border-2 p-4 text-center transition-all sm:rounded-xl sm:p-6 md:p-8",
                          order.printType === type.id ? "border-primary bg-primary/5 ring-4 ring-primary/20" : "border-border hover:border-primary/50"
                        )}
                      >
                        {order.printType === type.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check size={14} className="text-primary-foreground" />
                          </div>
                        )}
                        <Printer className="mx-auto mb-3 h-8 w-8 text-muted-foreground sm:mb-4 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                        <h3 className="mb-1 text-base font-bold sm:text-lg md:text-xl">{type.name}</h3>
                        <p className="text-xs text-muted-foreground sm:text-sm">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Print Positions */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Select Print Positions</h2>
                  <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm mb-2">
                    {selectedPrintType?.name} Printing
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Choose positions for your {selectedPrintType?.name.toLowerCase()} prints
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {PRINT_POSITIONS.map(position => {
                      const isSelected = order.printPositions.includes(position.id);
                      return (
                        <button
                          key={position.id}
                          onClick={() => {
                            setOrder({
                              ...order,
                              printPositions: isSelected
                                ? order.printPositions.filter(p => p !== position.id)
                                : [...order.printPositions, position.id]
                            });
                          }}
                          className={cn(
                            "relative rounded-lg border-2 p-3 transition-all sm:rounded-xl sm:p-5 md:p-6",
                            isSelected ? "border-primary bg-primary/5 ring-4 ring-primary/20" : "border-border hover:border-primary/50"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check size={14} className="text-primary-foreground" />
                            </div>
                          )}
                          <div className="mx-auto mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-white sm:mb-4 sm:rounded-xl">
                            <img src={position.image} alt={position.name} className="h-full w-full object-contain p-2 sm:p-3" />
                          </div>
                          <h3 className="mb-1 text-sm font-bold leading-tight sm:text-base md:text-lg">{position.name}</h3>
                          <p className="mb-2 text-xs text-muted-foreground sm:text-sm">Max: {position.maxSize}</p>
                          {selectedPrintType?.id !== 'dtf' && (
                            <p className="text-accent font-semibold">+₹{position.price} ({selectedPrintType?.name})</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Color */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Choose Your Color</h2>
                  <p className="text-muted-foreground mb-6">
                    {selectedVariety?.name} • {COLORS.length} colors available
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
                    {COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setOrder({ ...order, color: color.id })}
                        className={cn(
                          "relative rounded-lg border-2 p-4 transition-all sm:rounded-xl sm:p-5 md:p-6",
                          order.color === color.id ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-primary/50"
                        )}
                      >
                        {order.color === color.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check size={14} className="text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className="mx-auto mb-3 h-14 w-14 rounded-full border-2 sm:mb-4 sm:h-16 sm:w-16 md:h-20 md:w-20"
                          style={{ backgroundColor: color.hex, borderColor: color.hex === '#FFFFFF' ? '#e5e5e5' : color.hex }}
                        />
                        <h3 className="text-center text-sm font-semibold leading-tight sm:text-base">{color.name}</h3>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 6: Size */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">Select Your Size</h2>
                      <p className="text-muted-foreground">
                        {selectedVariety?.name} • {selectedColor?.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSizeChart(true)}
                      className="text-accent hover:underline flex items-center gap-2"
                    >
                      <Ruler size={16} />
                      Size Chart
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {SIZES.map((size) => {
                      const qty = order.sizeQuantities[size] || 0;
                      return (
                        <div
                          key={size}
                          className={cn(
                            "p-4 rounded-xl border transition-colors",
                            qty > 0 ? "border-primary bg-primary/5" : "border-border bg-background"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-bold text-lg">{size}</div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setOrder((prev) => {
                                    const nextQty = Math.max(0, (prev.sizeQuantities[size] || 0) - 1);
                                    const next = { ...prev.sizeQuantities };
                                    if (nextQty === 0) delete next[size];
                                    else next[size] = nextQty;
                                    return { ...prev, sizeQuantities: next };
                                  });
                                }}
                                disabled={qty === 0}
                                className={cn(
                                  "w-9 h-9 rounded-lg border flex items-center justify-center transition-colors",
                                  qty === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                                )}
                                aria-label={`Decrease ${size} quantity`}
                              >
                                <Minus size={16} />
                              </button>
                              <div className="w-10 text-center font-semibold">{qty}</div>
                              <button
                                type="button"
                                onClick={() => {
                                  setOrder((prev) => ({
                                    ...prev,
                                    sizeQuantities: {
                                      ...prev.sizeQuantities,
                                      [size]: (prev.sizeQuantities[size] || 0) + 1,
                                    },
                                  }));
                                }}
                                className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label={`Increase ${size} quantity`}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-sm text-muted-foreground mb-8">
                    Total quantity: <span className="font-semibold text-foreground">{totalQuantity}</span>
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-8">
                    <label className="block font-medium mb-3">Additional Notes (Optional)</label>
                    <textarea
                      value={order.notes}
                      onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                      placeholder="Any specific requirements, design details, or questions..."
                      className="w-full h-24 px-4 py-3 bg-muted border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Design Sharing Info */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎨</span> Share Your Design: The Final Step!
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✅</span>
                        <span><strong>Image Quality:</strong> High resolution for sharper color</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">📁</span>
                        <span><strong>File Format:</strong> PNG with transparent background preferred (SVG, EPS, AI work great too)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">🎨</span>
                        <span><strong>Design Dimensions:</strong> Share exact Ccm dimensions for the design via WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✅</span>
                        <span><strong>Proof Approval:</strong> We'll send a proof image for your approval before printing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">📝</span>
                        <span><strong>Modifications:</strong> Feel free to request edits or changes</span>
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                      <strong>After placing:</strong> Confirm to WhatsApp - share your design file with us to complete your order
                    </p>
                  </div>

                  {/* Return & Exchange Policy Dropdown */}
                  <div className="mt-6 border rounded-xl overflow-hidden bg-background">
                    <button
                      onClick={() => setShowPolicySection(!showPolicySection)}
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600">
                          <Check size={16} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-sm">Return & Exchange Policy</h3>
                          <p className="text-xs text-muted-foreground">Important information - Please review</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className={cn("transition-transform duration-200", showPolicySection ? "rotate-90" : "")} />
                    </button>
                    
                    {showPolicySection && (
                      <div className="p-4 border-t bg-background">
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span><strong className="text-red-600">All sales are final.</strong> We do not accept returns or exchanges once an order has been placed.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span><strong className="text-red-600">Size changes are not allowed.</strong> Customers are requested to check the size chart carefully before ordering.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span><strong className="text-red-600">Order cancellations are not permitted</strong> once the order has been processed or dispatched.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>We do not offer refunds under any circumstances for incorrect size selection, change of mind, or personal preference.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>By placing an order on our website or through our platform, you agree to this policy in full.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">•</span>
                            <span><strong className="text-orange-600">VARISCA CLOTHING</strong> reserves the right to refuse any return, exchange, or cancellation request that does not comply with this policy.</span>
                          </li>
                        </ul>
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900">
                          <strong>Important:</strong> Please review the size chart and ensure all details are correct before proceeding with your order.
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="hidden sm:flex items-center justify-between mt-8">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1}
                size="lg"
                className={cn(
                  "min-w-[120px]",
                  currentStep === 1 && "opacity-0 pointer-events-none"
                )}
              >
                <ArrowLeft size={18} className="mr-1" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
                className="min-w-[120px]"
              >
                {currentStep === 6 ? 'Continue to Order' : 'Next'}
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-muted/30 border border-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Type:</span>
                  <span className="font-medium">{selectedProductType?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variety:</span>
                  <span className="font-medium">{selectedVariety?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Print Type:</span>
                  <span className="font-medium">
                    {selectedPrintType ? (
                      <span className="inline-block px-2 py-0.5 bg-accent text-white rounded text-xs">
                        {selectedPrintType.name}
                      </span>
                    ) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Positions:</span>
                  <span className="font-medium">
                    {order.printPositions.length > 0 ? (
                      <span className="text-xs">{order.printPositions.map(p => 
                        PRINT_POSITIONS.find(pos => pos.id === p)?.name
                      ).join(', ')}</span>
                    ) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium flex items-center gap-2">
                    {selectedColor ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: selectedColor.hex, borderColor: selectedColor.hex === '#FFFFFF' ? '#e5e5e5' : selectedColor.hex }}
                        />
                        {selectedColor.name}
                      </>
                    ) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sizes:</span>
                  <span className="font-medium text-right">
                    {totalQuantity > 0
                      ? Object.entries(order.sizeQuantities)
                          .map(([size, qty]) => `${size}(${qty})`)
                          .join(', ')
                      : '-'}
                  </span>
                </div>
                <div className="border-t border-border my-3 pt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Base (per item):</span>
                    <span className="font-medium">₹{basePrice}</span>
                  </div>
                  {printPositionPrice > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Print (per item):</span>
                      <span className="font-medium">₹{printPositionPrice}</span>
                    </div>
                  )}
                  {totalQuantity > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Items total:</span>
                      <span className="font-medium">₹{itemsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-medium">₹{shipping}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Estimated Total:</span>
                    <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
                  </div>
                  {totalQuantity > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPriceBreakdown(true)}
                      className="mt-2 text-sm text-accent hover:underline"
                    >
                      Price breakdown
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
              onClick={() => setShowAddressModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-40%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-40%" }}
              className="fixed left-1/2 top-1/2 w-full max-w-[90vw] sm:max-w-2xl bg-background rounded-2xl shadow-2xl z-[201] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                </div>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {!showAddressForm && addresses.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <MapPin size={40} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No saved addresses</h3>
                    <Button onClick={() => setShowAddressForm(true)} className="mt-4">
                      <Plus size={18} className="mr-2" />
                      Add New Address
                    </Button>
                  </div>
                )}

                {!showAddressForm && addresses.length > 0 && (
                  <div className="space-y-4">
                    {addresses.map(address => (
                      <div
                        key={address.id}
                        onClick={() => selectAddress(address.id)}
                        className={cn(
                          "p-4 border rounded-xl hover:border-primary transition-colors cursor-pointer",
                          selectedAddressId === address.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{address.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                            <p className="text-sm mt-2">{address.address}</p>
                            <p className="text-sm">{address.city}, {address.state} - {address.pincode}</p>
                          </div>
                          {selectedAddressId === address.id && (
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <Check size={16} className="text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Plus size={18} />
                      Add New Address
                    </button>
                  </div>
                )}

                {showAddressForm && (
                  <div className="border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Home size={20} />
                      <h3 className="font-semibold text-lg">Add New Address</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <input
                          type="tel"
                          placeholder="9999999999"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address *</label>
                        <textarea
                          placeholder="House number, street, landmark"
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <input
                          type="text"
                          placeholder="Ghaziabad"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State *</label>
                        <input
                          type="text"
                          placeholder="Uttar Pradesh"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Pincode *</label>
                        <input
                          type="text"
                          placeholder="201001"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border flex gap-3">
                {showAddressForm ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAddress}
                      className="flex-1"
                      disabled={!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode}
                    >
                      <Check size={18} className="mr-2" />
                      Save Address
                    </Button>
                  </>
                ) : (
                  <>
                    {addresses.length > 0 && !showAddressForm && (
                      <Button
                        onClick={async () => {
                          if (!selectedAddress) return;
                          setShowAddressModal(false);

                          const lines = SIZES.filter((s) => (order.sizeQuantities[s] || 0) > 0).map((s) => ({
                            size: s,
                            quantity: order.sizeQuantities[s] || 0,
                          }));

                          const payload = {
                            customer: {
                              name: selectedAddress.name,
                              phone: selectedAddress.phone,
                              email: user?.email || '',
                              address: selectedAddress.address,
                              city: selectedAddress.city,
                              state: selectedAddress.state,
                              pincode: selectedAddress.pincode,
                            },
                            productType: selectedProductType?.name || order.productType,
                            variety: selectedVariety?.name || order.variety,
                            printType: selectedPrintType?.name || order.printType,
                            printPositions: order.printPositions,
                            color: selectedColor?.name || order.color,
                            notes: order.notes || '',
                            lines,
                            unitPrice,
                            itemsTotal,
                            shipping,
                            total,
                          };

                          try {
                            await submitCustomOrderToApi(payload);
                            window.dispatchEvent(new Event('custom-orders-updated'));
                          } catch (e: unknown) {
                            const msg = e instanceof Error ? e.message : 'Server unavailable';
                            toast.error('Could not sync order to server', { description: msg });
                            addCustomOrder({
                              id: `co_${Date.now()}`,
                              createdAt: new Date().toISOString(),
                              customer: payload.customer,
                              productType: payload.productType,
                              variety: payload.variety,
                              printType: payload.printType,
                              printPositions: payload.printPositions,
                              color: payload.color,
                              notes: payload.notes || undefined,
                              lines: payload.lines,
                              unitPrice: payload.unitPrice,
                              itemsTotal: payload.itemsTotal,
                              shipping: payload.shipping,
                              total: payload.total,
                              status: 'awaiting_confirmation',
                            });
                          }

                          const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
                          window.open(url, '_blank');
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!selectedAddress}
                      >
                        Continue to Whatsapp
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
              onClick={() => setShowSizeChart(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "-40%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.96, x: "-50%", y: "-40%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed left-1/2 top-1/2 w-full max-w-[92vw] sm:max-w-lg bg-background rounded-2xl shadow-2xl z-[201] overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg">Size Chart</h3>
                <button
                  onClick={() => setShowSizeChart(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-2 pr-4">Size</th>
                        <th className="py-2 pr-4">Chest</th>
                        <th className="py-2">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_CHART.map((row) => (
                        <tr key={row.size} className="border-t border-border/60">
                          <td className="py-2 pr-4 font-semibold">{row.size}</td>
                          <td className="py-2 pr-4">{row.chest}</td>
                          <td className="py-2">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Measurements are approximate. If you’re between sizes, choose the larger size.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Price Breakdown Modal */}
      <AnimatePresence>
        {showPriceBreakdown && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
              onClick={() => setShowPriceBreakdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "-40%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.96, x: "-50%", y: "-40%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed left-1/2 top-1/2 w-full max-w-[92vw] sm:max-w-xl bg-background rounded-2xl shadow-2xl z-[201] overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg">Price breakdown</h3>
                <button
                  onClick={() => setShowPriceBreakdown(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Unit price</span>
                  <span>₹{unitPrice.toFixed(2)}</span>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  {SIZES.filter((s) => (order.sizeQuantities[s] || 0) > 0).map((s) => {
                    const qty = order.sizeQuantities[s] || 0;
                    const lineTotal = qty * unitPrice;
                    return (
                      <div key={s} className="flex justify-between">
                        <span>Size: {s} ({qty})</span>
                        <span>
                          {qty} × ₹{unitPrice.toFixed(2)} = ₹{lineTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items total</span>
                    <span className="font-semibold">₹{itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">₹{shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold">Estimated total</span>
                  <span className="text-xl font-bold">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default CustomOrder;
