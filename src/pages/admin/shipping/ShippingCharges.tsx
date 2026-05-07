import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { IndianRupee, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Charge { id: string; zone: string; min_weight: number; max_weight: number; base_cost: number; per_kg_cost: number; free_above: number; is_active: boolean; }

const ShippingCharges = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Charge | null>(null);
  const [form, setForm] = useState({ zone: '', min_weight: '0', max_weight: '5', base_cost: '', per_kg_cost: '', free_above: '', is_active: true });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Charge[]}>('/shipping/charges'); setCharges(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (c?: Charge) => { if (c) { setEditing(c); setForm({ zone: c.zone, min_weight: String(c.min_weight), max_weight: String(c.max_weight), base_cost: String(c.base_cost), per_kg_cost: String(c.per_kg_cost), free_above: String(c.free_above), is_active: c.is_active }); } else { setEditing(null); setForm({ zone: '', min_weight: '0', max_weight: '5', base_cost: '', per_kg_cost: '', free_above: '', is_active: true }); } setDialogOpen(true); };
  const handleSave = async () => { const body = { zone: form.zone, min_weight: +form.min_weight, max_weight: +form.max_weight, base_cost: +form.base_cost, per_kg_cost: +form.per_kg_cost, free_above: +form.free_above, is_active: form.is_active }; if (editing) await api.put(`/shipping/charges/${editing.id}`, body); else await api.post('/shipping/charges', body); setDialogOpen(false); load(); };

  const columns: Column<Charge>[] = [
    { key: 'zone', header: 'Zone', render: (r) => <span className="font-medium">{r.zone}</span> },
    { key: 'min_weight', header: 'Weight', render: (r) => <span className="text-sm">{r.min_weight} — {r.max_weight} kg</span> },
    { key: 'base_cost', header: 'Base Cost', render: (r) => <span>₹{r.base_cost}</span> },
    { key: 'per_kg_cost', header: 'Per KG', render: (r) => <span>₹{r.per_kg_cost}</span> },
    { key: 'free_above', header: 'Free Above', render: (r) => <span>₹{r.free_above}</span> },
    { key: 'is_active', header: 'Active', render: (r) => <span className={r.is_active ? 'text-green-600' : 'text-gray-500'}>{r.is_active ? 'Yes' : 'No'}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Shipping Charges</h1><p className="text-muted-foreground">Manage shipping rates by zone</p></div>
        <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Rate</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={charges} columns={columns} searchPlaceholder="Search..." searchFields={['zone']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { for (const id of ids) await api.delete(`/shipping/charges/${id}`); load(); } }]}
            emptyMessage="No shipping charges" emptyIcon={<IndianRupee className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Rate' : 'Add Rate'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Zone</label><Input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Min Weight (kg)</label><Input type="number" value={form.min_weight} onChange={e => setForm(f => ({ ...f, min_weight: e.target.value }))} /></div><div><label className="text-sm font-medium">Max Weight (kg)</label><Input type="number" value={form.max_weight} onChange={e => setForm(f => ({ ...f, max_weight: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Base Cost (₹)</label><Input type="number" value={form.base_cost} onChange={e => setForm(f => ({ ...f, base_cost: e.target.value }))} /></div><div><label className="text-sm font-medium">Per KG (₹)</label><Input type="number" value={form.per_kg_cost} onChange={e => setForm(f => ({ ...f, per_kg_cost: e.target.value }))} /></div></div>
            <div><label className="text-sm font-medium">Free Above (₹)</label><Input type="number" value={form.free_above} onChange={e => setForm(f => ({ ...f, free_above: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><label className="text-sm font-medium">Active</label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.zone}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShippingCharges;
