import { useState, useEffect } from 'react';
import { TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SalesDay { date: string; orders: number; revenue: number; items: number; }

const SalesReport = () => {
  const [data, setData] = useState<SalesDay[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get<{data: SalesDay[]}>('/reports/sales').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalRevenue = data.reduce((s, d) => s + Number(d.revenue), 0);
  const totalOrders = data.reduce((s, d) => s + Number(d.orders), 0);
  const totalItems = data.reduce((s, d) => s + Number(d.items), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Sales Report</h1><p className="text-muted-foreground">Daily sales breakdown (last 90 days)</p></div>
        <Button variant="outline" onClick={() => exportToCsv(data.map(d => ({ Date: d.date, Orders: d.orders, Revenue: d.revenue, Items: d.items })), 'sales-report')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p></div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Items Sold</p><p className="text-2xl font-bold">{totalItems}</p></div>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="p-4 border-b"><h3 className="font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Daily Sales</h3></div>
            <div className="overflow-auto max-h-[500px]"><table className="w-full"><thead className="bg-muted/50 sticky top-0"><tr><th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Orders</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Revenue</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Items</th></tr></thead>
            <tbody>{data.length === 0 ? <tr><td colSpan={4} className="text-center p-8 text-muted-foreground">No sales data yet. Create some orders first.</td></tr> : data.map(d => (<tr key={d.date} className="border-b last:border-0 hover:bg-muted/30"><td className="p-3 text-sm font-medium">{d.date}</td><td className="p-3 text-sm text-right">{d.orders}</td><td className="p-3 text-sm text-right font-semibold">₹{Number(d.revenue).toLocaleString()}</td><td className="p-3 text-sm text-right">{d.items}</td></tr>))}</tbody></table></div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
