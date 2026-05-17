import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Trash2, Minus, Plus, MapPin, CreditCard, 
  Truck, Home, Briefcase, Building2, Check, ChevronRight,
  ShoppingBag, Tag, Smartphone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAddress, type Address } from '@/context/AddressContext';
import { useCoupon } from '@/context/CouponContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { formatPrice } from '@/lib/data';
import { addOrder, type Order } from '@/lib/orderStore';
import { upsertCustomer } from '@/lib/customerStore';
import {
  createRazorpayPaymentOrder,
  loadRazorpayScript,
  verifyRazorpayPayment,
} from '@/lib/paymentApi';
import { customerApi } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type CheckoutStep = 'bag' | 'address' | 'payment';
/** Razorpay Checkout (card / UPI / netbanking in one modal). */
type CheckoutPayMode = 'razorpay';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, removeFromCart, updateQuantity, updateItemOptions } = useCart();
  const { isAuthenticated, user, requestEmailOtp, verifyEmailOtp, loading: authLoading } = useAuth();
  const { addresses, addAddress, removeAddress, selectedAddressId, selectAddress, getSelectedAddress, mergeAddress } = useAddress();
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();
  const { showCouponApplied, showCouponError, showRemovedFromCart, showOrderPlaced, showOrderError } = useToastNotifications();
  
  const [step, setStep] = useState<CheckoutStep>('bag');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payMode] = useState<CheckoutPayMode>('razorpay');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home' as 'home' | 'work' | 'other',
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [pincodeCheckLoading, setPincodeCheckLoading] = useState(false);

  const discount = calculateDiscount(totalPrice);
  const finalTotal = totalPrice - discount;

  // Checkout OTP Gate (guest → email OTP → authenticated)
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = window.setInterval(() => setCooldownLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldownLeft]);

  useEffect(() => {
    const value = isProcessing ? 'true' : 'false';
    sessionStorage.setItem('variscaCheckoutProcessing', value);
    window.dispatchEvent(new CustomEvent('varisca-checkout-processing', { detail: isProcessing }));

    return () => {
      sessionStorage.setItem('variscaCheckoutProcessing', 'false');
      window.dispatchEvent(new CustomEvent('varisca-checkout-processing', { detail: false }));
    };
  }, [isProcessing]);

  const steps: { id: CheckoutStep; label: string; icon: typeof ShoppingBag }[] = [
    { id: 'bag', label: 'BAG', icon: ShoppingBag },
    { id: 'address', label: 'ADDRESS', icon: MapPin },
    { id: 'payment', label: 'PAYMENT', icon: CreditCard },
  ];

  const stepIndex = steps.findIndex(s => s.id === step);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await applyCoupon(couponCode, totalPrice);
    if (result.success) {
      showCouponApplied(couponCode.toUpperCase(), formatPrice(result.discount || calculateDiscount(totalPrice)));
      setCouponCode('');
    } else {
      showCouponError(result.message);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    showRemovedFromCart('Item');
  };

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!newAddress.name) errors.name = 'Name is required';
    if (!newAddress.phone) errors.phone = 'Phone is required';
    if (!newAddress.address) errors.address = 'Address is required';
    if (!newAddress.city) errors.city = 'City is required';
    if (!newAddress.state) errors.state = 'State is required';
    if (!newAddress.pincode) errors.pincode = 'Pincode is required';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = () => {
    if (validateAddress()) {
      addAddress({ ...newAddress, isDefault: addresses.length === 0 });
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '', type: 'home' });
    }
  };

  const buildOrderPayload = () => {
    const selectedAddr = getSelectedAddress();
    const addressStr = selectedAddr
      ? `${selectedAddr.address}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`
      : '';

    const nameFromAddress = selectedAddr?.name || '';
    const nameFromUser = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    const customerName =
      (isAuthenticated ? nameFromUser : '') ||
      nameFromAddress ||
      (user?.email ? user.email.split('@')[0] : 'Guest');

    const email = user?.email || '';

    return {
      selectedAddr,
      addressStr,
      payload: {
        customer_id: isAuthenticated ? user?.id : undefined,
        customer_name: customerName,
        customer_email: email,
        customer_phone: selectedAddr?.phone || (isAuthenticated ? user?.phone : '') || '',
        total: finalTotal,
        subtotal: totalPrice,
        discount: discount,
        shipping_cost: 0,
        tax: 0,
        handling_fee: 0,
        coupon_code: appliedCoupon?.code || '',
        items: items.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          qty: item.quantity,
          price: item.product.price,
          size: item.size,
          color: item.color,
          image: item.product.image,
        })),
        shipping_address: addressStr,
        payment_method: 'Razorpay',
      },
    };
  };

  const finishCheckoutSuccess = (order: { order_number?: string; id: string }, email: string) => {
    const orderNum = order.order_number || order.id;
    showOrderPlaced(orderNum);
    clearCart();
    window.dispatchEvent(new Event('orders-updated'));
    navigate(`/order-confirmation?order=${orderNum}`, {
      state: { orderNumber: orderNum, email },
    });
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !user) return;
    if (!getSelectedAddress()) {
      showOrderError('Please select a delivery address');
      return;
    }

    setIsProcessing(true);

    const { addressStr, payload } = buildOrderPayload();

    // ─── Razorpay: create order → create RZ order → open Checkout modal → verify ───
    try {
      const order = (await addOrder(payload as any)) as Order;
      try {
        await upsertCustomer({
          email: user.email,
          name: getSelectedAddress()?.name || user.first_name || user.email.split('@')[0],
          phone: getSelectedAddress()?.phone,
          address: addressStr,
        } as any);
      } catch {
        /* best-effort */
      }

      const rz = await createRazorpayPaymentOrder({
        orderId: order.id,
        amount: finalTotal,
        email: user.email,
        contact: getSelectedAddress()?.phone || user.phone || '',
      });

      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: rz.key,
        amount: rz.amount,
        currency: rz.currency || 'INR',
        order_id: rz.rzOrderId,
        name: 'Varisca',
        description: `Order ${order.order_number || ''}`.trim(),
        prefill: {
          email: user.email,
          contact: getSelectedAddress()?.phone || user.phone || '',
          name:
            `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
            getSelectedAddress()?.name ||
            undefined,
        },
        theme: { color: '#ea580c' },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
        handler: (response) => {
          verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
            .then(() => {
              finishCheckoutSuccess(order, user.email);
            })
            .catch((e: unknown) => {
              showOrderError(e instanceof Error ? e.message : 'Payment verification failed. Contact support if charged.');
            })
            .finally(() => setIsProcessing(false));
        },
      });

      rzp.on('payment.failed', (fail) => {
        showOrderError(fail?.error?.description || 'Payment failed');
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error('[Checkout] Razorpay flow failed:', err);
      showOrderError(err instanceof Error ? err.message : 'Could not start payment. Try Cash on Delivery or try again.');
      setIsProcessing(false);
    }
  };

  const canProceedToAddress = items.length > 0;
  const canProceedToPayment = selectedAddressId !== null;

  const handleBack = () => {
    if (step === 'payment') {
      setStep('address');
      return;
    }
    if (step === 'address') {
      setStep('bag');
      return;
    }
    navigate('/cart');
  };

  const handleStepClick = (target: CheckoutStep) => {
    if (target === step) return;
    if (target === 'bag') {
      setStep('bag');
      return;
    }
    if (target === 'address') {
      if (canProceedToAddress) setStep('address');
      return;
    }
    // payment
    if (canProceedToAddress && canProceedToPayment) setStep('payment');
  };

  if (items.length === 0 && step === 'bag') {
    return (
      <main className="min-h-screen">
        <div className="container-custom py-20 text-center">
          <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold mb-4">Your bag is empty</h1>
          <p className="text-muted-foreground mb-8">Add some items to your bag</p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Require email OTP auth before checkout steps
  if (!isAuthenticated) {
    const disabled = authLoading || isProcessing;

    return (
      <main className="min-h-screen bg-muted/30">
        <div className="container-custom py-10">
          <div className="max-w-lg mx-auto bg-background rounded-xl border border-border p-6">
            <h1 className="text-xl font-display font-bold mb-1">Verify your email to continue</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your name and email. We’ll send an OTP to your email to continue to checkout.
            </p>

            {authError && (
              <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {authError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAuthError('');

                if (authStep === 'email') {
                  if (!authFirstName.trim() || !authLastName.trim()) {
                    setAuthError('Please enter your first and last name');
                    return;
                  }
                  if (!authEmail.trim()) {
                    setAuthError('Please enter your email');
                    return;
                  }

                  const res = await requestEmailOtp({
                    first_name: authFirstName.trim(),
                    last_name: authLastName.trim(),
                    email: authEmail.trim(),
                  });
                  if (res.ok) {
                    setAuthStep('otp');
                    setCooldownLeft(res.resendAfterSeconds);
                  } else {
                    setAuthError(res.error || 'Could not send OTP');
                  }
                  return;
                }

                // otp
                if (!authOtp.trim()) {
                  setAuthError('Please enter the OTP');
                  return;
                }

                const ok = await verifyEmailOtp(authEmail.trim(), authOtp.trim());
                if (!ok) {
                  setAuthError('Invalid OTP');
                } else {
                  setAuthOtp('');
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First name</label>
                  <input
                    type="text"
                    value={authFirstName}
                    onChange={(e) => setAuthFirstName(e.target.value)}
                    disabled={disabled || authStep === 'otp'}
                    autoComplete="given-name"
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last name</label>
                  <input
                    type="text"
                    value={authLastName}
                    onChange={(e) => setAuthLastName(e.target.value)}
                    disabled={disabled || authStep === 'otp'}
                    autoComplete="family-name"
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  disabled={disabled || authStep === 'otp'}
                  autoComplete="email"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="you@example.com"
                />
              </div>

              {authStep === 'otp' && (
                <div>
                  <label className="block text-sm font-medium mb-2">OTP</label>
                  <input
                    inputMode="numeric"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    disabled={disabled}
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent tracking-widest text-center text-lg"
                    placeholder="Enter OTP"
                  />

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <button
                      type="button"
                      className={cn(
                        'text-accent hover:underline font-medium',
                        (cooldownLeft > 0 || disabled) && 'opacity-50 pointer-events-none',
                      )}
                      onClick={async () => {
                        setAuthError('');
                        const res = await requestEmailOtp({
                          first_name: authFirstName.trim(),
                          last_name: authLastName.trim(),
                          email: authEmail.trim(),
                        });
                        if (res.ok) setCooldownLeft(res.resendAfterSeconds);
                      }}
                    >
                      Resend OTP{cooldownLeft > 0 ? ` (${cooldownLeft}s)` : ''}
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setAuthStep('email');
                        setAuthOtp('');
                      }}
                    >
                      Edit details
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" variant="accent" size="lg" className="w-full" disabled={disabled}>
                {authStep === 'email' ? 'Send OTP' : 'Verify & Continue'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Back to cart
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Step Navigation */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container-custom py-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            {step === 'bag' ? 'Back to Cart' : step === 'address' ? 'Back to Bag' : 'Back to Address'}
          </button>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStepClick(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleStepClick(s.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium select-none",
                    step === s.id 
                      ? "text-accent" 
                      : idx < stepIndex 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    ,
                    (s.id === 'bag' ||
                      (s.id === 'address' && canProceedToAddress) ||
                      (s.id === 'payment' && canProceedToAddress && canProceedToPayment))
                      ? "cursor-pointer hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 rounded-md"
                      : "cursor-not-allowed opacity-60"
                  )}
                >
                  <span className={cn(
                    "text-xs md:text-sm font-semibold tracking-wider",
                    step === s.id && "border-b-2 border-accent pb-0.5"
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-8 md:w-16 h-px mx-2",
                    idx < stepIndex ? "bg-accent" : "bg-border border-dashed"
                  )} style={{ borderStyle: idx >= stepIndex ? 'dashed' : 'solid' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {/* BAG STEP */}
              {step === 'bag' && (
                <motion.div
                  key="bag"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-background rounded-xl border border-border p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                      <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <Check size={20} className="text-accent" />
                        {items.length}/{items.length} ITEMS SELECTED
                      </h2>
                      <div className="flex gap-3 sm:gap-4 text-sm">
                        <button className="text-muted-foreground hover:text-foreground font-medium transition-colors">REMOVE</button>
                        <button className="text-muted-foreground hover:text-foreground font-medium transition-colors">MOVE TO WISHLIST</button>
                      </div>
                    </div>

                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div key={`${item.product.id}-${item.size}-${item.color}`} className="py-5 sm:py-6 flex gap-4 sm:gap-6">
                          {/* Product Image - Larger for better visibility */}
                          <div className="relative flex-shrink-0">
                            <Link to={`/product/${item.product.id}`} className="block">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-xl shadow-sm"
                              />
                            </Link>
                          </div>

                          <div className="flex-1 flex flex-col">
                            {/* Product Info Header */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 pr-2">
                                <Link to={`/product/${item.product.id}`} className="hover:text-accent transition-colors">
                                  <h3 className="font-semibold text-base sm:text-lg leading-tight mb-1">{item.product.name}</h3>
                                </Link>
                                <p className="text-sm text-muted-foreground">{item.product.subcategory}</p>
                              </div>
                              <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 -m-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>

                            {/* Size and Quantity Controls */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <div className="w-[6.25rem] sm:w-[6.75rem]">
                                <Select
                                  value={item.size}
                                  onValueChange={(v) => updateItemOptions(item.id, { size: v })}
                                >
                                  <SelectTrigger className="h-9 bg-muted">
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(item.product.sizes && item.product.sizes.length ? item.product.sizes : [item.size]).map((s) => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Qty:</span>
                                <div className="flex items-center gap-1 border border-border rounded-lg">
                                  <button 
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg sm:text-xl font-bold">{formatPrice(item.product.price)}</span>
                              {item.product.original_price && (
                                <>
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(item.product.original_price)}
                                  </span>
                                  <span className="text-sm font-semibold text-accent">
                                    ({Math.round(((item.product.original_price - item.product.price) / item.product.original_price) * 100)}% OFF)
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Delivery Info */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Truck size={15} className="flex-shrink-0" />
                                <span>7 days return</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-accent font-medium">
                                <Check size={15} className="flex-shrink-0" />
                                <span>Delivery by 3-5 days</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ADDRESS STEP */}
              {step === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-background rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-lg">Select Delivery Address</h2>
                      <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                        ADD NEW ADDRESS
                      </Button>
                    </div>

                    {addresses.length === 0 && !showAddressForm && (
                      <div className="text-center py-8">
                        <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No saved addresses</p>
                        <Button onClick={() => setShowAddressForm(true)}>Add New Address</Button>
                      </div>
                    )}

                    {/* Address Form */}
                    {showAddressForm && (
                      <div className="border border-border rounded-lg p-4 mb-4 bg-muted/30">
                        <h3 className="font-medium mb-4">Add New Address</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                              type="text"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                              className={cn("w-full h-10 px-3 rounded-lg border bg-background", addressErrors.name && "border-destructive")}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                              type="tel"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                              className={cn("w-full h-10 px-3 rounded-lg border bg-background", addressErrors.phone && "border-destructive")}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input
                              type="text"
                              value={newAddress.address}
                              onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                              className={cn("w-full h-10 px-3 rounded-lg border bg-background", addressErrors.address && "border-destructive")}
                              placeholder="House no., Street, Area"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              className={cn("w-full h-10 px-3 rounded-lg border bg-background", addressErrors.city && "border-destructive")}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">State</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              className={cn("w-full h-10 px-3 rounded-lg border bg-background", addressErrors.state && "border-destructive")}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Pincode</label>
                            <input
                              type="text"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                              className={cn("w-full h-10 px-3 rounded-lg border bg-background", addressErrors.pincode && "border-destructive")}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <div className="flex gap-2">
                              {(['home', 'work', 'other'] as const).map((type) => (
                                <button
                                  key={type}
                                  onClick={() => setNewAddress({...newAddress, type})}
                                  className={cn(
                                    "flex items-center gap-1 px-3 py-2 rounded-lg border text-sm",
                                    newAddress.type === type ? "border-accent bg-accent/10 text-accent" : "border-border"
                                  )}
                                >
                                  {type === 'home' && <Home size={14} />}
                                  {type === 'work' && <Briefcase size={14} />}
                                  {type === 'other' && <Building2 size={14} />}
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button onClick={handleAddAddress}>Save Address</Button>
                          <Button variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* Saved Addresses */}
                    {addresses.length > 0 && (
                      <div className="space-y-3">
                        {addresses.filter(a => a.isDefault).length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">DEFAULT ADDRESS</h4>
                            {addresses.filter(a => a.isDefault).map((addr) => (
                              <AddressCard 
                                key={addr.id} 
                                address={addr} 
                                isSelected={selectedAddressId === addr.id}
                                onSelect={() => selectAddress(addr.id)}
                                onRemove={() => removeAddress(addr.id)}
                              />
                            ))}
                          </div>
                        )}
                        {addresses.filter(a => !a.isDefault).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">OTHER ADDRESS</h4>
                            {addresses.filter(a => !a.isDefault).map((addr) => (
                              <AddressCard 
                                key={addr.id} 
                                address={addr} 
                                isSelected={selectedAddressId === addr.id}
                                onSelect={() => selectAddress(addr.id)}
                                onRemove={() => removeAddress(addr.id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PAYMENT STEP */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-background rounded-xl border border-border p-4">
                    <h2 className="font-semibold text-lg mb-4">Payment method</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose how you want to pay. Online payments open a secure Razorpay window — UPI, cards, and net banking are supported.
                    </p>

                    {!isAuthenticated && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email (for order confirmation)</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder="you@example.com"
                        />
                      </div>
                    )}

                    <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={payMode === 'razorpay'}
                        className={cn(
                          'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                          payMode === 'razorpay'
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground/50',
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            payMode === 'razorpay' ? 'border-accent' : 'border-muted-foreground',
                          )}
                        >
                          {payMode === 'razorpay' && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 font-medium">
                            <Smartphone className="w-4 h-4 text-accent shrink-0" />
                            Pay online (Razorpay)
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            UPI, credit or debit card, net banking — you will confirm the amount in a secure popup before paying.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Details - Right Side */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-background rounded-xl border border-border p-4">
              {/* Coupon Section */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <Tag size={18} className="text-muted-foreground" />
                <div className="flex-1">
                  <span className="font-medium">Apply Coupons</span>
                  {appliedCoupon && (
                    <p className="text-xs text-accent">{appliedCoupon.code} applied</p>
                  )}
                </div>
                {appliedCoupon ? (
                  <Button variant="outline" size="sm" onClick={removeCoupon}>REMOVE</Button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="w-24 h-8 px-2 text-sm border rounded"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon}>APPLY</Button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="py-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  PRICE DETAILS ({items.length} Item{items.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total MRP</span>
                    <span>{formatPrice(items.reduce((acc, item) => acc + (item.product.original_price || item.product.price) * item.quantity, 0))}</span>
                  </div>
                  <div className="flex justify-between text-accent">
                    <span>Discount on MRP</span>
                    <span>- {formatPrice(items.reduce((acc, item) => acc + ((item.product.original_price || item.product.price) - item.product.price) * item.quantity, 0))}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Coupon Discount</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-accent">FREE</span>
                  </div>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t border-border font-semibold text-base">
                  <span>Total Amount</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  By placing the order, you agree to Varisca&apos;s{' '}
                  <Link to="/terms" className="text-accent font-medium hover:underline">
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-accent font-medium hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Action Button */}
              {step === 'bag' && (
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  onClick={() => setStep('address')}
                  disabled={items.length === 0}
                >
                  PLACE ORDER
                </Button>
              )}

              {step === 'address' && (
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  onClick={async () => {
                    if (!selectedAddressId || !user?.id) {
                      toast.error('Select an address to continue.');
                      return;
                    }
                    const sel = getSelectedAddress();
                    if (!sel?.pincode?.replace(/\D/g, '') || sel.pincode.replace(/\D/g, '').length < 6) {
                      toast.error('Please enter a valid 6-digit pincode on your delivery address.');
                      return;
                    }
                    if (String(sel.id).startsWith('addr_')) {
                      toast.error('Save your address to your account before continuing.', {
                        description: 'Use “Save Address” on the form above.',
                      });
                      return;
                    }
                    setPincodeCheckLoading(true);
                    try {
                      const res = await customerApi.post<{
                        serviceable: boolean;
                        address: Address;
                      }>(`/customers/auth/addresses/${selectedAddressId}/verify-pincode`, {});
                      if (!res.serviceable) {
                        mergeAddress(selectedAddressId, { pincode_servicable: false });
                        toast.error('Sorry, delivery is not available at this pincode.', {
                          description: 'Service is not available at your location. Try another pincode or address.',
                        });
                        return;
                      }
                      mergeAddress(selectedAddressId, { pincode_servicable: true });
                      setStep('payment');
                    } catch (e: unknown) {
                      const msg = e instanceof Error ? e.message : 'Could not verify pincode.';
                      toast.error(msg);
                    } finally {
                      setPincodeCheckLoading(false);
                    }
                  }}
                  disabled={!selectedAddressId || pincodeCheckLoading || isProcessing}
                >
                  {pincodeCheckLoading ? 'Checking…' : 'CONTINUE'}
                </Button>
              )}

              {step === 'payment' && (
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? 'Processing...'
                    : `PAY ${formatPrice(finalTotal)}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Address Card Component
const AddressCard = ({ address, isSelected, onSelect, onRemove }: { 
  address: Address; 
  isSelected: boolean; 
  onSelect: () => void; 
  onRemove: () => void;
}) => (
  <div 
    className={cn(
      "p-4 rounded-lg border-2 cursor-pointer transition-all",
      isSelected ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"
    )}
    onClick={onSelect}
  >
    <div className="flex items-start gap-3">
      <div className={cn(
        "mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
        isSelected ? "border-accent" : "border-muted-foreground"
      )}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-accent" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{address.name}</span>
          <span className="px-2 py-0.5 bg-muted rounded text-xs uppercase">{address.type}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {address.address}, {address.city}, {address.state} - {address.pincode}
        </p>
        <p className="text-sm text-muted-foreground mt-1">Mobile: {address.phone}</p>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            REMOVE
          </Button>
          <Button variant="outline" size="sm">EDIT</Button>
        </div>
      </div>
    </div>
  </div>
);

export default Checkout;
