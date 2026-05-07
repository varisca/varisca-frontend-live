import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FolderTree, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Category { id: string; name: string; slug: string; description: string; parent_id: string | null; product_count: number; status: string; created_at: string; }

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '', status: 'active' });
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Category[]}>('/categories'); setCategories(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (c?: Category) => {
    if (c) { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', parentId: c.parent_id || '', status: c.status }); }
    else { setEditing(null); setForm({ name: '', slug: '', description: '', parentId: '', status: 'active' }); }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const body = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), description: form.description, parent_id: form.parentId || null, status: form.status };
    if (editing) await api.put(`/categories/${editing.id}`, body);
    else await api.post('/categories', body);
    setDialogOpen(false); load();
  };

  const parentName = (id: string | null) => { if (!id) return '—'; const p = categories.find(c => c.id === id); return p?.name || '—'; };

  const handleDeleteOne = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/categories/${deleteConfirm.id}`);
    setDeleteConfirm(null); load();
    toast.success('Category deleted');
  };

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Category', render: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.slug}</p></div>) },
    { key: 'parent_id', header: 'Parent', render: (r) => <span className="text-sm">{parentName(r.parent_id)}</span> },
    { key: 'product_count', header: 'Products' },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>{r.status}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(r); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    ) },
  ];

  const stats = [
    { label: 'Total', value: categories.length },
    { label: 'Active', value: categories.filter(c => c.status === 'active').length },
    { label: 'Top-level', value: categories.filter(c => !c.parent_id).length },
    { label: 'Sub-categories', value: categories.filter(c => c.parent_id).length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Categories</h1><p className="text-muted-foreground">Manage product categories</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv(categories.map(c => ({ Name: c.name, Slug: c.slug, Parent: parentName(c.parent_id), Products: c.product_count, Status: c.status })), 'categories')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">{stats.map(s => (<div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>))}</div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={categories} columns={columns} searchPlaceholder="Search categories..." searchFields={['name', 'slug']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { await api.post('/categories/bulk-delete', { ids }); load(); } }]}
            emptyMessage="No categories" emptyIcon={<FolderTree className="h-10 w-10" />}
          />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Slug</label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" /></div>
            <div><label className="text-sm font-medium">Description</label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Parent</label>
              <Select value={form.parentId} onValueChange={v => setForm(f => ({ ...f, parentId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{categories.filter(c => c.id !== editing?.id).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this category? This action cannot be undone.</AlertDialogDescription>
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

export default Categories;
