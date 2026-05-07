import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Coupon { id: string; code: string; type: string; value: number; min_order: number; max_discount: number; usage_limit: number; used_count: number; status: string; start_date: string; end_date: string; }

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order: '', max_discount: '', usage_limit: '100', status: 'active', start_date: '', end_date: '' });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Coupon[]}>('/marketing/coupons'); setCoupons(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (c?: Coupon) => { if (c) { setEditing(c); setForm({ code: c.code, type: c.type, value: String(c.value), min_order: String(c.min_order), max_discount: String(c.max_discount), usage_limit: String(c.usage_limit), status: c.status, start_date: c.start_date || '', end_date: c.end_date || '' }); } else { setEditing(null); setForm({ code: '', type: 'percentage', value: '', min_order: '', max_discount: '', usage_limit: '100', status: 'active', start_date: '', end_date: '' }); } setDialogOpen(true); };
  const handleSave = async () => { const body = { ...form, value: +form.value, min_order: +form.min_order, max_discount: +form.max_discount, usage_limit: +form.usage_limit }; if (editing) await api.put(`/marketing/coupons/${editing.id}`, body); else await api.post('/marketing/coupons', body); setDialogOpen(false); load(); };

  const columns: Column<Coupon>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono font-medium text-primary">{r.code}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize text-sm">{r.type}</span> },
    { key: 'value', header: 'Value', render: (r) => <span>{r.type === 'percentage' ? `${r.value}%` : `₹${r.value}`}</span> },
    { key: 'used_count', header: 'Usage', render: (r) => <span className="text-sm">{r.used_count}/{r.usage_limit}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>{r.status}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Coupons</h1><p className="text-muted-foreground">Manage discount codes</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv(coupons.map(c => ({ Code: c.code, Type: c.type, Value: c.value, Usage: `${c.used_count}/${c.usage_limit}`, Status: c.status })), 'coupons')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Coupon</Button>
        </div>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={coupons} columns={columns} searchPlaceholder="Search coupons..." searchFields={['code']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { await api.post('/marketing/coupons/bulk-delete', { ids }); load(); } }]}
            emptyMessage="No coupons" emptyIcon={<Ticket className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Code</label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Type</label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-medium">Value</label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Min Order (₹)</label><Input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Max Discount (₹)</label><Input type="number" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium">Usage Limit</label><Input type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Status</label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.code || !form.value}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;
