import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Banner { id: string; title: string; subtitle: string; image_url: string; link_url: string; position: string; status: string; clicks: number; impressions: number; }

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '', position: 'hero', status: 'active' });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Banner[]}>('/marketing/banners'); setBanners(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (b?: Banner) => { if (b) { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle, image_url: b.image_url, link_url: b.link_url, position: b.position, status: b.status }); } else { setEditing(null); setForm({ title: '', subtitle: '', image_url: '', link_url: '', position: 'hero', status: 'active' }); } setDialogOpen(true); };
  const handleSave = async () => { if (editing) await api.put(`/marketing/banners/${editing.id}`, form); else await api.post('/marketing/banners', form); setDialogOpen(false); load(); };

  const columns: Column<Banner>[] = [
    { key: 'title', header: 'Banner', render: (r) => (<div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.subtitle}</p></div>) },
    { key: 'position', header: 'Position', render: (r) => <span className="capitalize text-sm bg-muted px-2 py-0.5 rounded">{r.position}</span> },
    { key: 'clicks', header: 'Clicks', render: (r) => <span className="text-sm">{r.clicks}</span> },
    { key: 'impressions', header: 'Impressions', render: (r) => <span className="text-sm">{r.impressions}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>{r.status}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Banners</h1><p className="text-muted-foreground">Manage promotional banners</p></div>
        <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Banner</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={banners} columns={columns} searchPlaceholder="Search banners..." searchFields={['title']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { await api.post('/marketing/banners/bulk-delete', { ids }); load(); } }]}
            emptyMessage="No banners" emptyIcon={<Image className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Title</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Subtitle</label><Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Image URL</label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Link URL</label><Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Position</label><Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['hero','sidebar','footer','popup'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Status</label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['active','inactive','scheduled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.title}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Banners;
