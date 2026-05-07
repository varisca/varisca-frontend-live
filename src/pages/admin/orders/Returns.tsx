import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ReturnItem { id: string; order_number: string; customer_name: string; customer_email: string; reason: string; status: string; request_date: string; processed_date: string | null; }

const Returns = () => {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ReturnItem | null>(null);

  const load = async () => {
    setLoading(true);
    try { const res = await api.get<{data: ReturnItem[]}>('/order-ops/returns'); setReturns(res.data); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/order-ops/returns/${id}`, { status, processed_date: new Date().toISOString().split('T')[0] });
    load(); if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  };

  const columns: Column<ReturnItem>[] = [
    { key: 'order_number', header: 'Order', render: (r) => <span className="font-mono text-sm font-medium">{r.order_number}</span> },
    { key: 'customer_name', header: 'Customer' },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-sm truncate max-w-[200px] block">{r.reason}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'refunded' ? 'bg-green-500/10 text-green-600' : r.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>{r.status}</span> },
    { key: 'request_date', header: 'Requested' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Returns</h1><p className="text-muted-foreground">Manage return requests</p></div>
        <Button variant="outline" onClick={() => exportToCsv(returns.map(r => ({ Order: r.order_number, Customer: r.customer_name, Reason: r.reason, Status: r.status, Date: r.request_date })), 'returns')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={returns} columns={columns} searchPlaceholder="Search returns..." searchFields={['order_number', 'customer_name']}
            onRowClick={(r) => { setSelected(r); setDetailOpen(true); }} emptyMessage="No return requests" emptyIcon={<RotateCcw className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>{selected && <><DialogHeader><DialogTitle>Return — {selected.order_number}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selected.customer_name}</p></div><div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{selected.status}</p></div><div className="col-span-2"><p className="text-muted-foreground">Reason</p><p>{selected.reason}</p></div></div>
            <div><label className="text-sm font-medium">Update Status</label>
              <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['requested','approved','rejected','received','refunded'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div><DialogFooter><Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button></DialogFooter></>}</DialogContent>
      </Dialog>
    </div>
  );
};

export default Returns;
