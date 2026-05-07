import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Zone { id: string; name: string; pin_codes_from: string; pin_codes_to: string; state: string; delivery_days: number; is_active: boolean; }

const DeliveryZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [form, setForm] = useState({ name: '', pin_codes_from: '', pin_codes_to: '', state: 'Multiple', delivery_days: '3', is_active: true });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Zone[]}>('/shipping/zones'); setZones(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (z?: Zone) => { if (z) { setEditing(z); setForm({ name: z.name, pin_codes_from: z.pin_codes_from, pin_codes_to: z.pin_codes_to, state: z.state, delivery_days: String(z.delivery_days), is_active: z.is_active }); } else { setEditing(null); setForm({ name: '', pin_codes_from: '', pin_codes_to: '', state: 'Multiple', delivery_days: '3', is_active: true }); } setDialogOpen(true); };
  const handleSave = async () => { const body = { ...form, delivery_days: +form.delivery_days }; if (editing) await api.put(`/shipping/zones/${editing.id}`, body); else await api.post('/shipping/zones', body); setDialogOpen(false); load(); };

  const columns: Column<Zone>[] = [
    { key: 'name', header: 'Zone', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'pin_codes_from', header: 'PIN Range', render: (r) => <span className="font-mono text-sm">{r.pin_codes_from} — {r.pin_codes_to}</span> },
    { key: 'state', header: 'State' },
    { key: 'delivery_days', header: 'Days', render: (r) => <span>{r.delivery_days} days</span> },
    { key: 'is_active', header: 'Active', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.is_active ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>{r.is_active ? 'Yes' : 'No'}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Delivery Zones</h1><p className="text-muted-foreground">Manage delivery zones and PIN ranges</p></div>
        <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Zone</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={zones} columns={columns} searchPlaceholder="Search zones..." searchFields={['name', 'state']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { for (const id of ids) await api.delete(`/shipping/zones/${id}`); load(); } }]}
            emptyMessage="No delivery zones" emptyIcon={<MapPin className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Zone' : 'Add Zone'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Zone Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">PIN From</label><Input value={form.pin_codes_from} onChange={e => setForm(f => ({ ...f, pin_codes_from: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">PIN To</label><Input value={form.pin_codes_to} onChange={e => setForm(f => ({ ...f, pin_codes_to: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium">State</label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Delivery Days</label><Input type="number" value={form.delivery_days} onChange={e => setForm(f => ({ ...f, delivery_days: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><label className="text-sm font-medium">Active</label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryZones;
