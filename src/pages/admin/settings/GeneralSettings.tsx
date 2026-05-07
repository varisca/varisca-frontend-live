import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save } from 'lucide-react';
import { api } from '@/lib/api/client';

interface GeneralConfig { storeName: string; storeUrl: string; storeEmail: string; storePhone: string; currency: string; locale: string; timezone: string; maintenanceMode: boolean; }

const defaults: GeneralConfig = { storeName: 'Varisca', storeUrl: 'https://varisca.com', storeEmail: 'varisca.team@gmail.com', storePhone: '+91 88668 60624', currency: 'INR', locale: 'en-IN', timezone: 'Asia/Kolkata', maintenanceMode: false };

const GeneralSettings = () => {
  const [config, setConfig] = useState<GeneralConfig>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get<{key: string; value: GeneralConfig}>('/settings/kv/general').then(r => setConfig(r.value)).catch(() => {}); }, []);

  const handleSave = async () => { await api.put('/settings/kv/general', { value: config }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">General Settings</h1><p className="text-muted-foreground">Store configuration</p></div>
        <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> {saved ? 'Saved ✓' : 'Save Changes'}</Button>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
          <h3 className="font-medium flex items-center gap-2"><Settings className="h-4 w-4" /> Store Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Store Name</label><Input value={config.storeName} onChange={e => setConfig(c => ({ ...c, storeName: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Store URL</label><Input value={config.storeUrl} onChange={e => setConfig(c => ({ ...c, storeUrl: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Email</label><Input value={config.storeEmail} onChange={e => setConfig(c => ({ ...c, storeEmail: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Phone</label><Input value={config.storePhone} onChange={e => setConfig(c => ({ ...c, storePhone: e.target.value }))} /></div>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
          <h3 className="font-medium">Locale & Region</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Currency</label><Select value={config.currency} onValueChange={v => setConfig(c => ({ ...c, currency: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem><SelectItem value="EUR">EUR (€)</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm font-medium">Locale</label><Select value={config.locale} onValueChange={v => setConfig(c => ({ ...c, locale: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en-IN">English (India)</SelectItem><SelectItem value="en-US">English (US)</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm font-medium">Timezone</label><Select value={config.timezone} onValueChange={v => setConfig(c => ({ ...c, timezone: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem><SelectItem value="UTC">UTC</SelectItem></SelectContent></Select></div>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center justify-between"><div><h3 className="font-medium">Maintenance Mode</h3><p className="text-sm text-muted-foreground">Temporarily disable the storefront</p></div>
            <Switch checked={config.maintenanceMode} onCheckedChange={v => setConfig(c => ({ ...c, maintenanceMode: v }))} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
