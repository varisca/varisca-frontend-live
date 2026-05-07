import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { ArrowDownUp, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Transaction { id: string; order_number: string; customer_name: string; amount: number; method: string; status: string; type: string; created_at: string; }
interface TxnStats { total_revenue: string; total_transactions: string; pending_amount: string; total_refunds: string; }

const Transactions = () => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TxnStats>({ total_revenue: '0', total_transactions: '0', pending_amount: '0', total_refunds: '0' });

  const load = async () => { setLoading(true); try { const [t, s] = await Promise.all([api.get<{data: Transaction[]}>('/finance/transactions'), api.get<TxnStats>('/finance/transactions/stats')]); setTxns(t.data); setStats(s); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const columns: Column<Transaction>[] = [
    { key: 'order_number', header: 'Order', render: (r) => <span className="font-mono text-sm">{r.order_number}</span> },
    { key: 'customer_name', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">₹{Number(r.amount).toLocaleString()}</span> },
    { key: 'method', header: 'Method', render: (r) => <span className="capitalize text-sm">{r.method}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.type === 'refund' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>{r.type}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'completed' ? 'bg-green-500/10 text-green-600' : r.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}>{r.status}</span> },
    { key: 'created_at', header: 'Date', render: (r) => <span className="text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  const statCards = [
    { label: 'Total Revenue', value: `₹${Number(stats.total_revenue).toLocaleString()}` },
    { label: 'Transactions', value: stats.total_transactions },
    { label: 'Pending', value: `₹${Number(stats.pending_amount).toLocaleString()}` },
    { label: 'Refunds', value: `₹${Number(stats.total_refunds).toLocaleString()}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Transactions</h1><p className="text-muted-foreground">Payment transactions</p></div>
        <Button variant="outline" onClick={() => exportToCsv(txns.map(t => ({ Order: t.order_number, Customer: t.customer_name, Amount: t.amount, Method: t.method, Type: t.type, Status: t.status })), 'transactions')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="grid grid-cols-4 gap-4">{statCards.map(s => (<div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>))}</div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={txns} columns={columns} searchPlaceholder="Search transactions..." searchFields={['order_number', 'customer_name']} emptyMessage="No transactions" emptyIcon={<ArrowDownUp className="h-10 w-10" />} />
        )}
      </div>
    </div>
  );
};

export default Transactions;
