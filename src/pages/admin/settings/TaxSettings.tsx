import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Receipt, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface TaxRule { id: string; name: string; rate: number; region: string; category: string; is_active: boolean; }

const TaxSettings = () => {
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TaxRule | null>(null);
  const [form, setForm] = useState({ name: '', rate: '', region: 'India', category: 'All', is_active: true });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: TaxRule[]}>('/settings/tax'); setRules(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (r?: TaxRule) => { if (r) { setEditing(r); setForm({ name: r.name, rate: String(r.rate), region: r.region, category: r.category, is_active: r.is_active }); } else { setEditing(null); setForm({ name: '', rate: '', region: 'India', category: 'All', is_active: true }); } setDialogOpen(true); };
  const handleSave = async () => { const body = { ...form, rate: +form.rate }; if (editing) await api.put(`/settings/tax/${editing.id}`, body); else await api.post('/settings/tax', body); setDialogOpen(false); load(); };

  const columns: Column<TaxRule>[] = [
    { key: 'name', header: 'Rule', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'rate', header: 'Rate', render: (r) => <span className="font-semibold">{r.rate}%</span> },
    { key: 'region', header: 'Region' },
    { key: 'category', header: 'Category' },
    { key: 'is_active', header: 'Active', render: (r) => <span className={r.is_active ? 'text-green-600' : 'text-gray-500'}>{r.is_active ? 'Yes' : 'No'}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Tax Settings</h1><p className="text-muted-foreground">Manage GST and tax rules</p></div>
        <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Rule</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={rules} columns={columns} searchPlaceholder="Search tax rules..." searchFields={['name', 'region']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { for (const id of ids) await api.delete(`/settings/tax/${id}`); load(); } }]}
            emptyMessage="No tax rules" emptyIcon={<Receipt className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Tax Rule' : 'Add Tax Rule'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Rate (%)</label><Input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Region</label><Input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Category</label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><label className="text-sm font-medium">Active</label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name || !form.rate}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxSettings;
