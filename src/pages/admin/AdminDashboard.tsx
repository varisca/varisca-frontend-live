import { useState, useEffect, useCallback, useMemo } from 'react';
import { IndianRupee, ShoppingBag, Users, TrendingUp, Package, ArrowUpRight, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { getOrders, getOrderStats, type Order } from '@/lib/orderStore';
import { getCustomers, type Customer } from '@/lib/customerStore';
import { getProducts } from '@/lib/productStore';
import { formatPrice } from '@/lib/data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, paymentDone: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.allSettled([
        getOrders(),
        getCustomers(),
        getProducts(undefined, { skipAdminAuth: false }),
      ]);
      if (ordersRes.status === 'fulfilled') {
        const ordersData = Array.isArray(ordersRes.value) ? ordersRes.value : (ordersRes.value as any)?.data || [];
        setOrders(ordersData);
      } else {
        setError('Failed to load dashboard data. Please check if the backend is running.');
      }
      if (customersRes.status === 'fulfilled') {
        const custData = Array.isArray(customersRes.value) ? customersRes.value : (customersRes.value as any)?.data || [];
        setCustomers(custData);
      }
      if (productsRes.status === 'fulfilled') {
        const prodData = productsRes.value as any;
        setProductCount(prodData?.total ?? prodData?.data?.length ?? 0);
      }
      // Load stats separately
      try {
        const s: any = await getOrderStats();
        if (s) setStats({
          totalRevenue: Number(s.totalRevenue ?? s.total_revenue ?? 0),
          totalOrders: Number(s.totalOrders ?? s.total_orders ?? 0),
          pendingOrders: Number(s.pendingOrders ?? s.pending ?? 0),
          deliveredOrders: Number(s.deliveredOrders ?? s.delivered ?? 0),
          paymentDone: Number(s.payment_done ?? s.paymentDone ?? 0),
        });
      } catch { /* stats optional */ }
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const recentOrders = orders.slice(0, 5);

  // Build order status chart from real data
  const orderStatusChartData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Refunded: 0,
    };
    const statusColorMap: Record<string, string> = {
      Pending: 'hsl(45 93% 47%)',
      Processing: 'hsl(217 91% 60%)',
      Shipped: 'hsl(271 81% 56%)',
      Delivered: 'hsl(142 71% 45%)',
      Cancelled: 'hsl(0 84% 60%)',
      Refunded: 'hsl(0 0% 60%)',
    };
    orders.forEach(o => {
      const label = o.status.charAt(0).toUpperCase() + o.status.slice(1);
      if (statusCounts[label] !== undefined) statusCounts[label]++;
    });
    return Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        fill: statusColorMap[status] || 'hsl(0 0% 60%)',
      }));
  }, [orders]);

  // Top products by number of times ordered
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; image: string; price: number; count: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const key = item.product_id || item.name;
        if (!productSales[key]) {
          productSales[key] = { name: item.name, image: item.image || '', price: item.price, count: 0 };
        }
        productSales[key].count += item.qty;
      });
    });
    return Object.values(productSales).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [orders]);

  // Stat cards with real data
  const dashboardStatCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      change: orders.length > 0 ? `${orders.length} orders` : 'No data yet',
      trend: 'up' as const,
      icon: IndianRupee,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: `${stats.pendingOrders} pending`,
      trend: 'up' as const,
      icon: ShoppingBag,
    },
    {
      title: 'Customers',
      value: customers.length.toString(),
      change: customers.length > 0 ? 'Active' : 'None yet',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Payment Done',
      value: stats.paymentDone.toString(),
      change: 'Paid orders',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      title: 'Products',
      value: productCount.toString(),
      change: 'In catalog',
      trend: 'up' as const,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's an overview of your store.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <LoadingSpinner />
        </div>
      ) : (
        <>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStatCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Bottom Row: Recent Orders + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="col-span-2 rounded-xl border border-border/50 bg-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div>
              <h3 className="text-sm font-semibold">Recent Orders</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest transactions</p>
            </div>
            <a href="/admin/orders" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No orders yet. Orders will appear here when customers place them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-medium">{order.order_number}</td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground/70">{order.customer_email}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium text-right">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Order Status Chart */}
          {orderStatusChartData.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Order Status</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Distribution by status</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={orderStatusChartData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="status" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {orderStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Products */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Top Selling Products</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/50 text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    {product.image && (
                      <img src={product.image} alt={product.name} className="h-9 w-9 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-[11px] text-muted-foreground">{product.count} sold</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{formatPrice(product.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Quick Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Orders</span>
                <span className="font-semibold">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivered Orders</span>
                <span className="font-semibold">{stats.deliveredOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Customers</span>
                <span className="font-semibold">{customers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-semibold">{productCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default AdminDashboard;
