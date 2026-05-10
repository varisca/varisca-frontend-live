import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Warehouse {
  id: string;
  name: string;
  registered_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pin: string;
  country: string;
  return_address: string;
  return_pin: string;
  return_city: string;
  return_state: string;
  return_country: string;
  created_at: string;
}

const emptyForm = {
  name: '',
  registered_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  pin: '',
  country: 'India',
  return_address: '',
  return_pin: '',
  return_city: '',
  return_state: '',
  return_country: 'India',
};

const DeliveryWarehouses = () => {
  const [list, setList] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Warehouse[] }>('/shipping/delhivery/warehouses');
      setList(res.data || []);
    } catch (e: unknown) {
      toast.error('Failed to load warehouses', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.pin.trim() || !form.return_address.trim()) {
      toast.error('Name, phone, pin, and return address are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/shipping/delhivery/warehouses', {
        name: form.name.trim(),
        registered_name: form.registered_name.trim() || undefined,
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        pin: form.pin.trim(),
        country: form.country.trim() || 'India',
        return_address: form.return_address.trim(),
        return_pin: form.return_pin.trim() || undefined,
        return_city: form.return_city.trim() || undefined,
        return_state: form.return_state.trim() || undefined,
        return_country: form.return_country.trim() || 'India',
      });
      toast.success('Warehouse registered', { description: 'Saved in Delhivery and your database.' });
      setForm(emptyForm);
      load();
    } catch (err: unknown) {
      toast.error('Could not create warehouse', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-7 w-7 text-accent" />
            Delivery — Warehouses
          </h1>
          <p className="text-muted-foreground">
            Register a Delhivery client warehouse (pickup location). Details are synced to Delhivery and stored locally.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh list
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add warehouse
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Name (pickup) *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Exact name — case-sensitive for orders"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone (POC) *</label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">PIN *</label>
                <Input value={form.pin} onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Registered name</label>
                <Input
                  value={form.registered_name}
                  onChange={(e) => setForm((f) => ({ ...f, registered_name: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Return address</p>
              <div>
                <label className="text-sm font-medium">Return address *</label>
                <Input
                  value={form.return_address}
                  onChange={(e) => setForm((f) => ({ ...f, return_address: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Return PIN</label>
                  <Input value={form.return_pin} onChange={(e) => setForm((f) => ({ ...f, return_pin: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Return city</label>
                  <Input value={form.return_city} onChange={(e) => setForm((f) => ({ ...f, return_city: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Return state</label>
                  <Input value={form.return_state} onChange={(e) => setForm((f) => ({ ...f, return_state: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Return country</label>
                  <Input value={form.return_country} onChange={(e) => setForm((f) => ({ ...f, return_country: e.target.value }))} className="mt-1" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
              {saving ? 'Saving…' : 'Register warehouse'}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[320px]">
          <h2 className="text-lg font-semibold mb-4">Saved warehouses</h2>
          {loading ? (
            <LoadingSpinner />
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No warehouses yet. Add one using the form.</p>
          ) : (
            <ul className="space-y-3 max-h-[560px] overflow-y-auto">
              {list.map((w) => (
                <li key={w.id} className="rounded-lg border border-border p-4 text-sm">
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-muted-foreground mt-1">
                    {w.city} — {w.pin} · {w.phone}
                  </p>
                  {w.email ? <p className="text-muted-foreground">{w.email}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryWarehouses;
