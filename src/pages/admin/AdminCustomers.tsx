import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Eye, Mail, ShoppingBag, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getCustomers, type Customer } from '@/lib/customerStore';
import { getOrders, type Order } from '@/lib/orderStore';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { formatPrice } from '@/lib/data';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [custRes, ordRes] = await Promise.allSettled([getCustomers(), getOrders()]);
      if (custRes.status === 'fulfilled') {
        const d = custRes.value as any;
        setCustomers(Array.isArray(d) ? d : d?.data || []);
      } else {
        setError('Failed to load customers. Is the backend running?');
      }
      if (ordRes.status === 'fulfilled') {
        const d = ordRes.value as any;
        setAllOrders(Array.isArray(d) ? d : d?.data || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('customers-updated', handler);
    window.addEventListener('orders-updated', handler);
    return () => {
      window.removeEventListener('customers-updated', handler);
      window.removeEventListener('orders-updated', handler);
    };
  }, [loadData]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search)
    );
  }, [customers, search]);

  const totalPages = Math.ceil(filteredCustomers.length / perPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Compute orders count and total spent from actual orders (by email match) so they always stay in sync
  const statsByEmail = useMemo(() => {
    const map: Record<string, { orders_count: number; total_spent: number; last_order_date: string | null }> = {};
    const excludeStatus = ['cancelled', 'refunded'];
    for (const o of allOrders) {
      if (excludeStatus.includes(o.status)) continue;
      const email = (o.customer_email || '').toLowerCase();
      if (!email) continue;
      if (!map[email]) {
        map[email] = { orders_count: 0, total_spent: 0, last_order_date: null };
      }
      map[email].orders_count += 1;
      map[email].total_spent += Number(o.total) || 0;
      const d = o.created_at ? new Date(o.created_at).toISOString() : null;
      if (d && (!map[email].last_order_date || d > map[email].last_order_date!)) {
        map[email].last_order_date = d;
      }
    }
    return map;
  }, [allOrders]);

  const getStats = (email: string) => {
    const key = (email || '').toLowerCase();
    return statsByEmail[key] ?? { orders_count: 0, total_spent: 0, last_order_date: null };
  };

  // Get customer's orders for the detail sheet
  const customerOrders = selectedCustomer
    ? allOrders.filter((o) => (o.customer_email || '').toLowerCase() === (selectedCustomer.email || '').toLowerCase())
    : [];
  const selectedStats = selectedCustomer ? getStats(selectedCustomer.email) : { orders_count: 0, total_spent: 0 };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">{customers.length} registered customers</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="pl-9 h-9 bg-muted/30 border-border/50"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No customers yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Customers will appear here when they log in or place orders on the storefront.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spent</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Order</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-orange-500/20 text-xs font-bold text-accent">
                            {customer.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{customer.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center h-6 min-w-[24px] rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
                          {getStats(customer.email).orders_count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-right">{formatPrice(getStats(customer.email).total_spent)}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {(customer.joined_date || customer.created_at) ? new Date(customer.joined_date || customer.created_at!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {getStats(customer.email).last_order_date ? new Date(getStats(customer.email).last_order_date!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedCustomer(customer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredCustomers.length)} of {filteredCustomers.length}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${currentPage === i + 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Detail Sheet */}
      <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedCustomer.name}</SheetTitle>
                <SheetDescription>{selectedCustomer.email}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Stats — computed from orders so they stay in sync */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{selectedStats.orders_count}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{formatPrice(selectedStats.total_spent)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
                  </div>
                </div>
                <Separator />

                {/* Contact */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Contact Info</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Email:</span> {selectedCustomer.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedCustomer.phone || 'Not provided'}</p>
                    <p><span className="text-muted-foreground">Address:</span> {selectedCustomer.address || 'Not provided'}</p>
                  </div>
                </div>
                <Separator />

                {/* Order History */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Order History</h4>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-3">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between rounded-lg border border-border/30 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at || '').toLocaleDateString('en-IN')} · {(order.items || []).length} item{(order.items || []).length > 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No orders yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminCustomers;
