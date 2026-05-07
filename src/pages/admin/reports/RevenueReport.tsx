import { useState, useEffect } from 'react';
import { IndianRupee, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface RevMonth { month: string; orders: number; revenue: number; avg_value: number; }

const RevenueReport = () => {
  const [data, setData] = useState<RevMonth[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get<{data: RevMonth[]}>('/reports/revenue').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalRevenue = data.reduce((s, d) => s + Number(d.revenue), 0);
  const totalOrders = data.reduce((s, d) => s + Number(d.orders), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Revenue Report</h1><p className="text-muted-foreground">Monthly revenue breakdown</p></div>
        <Button variant="outline" onClick={() => exportToCsv(data.map(d => ({ Month: d.month, Orders: d.orders, Revenue: d.revenue, AvgValue: d.avg_value })), 'revenue-report')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p></div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">Avg Order Value</p><p className="text-2xl font-bold">₹{avgOrderValue.toLocaleString()}</p></div>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="p-4 border-b"><h3 className="font-medium flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Monthly Revenue</h3></div>
            <div className="overflow-auto"><table className="w-full"><thead className="bg-muted/50"><tr><th className="text-left p-3 text-xs font-medium text-muted-foreground">Month</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Orders</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Revenue</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Avg Value</th></tr></thead>
            <tbody>{data.length === 0 ? <tr><td colSpan={4} className="text-center p-8 text-muted-foreground">No revenue data yet</td></tr> : data.map(d => (<tr key={d.month} className="border-b last:border-0 hover:bg-muted/30"><td className="p-3 text-sm font-medium">{d.month}</td><td className="p-3 text-sm text-right">{d.orders}</td><td className="p-3 text-sm text-right font-semibold">₹{Number(d.revenue).toLocaleString()}</td><td className="p-3 text-sm text-right">₹{Number(d.avg_value).toLocaleString()}</td></tr>))}</tbody></table></div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueReport;
