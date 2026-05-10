import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getRoleLabel, type Permission } from '@/lib/admin/utils/permissions';
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart3, Settings, Shirt,
  ChevronLeft, ChevronRight, ChevronDown, LogOut, Sparkles,
  Tags, Palette, Box, Layers, RotateCcw, CreditCard,
  Truck, MapPin, DollarSign,   IndianRupee, FileText, Megaphone, Image,
  Mail, UserCog, Shield, Wallet, Receipt, Bell,
  TrendingUp, PieChart, UsersRound, Globe, BadgePercent,
  Building2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ─── Sidebar Sections ───────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.FC<{ className?: string }>;
  href: string;
  /** Permission required to see this item */
  permission?: Permission;
}

interface SidebarSection {
  key: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  /** Permission required to see this section (if any item in section is visible, section shows) */
  permission?: Permission;
  items: NavItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
      { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', permission: 'dashboard.view' },
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: ShoppingBag,
    permission: 'orders.view',
    items: [
      { label: 'All Orders', icon: ShoppingBag, href: '/admin/orders', permission: 'orders.view' },
      { label: 'Custom Orders', icon: Shirt, href: '/admin/orders/custom', permission: 'orders.view' },
      { label: 'Returns', icon: RotateCcw, href: '/admin/orders/returns', permission: 'orders.returns.manage' },
      { label: 'Refund Requests', icon: CreditCard, href: '/admin/orders/refunds', permission: 'orders.refunds.manage' },
    ],
  },
  {
    key: 'catalog',
    label: 'Catalog',
    icon: Package,
    permission: 'catalog.view',
    items: [
      { label: 'Products', icon: Package, href: '/admin/products', permission: 'catalog.view' },
      { label: 'Categories', icon: Tags, href: '/admin/catalog/categories', permission: 'catalog.categories.manage' },
      { label: 'Brands', icon: Palette, href: '/admin/catalog/brands', permission: 'catalog.brands.manage' },
      { label: 'Attributes', icon: Layers, href: '/admin/catalog/attributes', permission: 'catalog.attributes.manage' },
      { label: 'Inventory', icon: Box, href: '/admin/catalog/inventory', permission: 'catalog.inventory.manage' },
    ],
  },
  {
    key: 'customers',
    label: 'Customers',
    icon: Users,
    permission: 'customers.view',
    items: [
      { label: 'All Customers', icon: Users, href: '/admin/customers', permission: 'customers.view' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    permission: 'marketing.view',
    items: [
      { label: 'Coupons', icon: BadgePercent, href: '/admin/marketing/coupons', permission: 'marketing.coupons.manage' },
      { label: 'Banners', icon: Image, href: '/admin/marketing/banners', permission: 'marketing.banners.manage' },
      { label: 'Email Campaigns', icon: Mail, href: '/admin/marketing/campaigns', permission: 'marketing.campaigns.manage' },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: IndianRupee,
    permission: 'finance.view',
    items: [
      { label: 'Transactions', icon: Receipt, href: '/admin/finance/transactions', permission: 'finance.transactions.view' },
      { label: 'Payouts', icon: Wallet, href: '/admin/finance/payouts', permission: 'finance.payouts.manage' },
      { label: 'Refund Logs', icon: FileText, href: '/admin/finance/refund-logs', permission: 'finance.refunds.manage' },
    ],
  },
  {
    key: 'shipping',
    label: 'Shipping',
    icon: Truck,
    permission: 'shipping.view',
    items: [
      { label: 'Delivery Zones', icon: MapPin, href: '/admin/shipping/zones', permission: 'shipping.zones.manage' },
      { label: 'Shipping Charges', icon: IndianRupee, href: '/admin/shipping/charges', permission: 'shipping.charges.manage' },
      { label: 'Delivery Partners', icon: Truck, href: '/admin/shipping/partners', permission: 'shipping.partners.manage' },
    ],
  },
  {
    key: 'delivery',
    label: 'Delivery',
    icon: Building2,
    permission: 'shipping.view',
    items: [
      {
        label: 'Warehouses',
        icon: Building2,
        href: '/admin/delivery/warehouses',
        permission: 'shipping.partners.manage',
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: FileText,
    permission: 'reports.view',
    items: [
      { label: 'Sales Report', icon: TrendingUp, href: '/admin/reports/sales', permission: 'reports.view' },
      { label: 'Product Performance', icon: PieChart, href: '/admin/reports/products', permission: 'reports.view' },
      { label: 'Customer Analytics', icon: UsersRound, href: '/admin/reports/customers', permission: 'reports.view' },
      { label: 'Revenue Report', icon: IndianRupee, href: '/admin/reports/revenue', permission: 'reports.view' },
    ],
  },
  {
    key: 'management',
    label: 'Admin',
    icon: UserCog,
    permission: 'admin.users.view',
    items: [
      { label: 'Admin Users', icon: UserCog, href: '/admin/management/users', permission: 'admin.users.view' },
      { label: 'Roles & Permissions', icon: Shield, href: '/admin/management/roles', permission: 'admin.roles.manage' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    permission: 'settings.view',
    items: [
      { label: 'General', icon: Globe, href: '/admin/settings', permission: 'settings.view' },
      { label: 'Payment', icon: CreditCard, href: '/admin/settings/payment', permission: 'settings.manage' },
      { label: 'Tax', icon: Receipt, href: '/admin/settings/tax', permission: 'settings.manage' },
      { label: 'Notifications', icon: Bell, href: '/admin/settings/notifications', permission: 'settings.manage' },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const { logout, admin, can } = useAdminAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['dashboard']));

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Auto-expand section containing active route only when pathname changes (so collapse isn't overridden)
  useEffect(() => {
    const activeSection = sidebarSections.find(s =>
      s.items.some(item =>
        item.href === '/admin'
          ? location.pathname === '/admin'
          : location.pathname.startsWith(item.href)
      )
    );
    if (activeSection) {
      setOpenSections(prev => new Set(prev).add(activeSection.key));
    }
  }, [location.pathname]);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 ease-in-out',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Brand Area */}
      <div className="flex h-16 items-center border-b border-border/50 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-orange-600 shadow-lg shadow-accent/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div
            className={cn(
              'flex flex-col transition-all duration-300',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            )}
          >
            <span className="text-sm font-bold tracking-tight whitespace-nowrap">Varisca</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        {sidebarSections.map(section => {
          // Filter items by permission
          const visibleItems = section.items.filter(
            item => !item.permission || can(item.permission)
          );
          // Hide section if no items visible
          if (visibleItems.length === 0) return null;
          // If section requires permission and user doesn't have it
          if (section.permission && !can(section.permission)) return null;

          const isOpen = openSections.has(section.key);
          const isSingle = visibleItems.length === 1;

          // For single-item sections, render as direct link
          if (isSingle && collapsed) {
            const item = visibleItems[0];
            const isActive =
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href);

            return (
              <Tooltip key={section.key} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.href}
                    className={cn(
                      'flex items-center justify-center rounded-lg p-2.5 mb-1 transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {section.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          // Collapsed: show section icon with tooltip
          if (collapsed) {
            const hasActiveItem = visibleItems.some(item =>
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href)
            );

            return (
              <Tooltip key={section.key} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={visibleItems[0].href}
                    className={cn(
                      'flex items-center justify-center rounded-lg p-2.5 mb-1 transition-all duration-200',
                      hasActiveItem
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                    )}
                  >
                    <section.icon className="h-5 w-5 shrink-0" />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {section.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          // Expanded view with collapsible section
          return (
            <div key={section.key} className="mb-1">
              <button
                onClick={() => toggleSection(section.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200',
                  'text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/30'
                )}
              >
                <section.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                    isOpen ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="ml-2 border-l border-border/30 pl-2 space-y-0.5 py-1">
                  {visibleItems.map(item => {
                    const isActive =
                      item.href === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.href) &&
                          // Avoid matching /admin/orders when on /admin/orders/returns
                          (item.href.split('/').length >= location.pathname.split('/').length ||
                           location.pathname === item.href);

                    // More precise active check
                    const isExactActive = location.pathname === item.href ||
                      (item.href !== '/admin' && location.pathname.startsWith(item.href + '/'));

                    const active = item.href === '/admin' ? location.pathname === '/admin' : isExactActive || location.pathname === item.href;

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-200',
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border/50 p-3 space-y-2">
        {/* Admin Info */}
        {admin && !collapsed && (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {admin.name.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold truncate">{admin.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">
                {getRoleLabel(admin.role)}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-red-500/10 hover:text-red-500',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg border border-border/50 py-1.5 text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};

