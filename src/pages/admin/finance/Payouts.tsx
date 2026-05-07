import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Payout { id: string; partner: string; amount: number; status: string; method: string; reference: string; created_at: string; }

const Payouts = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payout | null>(null);
  const [form, setForm] = useState({ partner: '', amount: '', status: 'pending', method: 'Bank Transfer', reference: '' });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Payout[]}>('/finance/payouts'); setPayouts(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (p?: Payout) => { if (p) { setEditing(p); setForm({ partner: p.partner, amount: String(p.amount), status: p.status, method: p.method, reference: p.reference }); } else { setEditing(null); setForm({ partner: '', amount: '', status: 'pending', method: 'Bank Transfer', reference: '' }); } setDialogOpen(true); };
  const handleSave = async () => { const body = { ...form, amount: +form.amount }; if (editing) await api.put(`/finance/payouts/${editing.id}`, body); else await api.post('/finance/payouts', body); setDialogOpen(false); load(); };

  const columns: Column<Payout>[] = [
    { key: 'partner', header: 'Partner', render: (r) => <span className="font-medium">{r.partner}</span> },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">₹{Number(r.amount).toLocaleString()}</span> },
    { key: 'method', header: 'Method' },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'completed' ? 'bg-green-500/10 text-green-600' : r.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>{r.status}</span> },
    { key: 'created_at', header: 'Date', render: (r) => <span className="text-sm">{new Date(r.created_at).toLocaleDateString()}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Payouts</h1><p className="text-muted-foreground">Partner payout management</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv(payouts.map(p => ({ Partner: p.partner, Amount: p.amount, Method: p.method, Status: p.status, Reference: p.reference })), 'payouts')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> New Payout</Button>
        </div>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={payouts} columns={columns} searchPlaceholder="Search payouts..." searchFields={['partner', 'reference']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { for (const id of ids) await api.delete(`/finance/payouts/${id}`); load(); } }]}
            emptyMessage="No payouts" emptyIcon={<Wallet className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Payout' : 'New Payout'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Partner</label><Input value={form.partner} onChange={e => setForm(f => ({ ...f, partner: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Amount (₹)</label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Method</label><Input value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Reference</label><Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Status</label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['pending','processing','completed','failed'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.partner || !form.amount}>{editing ? 'Save' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payouts;
