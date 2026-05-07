import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Refund { id: string; order_number: string; customer_name: string; amount: number; reason: string; status: string; request_date: string; processed_date: string | null; }

const RefundRequests = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Refund | null>(null);

  const load = async () => {
    setLoading(true);
    try { const res = await api.get<{data: Refund[]}>('/order-ops/refunds'); setRefunds(res.data); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/order-ops/refunds/${id}`, { status, processed_date: new Date().toISOString().split('T')[0] });
    load(); if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  };

  const columns: Column<Refund>[] = [
    { key: 'order_number', header: 'Order', render: (r) => <span className="font-mono text-sm font-medium">{r.order_number}</span> },
    { key: 'customer_name', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">₹{r.amount}</span> },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-sm truncate max-w-[200px] block">{r.reason}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'processed' ? 'bg-green-500/10 text-green-600' : r.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>{r.status}</span> },
    { key: 'request_date', header: 'Requested' },
  ];

  const stats = [
    { label: 'Total Requests', value: refunds.length },
    { label: 'Pending', value: refunds.filter(r => r.status === 'pending').length },
    { label: 'Approved', value: refunds.filter(r => r.status === 'approved').length },
    { label: 'Total Amount', value: `₹${refunds.reduce((s, r) => s + Number(r.amount), 0).toLocaleString()}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Refund Requests</h1><p className="text-muted-foreground">Process refund requests</p></div>
        <Button variant="outline" onClick={() => exportToCsv(refunds.map(r => ({ Order: r.order_number, Customer: r.customer_name, Amount: r.amount, Reason: r.reason, Status: r.status })), 'refunds')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="grid grid-cols-4 gap-4">{stats.map(s => (<div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>))}</div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={refunds} columns={columns} searchPlaceholder="Search refunds..." searchFields={['order_number', 'customer_name']}
            onRowClick={(r) => { setSelected(r); setDetailOpen(true); }} emptyMessage="No refund requests" emptyIcon={<Banknote className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>{selected && <><DialogHeader><DialogTitle>Refund — {selected.order_number}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selected.customer_name}</p></div><div><p className="text-muted-foreground">Amount</p><p className="font-semibold text-primary">₹{selected.amount}</p></div><div className="col-span-2"><p className="text-muted-foreground">Reason</p><p>{selected.reason}</p></div></div>
            <div><label className="text-sm font-medium">Update Status</label>
              <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['pending','approved','rejected','processed'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div><DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button></DialogFooter></>}</DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundRequests;
