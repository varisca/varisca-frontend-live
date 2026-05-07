import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Receipt, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface RefundLog { id: string; order_number: string; customer_name: string; amount: number; status: string; type: string; created_at: string; }

const RefundLogs = () => {
  const [logs, setLogs] = useState<RefundLog[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const res = await api.get<{data: RefundLog[]}>('/finance/transactions', { status: 'refunded' }); setLogs(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const columns: Column<RefundLog>[] = [
    { key: 'order_number', header: 'Order', render: (r) => <span className="font-mono text-sm">{r.order_number}</span> },
    { key: 'customer_name', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold text-red-500">-₹{Number(r.amount).toLocaleString()}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-600">{r.status}</span> },
    { key: 'created_at', header: 'Date', render: (r) => <span className="text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Refund Logs</h1><p className="text-muted-foreground">History of processed refunds</p></div>
        <Button variant="outline" onClick={() => exportToCsv(logs.map(l => ({ Order: l.order_number, Customer: l.customer_name, Amount: l.amount, Status: l.status })), 'refund-logs')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={logs} columns={columns} searchPlaceholder="Search refund logs..." searchFields={['order_number', 'customer_name']} emptyMessage="No refund logs" emptyIcon={<Receipt className="h-10 w-10" />} />
        )}
      </div>
    </div>
  );
};

export default RefundLogs;
