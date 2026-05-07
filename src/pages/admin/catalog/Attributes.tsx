import { useState, useEffect, useMemo } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SlidersHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import type { CatalogCategoryRow } from '@/lib/admin/catalogOptions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const SCOPE_NONE = '__none__';

interface Attribute {
  id: string;
  name: string;
  type: string;
  values: string[];
  used_in_products: number;
  created_at: string;
  scope_parent_category_id?: string | null;
  scope_subcategory_id?: string | null;
}

const Attributes = () => {
  const [attrs, setAttrs] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<CatalogCategoryRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    type: 'text',
    valuesStr: '',
    scopeParentId: SCOPE_NONE,
    scopeSubId: SCOPE_NONE,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<Attribute | null>(null);

  const topLevel = useMemo(
    () => categories.filter((c) => !c.parent_id).sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const subOptions = useMemo(() => {
    if (form.scopeParentId === SCOPE_NONE) {
      return categories.filter((c) => c.parent_id).sort((a, b) => a.name.localeCompare(b.name));
    }
    return categories
      .filter((c) => c.parent_id === form.scopeParentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, form.scopeParentId]);

  const load = async () => {
    try {
      const res = await api.get<{ data: Attribute[] }>('/attributes', { limit: '500' });
      setAttrs(res.data);
    } catch {
      toast.error('Could not load attributes');
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get<{ data: CatalogCategoryRow[] }>('/categories');
      setCategories(res.data || []);
    } catch {
      /* optional */
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([load(), loadCategories()]);
    } catch (error) {
      console.error('Failed to load initial data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);



  const openDialog = (a?: Attribute) => {
    if (a) {
      setEditing(a);
      setForm({
        name: a.name,
        type: a.type,
        valuesStr: (a.values || []).join(', '),
        scopeParentId: a.scope_subcategory_id ? SCOPE_NONE : (a.scope_parent_category_id || SCOPE_NONE),
        scopeSubId: a.scope_subcategory_id || SCOPE_NONE,
      });
    } else {
      setEditing(null);
      setForm({ name: '', type: 'text', valuesStr: '', scopeParentId: SCOPE_NONE, scopeSubId: SCOPE_NONE });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const values = form.valuesStr.split(',').map((v) => v.trim()).filter(Boolean);
    let scope_parent_category_id: string | null = null;
    let scope_subcategory_id: string | null = null;
    if (form.scopeSubId !== SCOPE_NONE) {
      scope_subcategory_id = form.scopeSubId;
    } else if (form.scopeParentId !== SCOPE_NONE) {
      scope_parent_category_id = form.scopeParentId;
    }
    const body = {
      name: form.name,
      type: form.type,
      values,
      scope_parent_category_id,
      scope_subcategory_id,
    };
    try {
      if (editing) await api.put(`/attributes/${editing.id}`, body);
      else await api.post('/attributes', body);
      setDialogOpen(false);
      load();
      toast.success(editing ? 'Attribute updated' : 'Attribute created');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const handleDeleteOne = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/attributes/${deleteConfirm.id}`);
    setDeleteConfirm(null);
    load();
    toast.success('Attribute deleted');
  };

  const scopeLabel = (a: Attribute) => {
    if (a.scope_subcategory_id) {
      const sub = categories.find((c) => c.id === a.scope_subcategory_id);
      return sub ? `Sub: ${sub.name}` : 'Subcategory';
    }
    if (a.scope_parent_category_id) {
      const p = categories.find((c) => c.id === a.scope_parent_category_id);
      return p ? `Category: ${p.name}` : 'Category';
    }
    return 'All products';
  };

  const columns: Column<Attribute>[] = [
    { key: 'name', header: 'Attribute', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className="capitalize text-sm bg-muted px-2 py-0.5 rounded">{r.type}</span> },
    { key: 'scope', header: 'Scope', render: (r) => <span className="text-xs text-muted-foreground">{scopeLabel(r)}</span> },
    {
      key: 'values',
      header: 'Values',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {(r.values || []).slice(0, 5).map((v) => (
            <span key={v} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {v}
            </span>
          ))}
          {(r.values || []).length > 5 && (
            <span className="text-xs text-muted-foreground">+{r.values.length - 5} more</span>
          )}
        </div>
      ),
    },
    { key: 'used_in_products', header: 'Used In' },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openDialog(r);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirm(r);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attributes</h1>
          <p className="text-muted-foreground">
            Manage product attributes. Values appear on Add Product; optional scope limits them to a category or subcategory.
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Add Attribute
        </Button>
      </div>
      {/* <DataTable
        data={attrs}
        columns={columns}
        searchPlaceholder="Search attributes..."
        searchFields={['name']}
        onRowClick={openDialog}
        bulkActions={[
          {
            label: 'Delete',
            icon: <Trash2 className="h-3.5 w-3.5 mr-1" />,
            variant: 'destructive' as const,
            confirmTitle: 'Delete',
            confirmMessage: 'Are you sure you want to delete?',
            onClick: async (ids) => {
              await api.post('/attributes/bulk-delete', { ids });
              load();
            },
          },
        ]}
        emptyMessage="No attributes"
        emptyIcon={<SlidersHorizontal className="h-10 w-10" />}
      /> */}

      <div className="border rounded-md p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            data={attrs}
            columns={columns}
            searchPlaceholder="Search attributes..."
            searchFields={['name']}
            onRowClick={openDialog}
            bulkActions={[
              {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1" />,
                variant: 'destructive' as const,
                confirmTitle: 'Delete',
                confirmMessage: 'Are you sure you want to delete?',
                onClick: async (ids) => {
                  await api.post('/attributes/bulk-delete', { ids });
                  load();
                },
              },
            ]}
            emptyMessage="No attributes"
            emptyIcon={<SlidersHorizontal className="h-10 w-10" />}
          />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Fit, Sleeve Length, Neck Type"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Values (comma-separated)</label>
              <Input
                value={form.valuesStr}
                onChange={(e) => setForm((f) => ({ ...f, valuesStr: e.target.value }))}
                placeholder="S, M, L, XL"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Limit to category (optional)</label>
              <p className="text-xs text-muted-foreground mb-1">
                Applies this value list to all products under that top-level category, unless a subcategory scope is set below.
              </p>
              <Select
                value={form.scopeParentId}
                onValueChange={(v) => setForm((f) => ({ ...f, scopeParentId: v, scopeSubId: SCOPE_NONE }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SCOPE_NONE}>All categories</SelectItem>
                  {topLevel.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Limit to subcategory (optional)</label>
              <p className="text-xs text-muted-foreground mb-1">
                Strongest filter: only products with this subcategory see these values.
              </p>
              <Select
                value={form.scopeSubId}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    scopeSubId: v,
                    scopeParentId: v === SCOPE_NONE ? f.scopeParentId : SCOPE_NONE,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SCOPE_NONE}>None</SelectItem>
                  {subOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attribute? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteOne}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Attributes;
