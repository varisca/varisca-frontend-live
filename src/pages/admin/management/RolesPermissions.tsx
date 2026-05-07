import { getAllRoles, getRoleLabel, getPermissionsForRole, type AdminRole, type Permission } from '@/lib/admin/utils/permissions';
import { Shield, Check, X } from 'lucide-react';

const allPermissions: { group: string; perms: Permission[] }[] = [
  { group: 'Dashboard', perms: ['dashboard.view'] },
  { group: 'Catalog', perms: ['catalog.view', 'catalog.products.manage', 'catalog.categories.manage', 'catalog.brands.manage', 'catalog.attributes.manage', 'catalog.inventory.manage'] },
  { group: 'Orders', perms: ['orders.view', 'orders.manage', 'orders.returns.manage', 'orders.refunds.manage'] },
  { group: 'Customers', perms: ['customers.view', 'customers.manage'] },
  { group: 'Marketing', perms: ['marketing.view', 'marketing.coupons.manage', 'marketing.banners.manage', 'marketing.campaigns.manage'] },
  { group: 'Finance', perms: ['finance.view', 'finance.transactions.view', 'finance.payouts.manage', 'finance.refunds.manage'] },
  { group: 'Shipping', perms: ['shipping.view', 'shipping.zones.manage', 'shipping.charges.manage', 'shipping.partners.manage'] },
  { group: 'Reports', perms: ['reports.view', 'reports.export'] },
  { group: 'Admin', perms: ['admin.users.view', 'admin.users.manage', 'admin.roles.manage'] },
  { group: 'Settings', perms: ['settings.view', 'settings.manage'] },
];

const RolesPermissions = () => {
  const roles = getAllRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
        <p className="text-muted-foreground">Permission matrix for all admin roles</p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-medium sticky left-0 bg-muted/30 min-w-[200px]">Permission</th>
              {roles.map(role => (
                <th key={role} className="px-4 py-3 text-center font-medium min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs">{getRoleLabel(role)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allPermissions.map(group => (
              <>
                <tr key={group.group} className="bg-muted/10">
                  <td colSpan={roles.length + 1} className="px-4 py-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    {group.group}
                  </td>
                </tr>
                {group.perms.map(perm => (
                  <tr key={perm} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 sticky left-0 bg-card/50">
                      <span className="text-sm font-mono">{perm}</span>
                    </td>
                    {roles.map(role => {
                      const has = getPermissionsForRole(role).includes(perm);
                      return (
                        <td key={role} className="px-4 py-2.5 text-center">
                          {has ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-red-400/50 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 p-6">
        <h3 className="text-sm font-semibold mb-3">Role Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {roles.map(role => {
            const perms = getPermissionsForRole(role);
            return (
              <div key={role} className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{getRoleLabel(role)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{perms.length} permissions</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
