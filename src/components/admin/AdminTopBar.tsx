import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getOrders } from '@/lib/orderStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  // Catalog
  '/admin/products': 'Products',
  '/admin/catalog/categories': 'Categories',
  '/admin/catalog/brands': 'Brands',
  '/admin/catalog/attributes': 'Attributes',
  '/admin/catalog/inventory': 'Inventory',
  // Orders
  '/admin/orders': 'All Orders',
  '/admin/orders/returns': 'Returns',
  '/admin/orders/refunds': 'Refund Requests',
  // Customers
  '/admin/customers': 'Customers',
  // Marketing
  '/admin/marketing/coupons': 'Coupons',
  '/admin/marketing/banners': 'Banners',
  '/admin/marketing/campaigns': 'Email Campaigns',
  // Finance
  '/admin/finance/transactions': 'Transactions',
  '/admin/finance/payouts': 'Payouts',
  '/admin/finance/refund-logs': 'Refund Logs',
  // Shipping
  '/admin/shipping/zones': 'Delivery Zones',
  '/admin/shipping/charges': 'Shipping Charges',
  '/admin/shipping/partners': 'Delivery Partners',
  // Reports
  '/admin/reports/sales': 'Sales Report',
  '/admin/reports/products': 'Product Performance',
  '/admin/reports/customers': 'Customer Analytics',
  '/admin/reports/revenue': 'Revenue Report',
  // Admin Management
  '/admin/management/users': 'Admin Users',
  '/admin/management/roles': 'Roles & Permissions',
  // Settings
  '/admin/settings': 'General Settings',
  '/admin/settings/payment': 'Payment Settings',
  '/admin/settings/tax': 'Tax Settings',
  '/admin/settings/notifications': 'Notification Templates',
  // Legacy
  '/admin/analytics': 'Analytics',
};

export const AdminTopBar = () => {
  const { admin } = useAdminAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = useCallback(async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    window.addEventListener('orders-updated', loadOrders);
    return () => window.removeEventListener('orders-updated', loadOrders);
  }, [loadOrders]);

  // Generate notifications from recent orders
  const notifications = (orders || []).slice(0, 5).map(o => ({
    id: o.id,
    title: `New Order ${o.order_number || o.id}`,
    message: `${o.customer_name || 'Customer'} placed an order for ₹${(o.total || 0).toLocaleString()}`,
    time: o.created_at || '',
    read: o.status !== 'pending',
  }));
  const unreadCount = notifications.filter(n => !n.read).length;

  const currentPage = breadcrumbMap[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Admin</span>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm font-semibold">{currentPage}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={cn('flex items-center transition-all duration-300', searchOpen ? 'w-64' : 'w-9')}>
          {searchOpen ? (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders, products..."
                className="h-9 w-full pl-9 pr-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {unreadCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                  <span className={cn('text-sm font-medium', !n.read && 'text-foreground')}>{n.title}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">{n.message}</p>
                <span className="text-[10px] text-muted-foreground/60 pl-4">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Admin Avatar */}
        {admin && (
          <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange-600 text-xs font-bold text-white shadow-md shadow-accent/20">
            {admin.name.charAt(0)}
          </div>
        )}
      </div>
    </header>
  );
};
