import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Package, MapPin, Heart, LogOut, ChevronRight, Settings, ArrowLeft,
  Plus, Home, Briefcase, Building2, Edit2, Trash2, Mail, Phone, Loader2,
  CheckCircle2, Circle, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAddress, type Address } from '@/context/AddressContext';
import { customerAuthApi } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/data';
import { cn } from '@/lib/utils';
import { getMyOrders, type Order } from '@/lib/orderStore';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();
  const { addresses, addAddress, removeAddress, updateAddress } = useAddress();
  
  const [activeSection, setActiveSection] = useState('orders');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home' as 'home' | 'work' | 'other',
  });
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressNote: user?.address || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home' as 'home' | 'work' | 'other',
  });

  const ordersRef = useRef<HTMLDivElement>(null);
  const addressesRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Fetch orders from API
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    
    let cancelled = false;
    
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await getMyOrders();
        if (!cancelled) setOrders(Array.isArray(res) ? res : []);
      } catch (err) {
        if (!cancelled) {
          console.error("Order fetch error:", err);
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };
    
    fetchOrders();
    
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email]);

  // Keep form in sync with server when not actively editing profile
  useEffect(() => {
    if (!editingProfile && user) {
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        addressNote: user.address || '',
      });
    }
  }, [user?.id, user?.first_name, user?.last_name, user?.email, user?.phone, user?.address, editingProfile]);

  // Scroll to section from URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
      scrollToSection(hash);
    }
  }, [location.hash]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: '/account' } } });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      orders: ordersRef,
      addresses: addressesRef,
      settings: settingsRef,
    };
    
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddAddress = async () => {
    if (newAddress.name && newAddress.phone && newAddress.address) {
      await addAddress({ ...newAddress, isDefault: addresses.length === 0 });
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '', type: 'home' });
    }
  };

  const resetProfileFormFromUser = () => {
    if (!user) return;
    setProfileData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      addressNote: user.address || '',
    });
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    const first = profileData.firstName.trim();
    const last = profileData.lastName.trim();
    const email = profileData.email.trim().toLowerCase();
    if (!first || !last || !email) {
      toast.error('Please fill in first name, last name, and email.');
      return;
    }
    setProfileSaving(true);
    try {
      await customerAuthApi.updateProfile({
        first_name: first,
        last_name: last,
        email,
        phone: profileData.phone.trim(),
        address: profileData.addressNote.trim(),
      });
      await refreshUser();
      setEditingProfile(false);
      toast.success('Profile saved');
      window.dispatchEvent(new Event('customers-updated'));
    } catch (err: any) {
      toast.error('Could not save profile', { description: err?.message || 'Try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const startEditAddress = (addr: Address) => {
    setShowAddressForm(false);
    setEditingAddressId(addr.id);
    setEditAddress({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      type: addr.type,
    });
  };

  const handleSaveEditAddress = async () => {
    if (!editingAddressId) return;
    if (!editAddress.name.trim() || !editAddress.phone.trim() || !editAddress.address.trim()) {
      toast.error('Name, phone, and address are required.');
      return;
    }
    const current = addresses.find((a) => a.id === editingAddressId);
    try {
      await updateAddress(editingAddressId, {
        ...editAddress,
        isDefault: current?.isDefault,
      });
      setEditingAddressId(null);
    } catch {
      /* toast from context */
    }
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', section: 'orders', count: orders.length },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', count: wishlistCount },
    { icon: MapPin, label: 'Addresses', section: 'addresses', count: addresses.length },
    { icon: Settings, label: 'Account Settings', section: 'settings' },
  ];

  const trackingSteps = ['pending', 'processing', 'shipped', 'delivered'];

  const getStepStatus = (orderStatus: string, step: string) => {
    if (orderStatus === 'cancelled' || orderStatus === 'refunded') return 'cancelled';
    const orderIndex = trackingSteps.indexOf(orderStatus.toLowerCase());
    const stepIndex = trackingSteps.indexOf(step);
    
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  /** Razorpay / card / UPI — online methods that need payment_status = paid */
  const isOnlineCheckoutMethod = (method: string | undefined) => {
    if (!method) return false;
    const m = method.toLowerCase();
    return m.includes('razorpay') || m.includes('upi') || m.includes('card') || m.includes('net banking');
  };

  /** Shown next to amount: fulfillment (not raw DB "pending" when payment already captured). */
  const fulfillmentBadgeLabel = (order: Order) => {
    const s = (order.status || 'pending').toLowerCase();
    if (s === 'cancelled' || s === 'refunded') {
      return order.status.charAt(0).toUpperCase() + order.status.slice(1);
    }
    const paid = order.payment_status === 'paid';
    if (isOnlineCheckoutMethod(order.payment_method) && !paid) return 'Awaiting payment';
    if (paid && s === 'pending') return 'Processing';
    return order.status.charAt(0).toUpperCase() + order.status.slice(1);
  };

  const fulfillmentBadgeClass = (order: Order) => {
    const s = (order.status || '').toLowerCase();
    if (s === 'delivered') return 'text-green-600';
    if (s === 'cancelled' || s === 'refunded') return 'text-red-500';
    if (isOnlineCheckoutMethod(order.payment_method) && order.payment_status !== 'paid') return 'text-amber-500';
    return 'text-accent';
  };

  const paymentSubtitle = (order: Order) => {
    const n = (order.items || []).length;
    const dateStr = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';
    const method = order.payment_method || '—';
    if (order.payment_status === 'paid') {
      return `${dateStr} • ${n} item(s) • Paid via ${method}`;
    }
    if (isOnlineCheckoutMethod(order.payment_method)) {
      return `${dateStr} • ${n} item(s) • ${method} — payment not confirmed yet`;
    }
    return `${dateStr} • ${n} item(s) • ${method}`;
  };

  return (
    <main className="min-h-screen pb-16">
      <div className="bg-muted/50 py-8">
        <div className="container-custom">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <User size={24} className="text-accent sm:hidden" />
              <User size={28} className="text-accent hidden sm:block" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Sidebar Menu */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            {menuItems.map(item => (
              item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count !== undefined && (
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    )}
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </div>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => item.section && scrollToSection(item.section)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-colors",
                    activeSection === item.section 
                      ? "border-accent bg-accent/5" 
                      : "border-border hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={cn(
                      activeSection === item.section ? "text-accent" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      activeSection === item.section && "text-accent"
                    )}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count !== undefined && (
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    )}
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </div>
                </button>
              )
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-destructive/5 hover:border-destructive/20 text-destructive transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Recent Orders Section */}
            <div ref={ordersRef} id="orders" className="bg-card rounded-xl border border-border p-6 scroll-mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <Link to="#orders" className="text-sm text-accent hover:underline font-medium">
                  View All
                </Link>
              </div>

              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="p-4 bg-muted/50 rounded-xl animate-pulse">
                      <div className="flex justify-between">
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-muted rounded" />
                          <div className="h-3 w-40 bg-muted rounded" />
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-5 w-20 bg-muted rounded ml-auto" />
                          <div className="h-3 w-16 bg-muted rounded ml-auto" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div 
                      key={order.id}
                      className="flex flex-col p-5 bg-muted/40 rounded-xl border border-border/50 hover:bg-muted/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-mono font-semibold text-base">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {paymentSubtitle(order)}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                          <span className={`text-sm font-medium ${fulfillmentBadgeClass(order)}`}>
                            {fulfillmentBadgeLabel(order)}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Order Tracking Details */}
                      {selectedOrder?.id === order.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-6 pt-6 border-t border-border overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h4 className="font-semibold mb-6">Order Tracking</h4>
                          
                          {order.status === 'cancelled' || order.status === 'refunded' ? (
                            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-3">
                              <CheckCircle2 size={20} />
                              <span className="font-medium">This order was {order.status}.</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border sm:left-auto sm:top-5 sm:bottom-auto sm:h-0.5 sm:w-full sm:right-4 -z-10" />
                              <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-4 relative z-0">
                                {trackingSteps.map((step, i) => {
                                  const status = getStepStatus(order.status, step);
                                  return (
                                    <div key={step} className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10 w-full sm:w-1/4">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                        status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                                        status === 'current' ? 'bg-accent border-accent text-white' :
                                        'bg-card border-muted-foreground text-muted-foreground'
                                      }`}>
                                        {status === 'completed' ? <CheckCircle2 size={16} /> : 
                                         status === 'current' ? <Clock size={16} /> : 
                                         <Circle size={10} fill="currentColor" />}
                                      </div>
                                      <div className="sm:text-center text-left">
                                        <p className={`text-sm font-medium capitalize ${
                                          status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                                        }`}>{step}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {status === 'completed' ? 'Completed' : status === 'current' ? 'In Progress' : 'Pending'}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="mt-8 grid sm:grid-cols-2 gap-6 bg-background rounded-lg p-5 border border-border/50">
                            <div>
                              <h5 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Shipping Address</h5>
                              <p className="text-sm font-medium">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{order.shipping_address}</p>
                              {order.customer_phone && <p className="text-sm text-muted-foreground mt-1">Phone: {order.customer_phone}</p>}
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Order Items</h5>
                              <ul className="space-y-3">
                                {order.items?.map((item, idx) => (
                                  <li key={idx} className="flex justify-between items-start gap-3">
                                    <div className="flex gap-3">
                                      {item.image && (
                                        <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-md" />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.qty} {item.size ? `• Size: ${item.size}` : ''} {item.color ? `• Color: ${item.color}` : ''}</p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium">{formatPrice(item.price * item.qty)}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button asChild variant="accent">
                    <Link to="/shop">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Saved Addresses Section */}
            <div ref={addressesRef} id="addresses" className="bg-card rounded-xl border border-border p-6 scroll-mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Saved Addresses</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(null);
                    setShowAddressForm(!showAddressForm);
                  }}
                  className="flex items-center gap-2 text-sm text-accent hover:underline font-medium"
                >
                  <Plus size={16} />
                  Add New
                </button>
              </div>

              {/* Edit Address Form */}
              {editingAddressId && (
                <div className="mb-6 p-4 border border-border rounded-xl bg-muted/30">
                  <h3 className="font-semibold mb-4">Edit address</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={editAddress.name}
                        onChange={(e) => setEditAddress({ ...editAddress, name: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        value={editAddress.phone}
                        onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="10-digit number"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Address *</label>
                      <input
                        type="text"
                        value={editAddress.address}
                        onChange={(e) => setEditAddress({ ...editAddress, address: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="House no., Street, Area"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">City</label>
                      <input
                        type="text"
                        value={editAddress.city}
                        onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">State</label>
                      <input
                        type="text"
                        value={editAddress.state}
                        onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Pincode</label>
                      <input
                        type="text"
                        value={editAddress.pincode}
                        onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="6-digit pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Type</label>
                      <div className="flex gap-2">
                        {(['home', 'work', 'other'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setEditAddress({ ...editAddress, type })}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                              editAddress.type === type
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-muted-foreground'
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
                    <Button onClick={handleSaveEditAddress} variant="accent">
                      Save changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingAddressId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Address Form */}
              {showAddressForm && (
                <div className="mb-6 p-4 border border-border rounded-xl bg-muted/30">
                  <h3 className="font-semibold mb-4">Add New Address</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="10-digit number"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Address *</label>
                      <input
                        type="text"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="House no., Street, Area"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">State</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Pincode</label>
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                        className="w-full h-10 px-3 rounded-lg border bg-background"
                        placeholder="6-digit pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Type</label>
                      <div className="flex gap-2">
                        {(['home', 'work', 'other'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewAddress({...newAddress, type})}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                              newAddress.type === type 
                                ? "border-accent bg-accent/10 text-accent" 
                                : "border-border hover:border-muted-foreground"
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
                    <Button onClick={handleAddAddress} variant="accent">Save Address</Button>
                    <Button variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Addresses List */}
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{addr.name}</p>
                            <span className="px-2 py-0.5 bg-muted rounded text-xs uppercase font-medium">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Mobile: {addr.phone}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditAddress(addr)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Edit address"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => removeAddress(addr.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No addresses saved yet</p>
                  <Button
                    onClick={() => {
                      setEditingAddressId(null);
                      setShowAddressForm(true);
                    }}
                    variant="accent"
                  >
                    <Plus size={16} className="mr-2" />
                    Add New Address
                  </Button>
                </div>
              )}
            </div>

            {/* Account Settings Section */}
            <div ref={settingsRef} id="settings" className="bg-card rounded-xl border border-border p-6 scroll-mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Account Settings</h2>
                {!editingProfile && (
                  <button 
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-2 text-sm text-accent hover:underline font-medium"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">First Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        disabled={!editingProfile}
                        className="w-full h-11 pl-10 pr-3 rounded-lg border bg-background disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Last Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        disabled={!editingProfile}
                        className="w-full h-11 pl-10 pr-3 rounded-lg border bg-background disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!editingProfile}
                        className="w-full h-11 pl-10 pr-3 rounded-lg border bg-background disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!editingProfile}
                        className="w-full h-11 pl-10 pr-3 rounded-lg border bg-background disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Add phone number"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Address (optional)</label>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Saved on your account; default shipping addresses are managed under Saved Addresses.
                    </p>
                    <textarea
                      value={profileData.addressNote}
                      onChange={(e) => setProfileData({ ...profileData, addressNote: e.target.value })}
                      disabled={!editingProfile}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border bg-background disabled:opacity-60 disabled:cursor-not-allowed resize-y min-h-[5rem]"
                      placeholder="Flat, street, area, city…"
                    />
                  </div>
                </div>

                {editingProfile && (
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSaveProfile} variant="accent" disabled={profileSaving}>
                      {profileSaving ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={profileSaving}
                      onClick={() => {
                        resetProfileFormFromUser();
                        setEditingProfile(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Account;
