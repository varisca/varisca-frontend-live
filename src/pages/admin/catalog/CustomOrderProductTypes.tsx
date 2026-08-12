import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  CustomOrderProductType,
  deleteCustomOrderProductType,
  getCustomOrderProductTypes,
  saveCustomOrderProductType,
} from '@/lib/customOrderProductTypes';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pencil, Plus, Shirt, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  slug: '',
  image: '',
  base_price: '499',
  original_price: '749',
  sort_order: '0',
  is_active: true,
};

const CustomOrderProductTypes = () => {
  const [types, setTypes] = useState<CustomOrderProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomOrderProductType | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      setTypes(await getCustomOrderProductTypes(true));
    } catch (err) {
      toast.error('Failed to load custom order product types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDialog = (type?: CustomOrderProductType) => {
    if (type) {
      setEditing(type);
      setForm({
        name: type.name,
        slug: type.slug,
        image: type.image || '',
        base_price: String(type.base_price),
        original_price: String(type.original_price),
        sort_order: String(type.sort_order),
        is_active: type.is_active,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const body = {
      name: form.name,
      slug: form.slug,
      image: form.image,
      base_price: Number(form.base_price || 0),
      original_price: Number(form.original_price || 0),
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active,
    };

    try {
      await saveCustomOrderProductType(body, editing?.id);
      setDialogOpen(false);
      await load();
      toast.success(editing ? 'Product type updated' : 'Product type added');
    } catch (err) {
      toast.error('Failed to save product type', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const columns: Column<CustomOrderProductType>[] = [
    {
      key: 'name',
      header: 'Product Type',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-10 overflow-hidden rounded-md bg-muted">
            {r.image ? (
              <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Shirt className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'base_price', header: 'Base Price', render: (r) => <span>₹{r.base_price.toFixed(2)}</span> },
    { key: 'original_price', header: 'MRP', render: (r) => <span>₹{r.original_price.toFixed(2)}</span> },
    { key: 'sort_order', header: 'Sort' },
    {
      key: 'is_active',
      header: 'Active',
      render: (r) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.is_active ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
          {r.is_active ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Shirt className="h-5 w-5" /> Custom Order Types
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage product types shown on the Custom Order page.
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Add Type
        </Button>
      </div>

      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            data={types}
            columns={columns}
            searchPlaceholder="Search product types..."
            searchFields={['name', 'slug']}
            emptyMessage="No custom order product types"
            emptyIcon={<Shirt className="h-10 w-10" />}
            onRowClick={openDialog}
            bulkActions={[
              {
                label: 'Delete',
                icon: <Trash2 className="mr-1 h-3.5 w-3.5" />,
                variant: 'destructive' as const,
                confirmTitle: 'Delete product types',
                confirmMessage: 'Are you sure you want to delete the selected product types?',
                onClick: async (ids) => {
                  for (const id of ids) await deleteCustomOrderProductType(id);
                  await load();
                },
              },
            ]}
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product Type' : 'Add Product Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="/images/custom-order/type.png" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Base Price</label>
                <Input type="number" value={form.base_price} onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">MRP</label>
                <Input type="number" value={form.original_price} onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.base_price}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomOrderProductTypes;
