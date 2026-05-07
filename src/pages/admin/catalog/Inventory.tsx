import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Package, AlertTriangle, Download, Plus, Trash2 } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface InventoryItem { id: string; name: string; sku: string; category: string; inventory: number; price: number; status: string; image: string; }
interface InvStats { total: string; total_units: string; low_stock: string; out_of_stock: string; }

const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; sku: string }[]>([]);
  const [stats, setStats] = useState<InvStats>({ total: '0', total_units: '0', low_stock: '0', out_of_stock: '0' });
  const [filter, setFilter] = useState('all');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'in', quantity: '', reason: '' });
  const [addForm, setAddForm] = useState({ product_id: '', quantity: '', reason: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, st, prods] = await Promise.all([
        api.get<{data: InventoryItem[]}>('/inventory', { filter: filter !== 'all' ? filter : undefined }),
        api.get<InvStats>('/inventory/stats'),
        api.get<{ data: { id: string; name: string; sku: string }[] }>('/products', { limit: '500' }),
      ]);
      setItems(inv.data); setStats(st);
      setProducts(prods.data || []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [filter]);

  const handleAdjust = async () => {
    if (!selected) return;
    await api.post('/inventory/adjust', { product_id: selected.id, type: adjustForm.type, quantity: parseInt(adjustForm.quantity), reason: adjustForm.reason });
    setAdjustOpen(false); setAdjustForm({ type: 'in', quantity: '', reason: '' }); load();
    toast.success('Stock adjusted');
  };

  const handleAddInventory = async () => {
    if (!addForm.product_id || !addForm.quantity) return;
    await api.post('/inventory/adjust', { product_id: addForm.product_id, type: 'in', quantity: parseInt(addForm.quantity), reason: addForm.reason || 'Stock added' });
    setAddOpen(false); setAddForm({ product_id: '', quantity: '', reason: '' }); load();
    toast.success('Inventory added');
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/products/${deleteConfirm.id}`);
    setDeleteConfirm(null); load();
    toast.success('Inventory item removed');
  };

  const columns: Column<InventoryItem>[] = [
    { key: 'name', header: 'Product', render: (r) => (<div className="flex items-center gap-3"><div className="h-10 w-10 rounded bg-muted flex items-center justify-center">{r.image ? <img src={r.image} className="h-10 w-10 object-cover rounded" /> : <Package className="h-5 w-5 text-muted-foreground" />}</div><div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-muted-foreground">{r.sku}</p></div></div>) },
    { key: 'category', header: 'Category', render: (r) => <span className="capitalize text-sm">{r.category}</span> },
    { key: 'inventory', header: 'Stock', render: (r) => (<div className="flex items-center gap-2"><span className={`font-semibold ${r.inventory === 0 ? 'text-red-500' : r.inventory <= 10 ? 'text-amber-500' : 'text-green-600'}`}>{r.inventory}</span>{r.inventory <= 10 && r.inventory > 0 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}</div>) },
    { key: 'price', header: 'Price', render: (r) => <span className="text-sm">₹{r.price}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelected(r); setAdjustOpen(true); }}>Adjust</Button>
        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(r); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    ) },
  ];

  const exportColumns = [
    { header: 'Product', accessor: 'Product' as const },
    { header: 'SKU', accessor: 'SKU' as const },
    { header: 'Category', accessor: 'Category' as const },
    { header: 'Stock', accessor: 'Stock' as const },
    { header: 'Price', accessor: 'Price' as const },
  ];

  const handleExport = () => {
    const exportData = items.map(i => ({
      Product: i.name,
      SKU: i.sku,
      Category: i.category,
      Stock: i.inventory,
      Price: i.price,
    }));

    exportToCsv(exportData, exportColumns, 'inventory');
  };

  const statCards = [
    { label: 'Total Products', value: stats.total },
    { label: 'Total Units', value: stats.total_units },
    { label: 'Low Stock', value: stats.low_stock, color: 'text-amber-500' },
    { label: 'Out of Stock', value: stats.out_of_stock, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Inventory</h1><p className="text-muted-foreground">Stock levels and adjustments</p></div>
        <div className="flex gap-2">
          <Button onClick={() => setAddOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add inventory</Button>
          <Button variant="outline" onClick={handleExport} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">{statCards.map(s => (<div key={s.label} className="rounded-xl border border-border/50 bg-card/50 p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold ${s.color || ''}`}>{s.value}</p></div>))}</div>
      <div className="flex gap-2">
        {['all', 'low', 'out'].map(f => (<Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">{f === 'out' ? 'Out of Stock' : f === 'low' ? 'Low Stock' : 'All'}</Button>))}
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={items} columns={columns} searchPlaceholder="Search products..." searchFields={['name', 'sku']} emptyMessage="No inventory items" emptyIcon={<Package className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent><DialogHeader><DialogTitle>Adjust Stock — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Current stock: <span className="font-semibold">{selected?.inventory}</span></p>
            <div><label className="text-sm font-medium">Type</label><Select value={adjustForm.type} onValueChange={v => setAdjustForm(f => ({ ...f, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in">Stock In (+)</SelectItem><SelectItem value="out">Stock Out (-)</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm font-medium">Quantity</label><Input type="number" value={adjustForm.quantity} onChange={e => setAdjustForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Reason</label><Input value={adjustForm.reason} onChange={e => setAdjustForm(f => ({ ...f, reason: e.target.value }))} placeholder="Optional" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button><Button onClick={handleAdjust} disabled={!adjustForm.quantity}>Adjust</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add inventory</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Product *</label>
              <Select value={addForm.product_id} onValueChange={v => setAddForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Quantity *</label><Input type="number" min={1} value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 50" /></div>
            <div><label className="text-sm font-medium">Reason</label><Input value={addForm.reason} onChange={e => setAddForm(f => ({ ...f, reason: e.target.value }))} placeholder="Optional" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={handleAddInventory} disabled={!addForm.product_id || !addForm.quantity}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inventory item</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this inventory item? The product will be removed from the inventory list. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
