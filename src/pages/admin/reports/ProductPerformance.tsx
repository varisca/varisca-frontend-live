import { useState, useEffect } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProductPerf { name: string; units_sold: number; revenue: number; orders: number; }

const ProductPerformance = () => {
  const [data, setData] = useState<ProductPerf[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api.get<{data: ProductPerf[]}>('/reports/products').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Product Performance</h1><p className="text-muted-foreground">Top performing products by revenue</p></div>
        <Button variant="outline" onClick={() => exportToCsv(data.map(d => ({ Product: d.name, UnitsSold: d.units_sold, Revenue: d.revenue, Orders: d.orders })), 'product-perf')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="rounded-xl border border-border/50 bg-card/50">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="p-4 border-b"><h3 className="font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Performance Table</h3></div>
            <div className="overflow-auto"><table className="w-full"><thead className="bg-muted/50"><tr><th className="text-left p-3 text-xs font-medium text-muted-foreground">#</th><th className="text-left p-3 text-xs font-medium text-muted-foreground">Product</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Units Sold</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Revenue</th><th className="text-right p-3 text-xs font-medium text-muted-foreground">Orders</th></tr></thead>
            <tbody>{data.length === 0 ? <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No sales data yet</td></tr> : data.map((d, i) => (<tr key={i} className="border-b last:border-0 hover:bg-muted/30"><td className="p-3 text-sm text-muted-foreground">{i + 1}</td><td className="p-3 text-sm font-medium">{d.name}</td><td className="p-3 text-sm text-right">{d.units_sold}</td><td className="p-3 text-sm text-right font-semibold">₹{Number(d.revenue).toLocaleString()}</td><td className="p-3 text-sm text-right">{d.orders}</td></tr>))}</tbody></table></div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPerformance;
