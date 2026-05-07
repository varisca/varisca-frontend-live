import { useState, useEffect, useCallback, useMemo } from 'react';
import { getOrders, type Order } from '@/lib/orderStore';
import { getCustomers, type Customer } from '@/lib/customerStore';
import { getProducts } from '@/lib/productStore';
import { formatPrice, type Product } from '@/lib/data';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

const timeRanges = ['7D', '30D', '90D', '1Y'] as const;

const statusColorMap: Record<string, string> = {
  Pending: 'hsl(45 93% 47%)',
  Processing: 'hsl(217 91% 60%)',
  Shipped: 'hsl(271 81% 56%)',
  Delivered: 'hsl(142 71% 45%)',
  Cancelled: 'hsl(0 84% 60%)',
  Refunded: 'hsl(0 0% 60%)',
};

const categoryColorMap: Record<string, string> = {
  men: 'hsl(217 91% 60%)',
  women: 'hsl(330 80% 55%)',
  unisex: 'hsl(142 71% 45%)',
};

const AdminAnalytics = () => {
  const [range, setRange] = useState<typeof timeRanges[number]>('30D');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [ordRes, custRes, prodRes] = await Promise.allSettled([
        getOrders(),
        getCustomers(),
        getProducts(undefined, { skipAdminAuth: false }),
      ]);
      if (ordRes.status === 'fulfilled') {
        const d = ordRes.value as any;
        setOrders(Array.isArray(d) ? d : d?.data || []);
      }
      if (custRes.status === 'fulfilled') {
        const d = custRes.value as any;
        setCustomers(Array.isArray(d) ? d : d?.data || []);
      }
      if (prodRes.status === 'fulfilled') {
        const d = prodRes.value as any;
        setProducts(Array.isArray(d) ? d : d?.data || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('orders-updated', handler);
    window.addEventListener('customers-updated', handler);
    window.addEventListener('products-updated', handler);
    return () => {
      window.removeEventListener('orders-updated', handler);
      window.removeEventListener('customers-updated', handler);
      window.removeEventListener('products-updated', handler);
    };
  }, [loadData]);

  // Build revenue chart data from orders (group by date)
  const revenueChartData = useMemo(() => {
    const dateMap: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach(o => {
      if (o.status !== 'cancelled' && o.status !== 'refunded') {
        const d = o.created_at || '';
        if (!dateMap[d]) dateMap[d] = { revenue: 0, orders: 0 };
        dateMap[d].revenue += o.total;
        dateMap[d].orders += 1;
      }
    });
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: data.revenue,
        orders: data.orders,
      }));
  }, [orders]);

  // Order status chart
  const orderStatusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      const label = o.status.charAt(0).toUpperCase() + o.status.slice(1);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      fill: statusColorMap[status] || 'hsl(0 0% 60%)',
    }));
  }, [orders]);

  // Category breakdown from orders
  const categoryChartData = useMemo(() => {
    const catRevenue: Record<string, number> = {};
    let totalRev = 0;
    orders.forEach(o => {
      if (o.status !== 'cancelled' && o.status !== 'refunded') {
        o.items.forEach(item => {
          const prod = products.find(p => p.id === (item as any).product_id);
          const cat = prod?.category || 'other';
          catRevenue[cat] = (catRevenue[cat] || 0) + (item.price * item.qty);
          totalRev += item.price * item.qty;
        });
      }
    });
    return Object.entries(catRevenue).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: totalRev > 0 ? Math.round((value / totalRev) * 100) : 0,
      fill: categoryColorMap[name] || 'hsl(45 93% 47%)',
    }));
  }, [orders, products]);

  const hasData = orders.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Insights into your store's performance</p>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border/50 bg-card flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No data yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Analytics will populate when customers start placing orders.
          </p>
        </div>
      ) : (
        <>
          {/* Row 1: Revenue + Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="text-sm font-semibold mb-1">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground mb-6">Total revenue by date</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(16 90% 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(16 90% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(16 90% 55%)" strokeWidth={2.5} fill="url(#analyticsRevenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Orders Over Time */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h3 className="text-sm font-semibold mb-1">Orders Over Time</h3>
              <p className="text-xs text-muted-foreground mb-6">Number of orders placed</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="orders" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Category Breakdown + Order Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status */}
            <div className="col-span-2 rounded-xl border border-border/50 bg-card p-6">
              <h3 className="text-sm font-semibold mb-1">Order Status Distribution</h3>
              <p className="text-xs text-muted-foreground mb-6">Current order status breakdown</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={orderStatusChartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="status" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {orderStatusChartData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            {categoryChartData.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="text-sm font-semibold mb-1">Category Breakdown</h3>
                <p className="text-xs text-muted-foreground mb-6">Revenue share by category</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} strokeWidth={0}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cat-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => [`${value}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryChartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
