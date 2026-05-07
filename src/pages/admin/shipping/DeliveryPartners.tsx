import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Truck, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Partner { id: string; name: string; code: string; phone: string; email: string; zones: string[]; is_active: boolean; total_deliveries: number; rating: number; }

const DeliveryPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState({ name: '', code: '', phone: '', email: '', zones: '', is_active: true });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Partner[]}>('/shipping/partners'); setPartners(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (p?: Partner) => { if (p) { setEditing(p); setForm({ name: p.name, code: p.code, phone: p.phone, email: p.email, zones: (p.zones || []).join(', '), is_active: p.is_active }); } else { setEditing(null); setForm({ name: '', code: '', phone: '', email: '', zones: '', is_active: true }); } setDialogOpen(true); };
  const handleSave = async () => { const body = { ...form, zones: form.zones.split(',').map(z => z.trim()).filter(Boolean) }; if (editing) await api.put(`/shipping/partners/${editing.id}`, body); else await api.post('/shipping/partners', body); setDialogOpen(false); load(); };

  const columns: Column<Partner>[] = [
    { key: 'name', header: 'Partner', render: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.code}</p></div>) },
    { key: 'phone', header: 'Phone' },
    { key: 'zones', header: 'Zones', render: (r) => <div className="flex flex-wrap gap-1">{(r.zones || []).map(z => <span key={z} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{z}</span>)}</div> },
    { key: 'total_deliveries', header: 'Deliveries' },
    { key: 'rating', header: 'Rating', render: (r) => <span className="text-sm">⭐ {r.rating}</span> },
    { key: 'is_active', header: 'Active', render: (r) => <span className={r.is_active ? 'text-green-600' : 'text-gray-500'}>{r.is_active ? 'Yes' : 'No'}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Delivery Partners</h1><p className="text-muted-foreground">Manage logistics partners</p></div>
        <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Partner</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={partners} columns={columns} searchPlaceholder="Search partners..." searchFields={['name', 'code']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { for (const id of ids) await api.delete(`/shipping/partners/${id}`); load(); } }]}
            emptyMessage="No delivery partners" emptyIcon={<Truck className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Partner' : 'Add Partner'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Code</label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} maxLength={10} /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div><div><label className="text-sm font-medium">Email</label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div></div>
            <div><label className="text-sm font-medium">Zones (comma-separated)</label><Input value={form.zones} onChange={e => setForm(f => ({ ...f, zones: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><label className="text-sm font-medium">Active</label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name || !form.code}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryPartners;
