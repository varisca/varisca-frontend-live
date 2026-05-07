import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Template { id: string; name: string; type: string; event: string; subject: string; body: string; is_active: boolean; }

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: '', type: 'email', event: '', subject: '', body: '', is_active: true });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Template[]}>('/settings/notifications'); setTemplates(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (t?: Template) => { if (t) { setEditing(t); setForm({ name: t.name, type: t.type, event: t.event, subject: t.subject, body: t.body, is_active: t.is_active }); } else { setEditing(null); setForm({ name: '', type: 'email', event: '', subject: '', body: '', is_active: true }); } setDialogOpen(true); };
  const handleSave = async () => { if (editing) await api.put(`/settings/notifications/${editing.id}`, form); else await api.post('/settings/notifications', form); setDialogOpen(false); load(); };

  const columns: Column<Template>[] = [
    { key: 'name', header: 'Template', render: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.event}</p></div>) },
    { key: 'type', header: 'Type', render: (r) => <span className={`capitalize text-xs px-2 py-0.5 rounded ${r.type === 'email' ? 'bg-blue-500/10 text-blue-600' : r.type === 'sms' ? 'bg-green-500/10 text-green-600' : 'bg-purple-500/10 text-purple-600'}`}>{r.type}</span> },
    { key: 'subject', header: 'Subject' },
    { key: 'is_active', header: 'Active', render: (r) => <span className={r.is_active ? 'text-green-600' : 'text-gray-500'}>{r.is_active ? 'Yes' : 'No'}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Notification Templates</h1><p className="text-muted-foreground">Email, SMS & push templates</p></div>
        <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> Add Template</Button>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={templates} columns={columns} searchPlaceholder="Search templates..." searchFields={['name', 'event']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { for (const id of ids) await api.delete(`/settings/notifications/${id}`); load(); } }]}
            emptyMessage="No templates" emptyIcon={<Bell className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Template' : 'Add Template'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Type</label><Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem><SelectItem value="push">Push</SelectItem></SelectContent></Select></div>
              <div><label className="text-sm font-medium">Event</label><Input value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))} placeholder="order.placed" /></div>
            </div>
            <div><label className="text-sm font-medium">Subject</label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Body</label><Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><label className="text-sm font-medium">Active</label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name || !form.event}>{editing ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationTemplates;
