import { useState, useEffect } from 'react';
import { Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface CustStats { total: string; total_revenue: string; avg_ltv: string; repeat_customers: string; }
interface TopCustomer { id: string; name: string; email: string; orders_count: number; total_spent: number; }

const CustomerAnalytics = () => {
  const [stats, setStats] = useState<CustStats>({ total: '0', total_revenue: '0', avg_ltv: '0', repeat_customers: '0' });
  const [top, setTop] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get<{stats: CustStats; top_customers: TopCustomer[]}>('/reports/customers').then(r => { setStats(r.stats); setTop(r.top_customers); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Customers', value: stats.total },
    { label: 'Total Revenue', value: `₹${Number(stats.total_revenue).toLocaleString()}` },
    { label: 'Average LTV', value: `₹${Number(stats.avg_ltv).toLocaleString()}` },
    { label: 'Repeat Customers', value: stats.repeat_customers },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Customer Analytics</h1><p className="text-muted-foreground">Customer metrics and top spenders</p></div>
        <Button variant="outline" onClick={() => exportToCsv(top.map(c => ({ Name: c.name, Email: c.email, Orders: c.orders_count, Spent: c.total_spent })), 'customer-analytics')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="grid grid-cols-4 gap-4">{statCards.map(s => (<div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>))}</div>
      <div className="rounded-xl border border-border/50 bg-card/50">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="p-4 border-b"><h3 className="font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Top 10 Customers</h3></div>
            <div className="overflow-auto"><table className="w-full"><thead className="bg-muted/50"><tr><th className="text-left p-3 text-xs font-medium text-muted-foreground">#</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Customer</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Email</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Orders</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Spent</th></tr></thead>
            <tbody>{top.length === 0 ? <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No customer data yet</td></tr> : top.map((c, i) => (<tr key={c.id} className="border-b last:border-0 hover:bg-muted/30"><td className="p-3 text-sm text-muted-foreground">{i + 1}</td><td className="p-3 text-sm font-medium">{c.name}</td><td className="p-3 text-sm">{c.email}</td><td className="p-3 text-sm text-right">{c.orders_count}</td><td className="p-3 text-sm text-right font-semibold">₹{Number(c.total_spent).toLocaleString()}</td></tr>))}</tbody></table></div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerAnalytics;
