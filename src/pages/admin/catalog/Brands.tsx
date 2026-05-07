import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tag, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Brand { id: string; name: string; slug: string; logo: string; description: string; website: string; product_count: number; status: string; created_at: string; }

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', website: '', status: 'active' });
  const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Brand[] }>('/brands');
      setBrands(res.data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openDialog = (b?: Brand) => {
    if (b) { setEditing(b); setForm({ name: b.name, slug: b.slug, description: b.description || '', website: b.website || '', status: b.status }); }
    else { setEditing(null); setForm({ name: '', slug: '', description: '', website: '', status: 'active' }); }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const body = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), description: form.description, website: form.website, status: form.status };
    if (editing) await api.put(`/brands/${editing.id}`, body);
    else await api.post('/brands', body);
    setDialogOpen(false); load();
  };

  const handleDeleteOne = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/brands/${deleteConfirm.id}`);
    setDeleteConfirm(null); load();
    toast.success('Brand deleted');
  };

  const columns: Column<Brand>[] = [
    { key: 'name', header: 'Brand', render: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.slug}</p></div>) },
    { key: 'product_count', header: 'Products' },
    { key: 'website', header: 'Website', render: (r) => r.website ? <a href={r.website} className="text-sm text-primary hover:underline" target="_blank">{r.website}</a> : <span className="text-muted-foreground text-sm">—</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>{r.status}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(r); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Brands</h1><p className="text-muted-foreground">Manage product brands</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv(brands.map(b => ({ Name: b.name, Slug: b.slug, Products: b.product_count, Status: b.status })), 'brands')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Brand</Button>
        </div>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={brands} columns={columns} searchPlaceholder="Search brands..." searchFields={['name']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { await api.post('/brands/bulk-delete', { ids }); load(); } }]}
            emptyMessage="No brands" emptyIcon={<Tag className="h-10 w-10" />}
          />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Brand' : 'Add Brand'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Slug</label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" /></div>
            <div><label className="text-sm font-medium">Description</label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Website</label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Status</label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete brand</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this brand? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteOne}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Brands;
