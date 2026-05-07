// ─── RBAC Permission System ─────────────────────────────────────────
// Production-grade role-based access control for the admin panel.

export type AdminRole = 'super_admin' | 'admin' | 'product_manager' | 'finance_manager' | 'support_executive';

export type Permission =
  // Dashboard
  | 'dashboard.view'
  // Catalog
  | 'catalog.view' | 'catalog.products.manage' | 'catalog.categories.manage'
  | 'catalog.brands.manage' | 'catalog.attributes.manage' | 'catalog.inventory.manage'
  // Orders
  | 'orders.view' | 'orders.manage' | 'orders.returns.manage' | 'orders.refunds.manage'
  // Customers
  | 'customers.view' | 'customers.manage'
  // Marketing
  | 'marketing.view' | 'marketing.coupons.manage' | 'marketing.banners.manage' | 'marketing.campaigns.manage'
  // Finance
  | 'finance.view' | 'finance.transactions.view' | 'finance.payouts.manage' | 'finance.refunds.manage'
  // Shipping
  | 'shipping.view' | 'shipping.zones.manage' | 'shipping.charges.manage' | 'shipping.partners.manage'
  // Reports
  | 'reports.view' | 'reports.export'
  // Admin Management
  | 'admin.users.view' | 'admin.users.manage' | 'admin.roles.manage'
  // Settings
  | 'settings.view' | 'settings.manage';

// ─── Role → Permission Matrix ───────────────────────────────────────

const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: [
    'dashboard.view',
    'catalog.view', 'catalog.products.manage', 'catalog.categories.manage',
    'catalog.brands.manage', 'catalog.attributes.manage', 'catalog.inventory.manage',
    'orders.view', 'orders.manage', 'orders.returns.manage', 'orders.refunds.manage',
    'customers.view', 'customers.manage',
    'marketing.view', 'marketing.coupons.manage', 'marketing.banners.manage', 'marketing.campaigns.manage',
    'finance.view', 'finance.transactions.view', 'finance.payouts.manage', 'finance.refunds.manage',
    'shipping.view', 'shipping.zones.manage', 'shipping.charges.manage', 'shipping.partners.manage',
    'reports.view', 'reports.export',
    'admin.users.view', 'admin.users.manage', 'admin.roles.manage',
    'settings.view', 'settings.manage',
  ],

  admin: [
    'dashboard.view',
    'catalog.view', 'catalog.products.manage', 'catalog.categories.manage',
    'catalog.brands.manage', 'catalog.attributes.manage', 'catalog.inventory.manage',
    'orders.view', 'orders.manage', 'orders.returns.manage', 'orders.refunds.manage',
    'customers.view', 'customers.manage',
    'marketing.view', 'marketing.coupons.manage', 'marketing.banners.manage', 'marketing.campaigns.manage',
    'finance.view', 'finance.transactions.view',
    'shipping.view', 'shipping.zones.manage', 'shipping.charges.manage', 'shipping.partners.manage',
    'reports.view', 'reports.export',
    'settings.view', 'settings.manage',
  ],

  product_manager: [
    'dashboard.view',
    'catalog.view', 'catalog.products.manage', 'catalog.categories.manage',
    'catalog.brands.manage', 'catalog.attributes.manage', 'catalog.inventory.manage',
    'orders.view',
    'customers.view',
    'reports.view',
  ],

  finance_manager: [
    'dashboard.view',
    'orders.view',
    'customers.view',
    'finance.view', 'finance.transactions.view', 'finance.payouts.manage', 'finance.refunds.manage',
    'reports.view', 'reports.export',
  ],

  support_executive: [
    'dashboard.view',
    'orders.view', 'orders.manage', 'orders.returns.manage', 'orders.refunds.manage',
    'customers.view', 'customers.manage',
    'shipping.view',
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────

/** Normalise legacy roles (e.g. 'manager' → 'admin') */
const normaliseRole = (role: string): AdminRole =>
  (role === 'manager' ? 'admin' : role) as AdminRole;

export const hasPermission = (role: string | undefined, permission: Permission): boolean => {
  if (!role) return false;
  const perms = rolePermissions[normaliseRole(role)];
  return perms ? perms.includes(permission) : false;
};

export const hasAnyPermission = (role: string | undefined, permissions: Permission[]): boolean => {
  return permissions.some(p => hasPermission(role, p));
};

export const getPermissionsForRole = (role: string | undefined): Permission[] => {
  if (!role) return [];
  return rolePermissions[normaliseRole(role)] || [];
};

export const getAllRoles = (): AdminRole[] => {
  return Object.keys(rolePermissions) as AdminRole[];
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    manager: 'Admin',
    product_manager: 'Product Manager',
    finance_manager: 'Finance Manager',
    support_executive: 'Support Executive',
  };
  return labels[role] || role;
};
