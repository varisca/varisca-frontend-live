import { useState, useEffect } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Plus, Pencil, Trash2, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/admin/utils/export';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Campaign { id: string; name: string; subject: string; body: string; recipient_count: number; status: string; scheduled_date: string | null; sent_date: string | null; open_rate: number; click_rate: number; }

const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '', recipient_count: '', status: 'draft' });

  const load = async () => { setLoading(true); try { const res = await api.get<{data: Campaign[]}>('/marketing/campaigns'); setCampaigns(res.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openDialog = (c?: Campaign) => { if (c) { setEditing(c); setForm({ name: c.name, subject: c.subject, body: c.body, recipient_count: String(c.recipient_count), status: c.status }); } else { setEditing(null); setForm({ name: '', subject: '', body: '', recipient_count: '', status: 'draft' }); } setDialogOpen(true); };
  const handleSave = async () => { const body = { ...form, recipient_count: +form.recipient_count }; if (editing) await api.put(`/marketing/campaigns/${editing.id}`, body); else await api.post('/marketing/campaigns', body); setDialogOpen(false); load(); };

  const columns: Column<Campaign>[] = [
    { key: 'name', header: 'Campaign', render: (r) => (<div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.subject}</p></div>) },
    { key: 'recipient_count', header: 'Recipients' },
    { key: 'open_rate', header: 'Open Rate', render: (r) => <span className="text-sm">{r.open_rate}%</span> },
    { key: 'click_rate', header: 'Click Rate', render: (r) => <span className="text-sm">{r.click_rate}%</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.status === 'sent' ? 'bg-green-500/10 text-green-600' : r.status === 'draft' ? 'bg-gray-500/10 text-gray-500' : 'bg-blue-500/10 text-blue-600'}`}>{r.status}</span> },
    { key: 'actions', header: '', sortable: false, render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(r); }}><Pencil className="h-3.5 w-3.5" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Email Campaigns</h1><p className="text-muted-foreground">Manage email campaigns</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv(campaigns.map(c => ({ Name: c.name, Subject: c.subject, Recipients: c.recipient_count, OpenRate: c.open_rate, Status: c.status })), 'campaigns')} className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={() => openDialog()} className="gap-2"><Plus className="h-4 w-4" /> New Campaign</Button>
        </div>
      </div>
      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable data={campaigns} columns={columns} searchPlaceholder="Search campaigns..." searchFields={['name', 'subject']} onRowClick={openDialog}
            bulkActions={[{ label: 'Delete', icon: <Trash2 className="h-3.5 w-3.5 mr-1" />, variant: 'destructive' as const, confirmTitle: 'Delete', confirmMessage: 'Are you sure you want to delete?', onClick: async (ids) => { await api.post('/marketing/campaigns/bulk-delete', { ids }); load(); } }]}
            emptyMessage="No campaigns" emptyIcon={<Mail className="h-10 w-10" />} />
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Campaign' : 'New Campaign'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Subject</label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Body</label><Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} /></div>
            <div><label className="text-sm font-medium">Recipients</label><Input type="number" value={form.recipient_count} onChange={e => setForm(f => ({ ...f, recipient_count: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Status</label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['draft','scheduled','sent','cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.name}>{editing ? 'Save' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailCampaigns;
