import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCog, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AdminUser { id: string; name: string; email: string; role: string; status: string; last_login: string | null; created_at: string; }

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', status: 'active' });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: AdminUser[]}>('/admin-users'); setUsers(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (u?: AdminUser) => { if (u) { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, status: u.status }); } else { setEditing(null); setForm({ name: '', email: '', password: '', role: 'admin', status: 'active' }); } setDialogOpen(true); };
  const handleSave = async () => { const body: any = { name: form.name, email: form.email, role: form.role, status: form.status }; if (form.password) body.password = form.password; if (editing) await api.put(`/admin-users/${editing.id}`, body); else { body.password = form.password || 'admin123'; await api.post('/admin-users', body); } setDialogOpen(false); load(); };

  const columns: Column<AdminUser>[] = [
    { key: 'name', header: 'Admin', render: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>) },
    { key: 'role', header: 'Role', render: (r) => <span className="capitalize text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">{r.role.replace('_', ' ')}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{r.status}</span> },
    { key: 'last_login', header: 'Last Login', render: (r) => <span className="text-sm text-muted-foreground">{r.last_login ? new Date(r.last_login).toLocaleString() : 'Never'}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Admin Users</h1><p className="text-muted-foreground">Manage admin accounts</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv(users.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Status: u.status })), 'admin-users')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Admin</Button>
        </div>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={users} columns={columns} searchPlaceholder="Search admins..." searchFields={['name', 'email']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { for (const id of ids) await api.delete(`/admin-users/${id}`); load(); } }]}
            emptyMessage="No admin users" emptyIcon={<UserCog className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Admin' : 'Add Admin'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Password {editing ? '(leave blank to keep)' : ''}</label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editing ? '••••••' : 'Enter password'} /></div>
            <div><label className="text-sm font-medium">Role</label><Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['super_admin','admin','product_manager','finance_manager','support_executive'].map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-sm font-medium">Status</label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name || !form.email}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
