import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Save } from 'lucide-react';
import { api } from '@/lib/api/client';

interface PayConfig { codEnabled: boolean; codLimit: number; upiEnabled: boolean; upiId: string; razorpayEnabled: boolean; razorpayKeyId: string; razorpayKeySecret: string; }

const defaults: PayConfig = { codEnabled: true, codLimit: 10000, upiEnabled: true, upiId: 'varisca@upi', razorpayEnabled: false, razorpayKeyId: '', razorpayKeySecret: '' };

const PaymentSettings = () => {
  const [config, setConfig] = useState<PayConfig>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get<{key: string; value: PayConfig}>('/settings/kv/payment').then(r => setConfig(r.value)).catch(() => {}); }, []);
  const handleSave = async () => { await api.put('/settings/kv/payment', { value: config }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1><p className="text-muted-foreground">Configure payment methods</p></div>
        <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> {saved ? 'Saved ✓' : 'Save Changes'}</Button>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" /> Cash on Delivery</h3><Switch checked={config.codEnabled} onCheckedChange={v => setConfig(c => ({ ...c, codEnabled: v }))} /></div>
          {config.codEnabled && <div><label className="text-sm font-medium">COD Limit (₹)</label><Input type="number" value={config.codLimit} onChange={e => setConfig(c => ({ ...c, codLimit: +e.target.value }))} /></div>}
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-medium">UPI Payments</h3><Switch checked={config.upiEnabled} onCheckedChange={v => setConfig(c => ({ ...c, upiEnabled: v }))} /></div>
          {config.upiEnabled && <div><label className="text-sm font-medium">UPI ID</label><Input value={config.upiId} onChange={e => setConfig(c => ({ ...c, upiId: e.target.value }))} /></div>}
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-medium">Razorpay</h3><Switch checked={config.razorpayEnabled} onCheckedChange={v => setConfig(c => ({ ...c, razorpayEnabled: v }))} /></div>
          {config.razorpayEnabled && <div className="space-y-4"><div><label className="text-sm font-medium">Key ID</label><Input value={config.razorpayKeyId} onChange={e => setConfig(c => ({ ...c, razorpayKeyId: e.target.value }))} /></div><div><label className="text-sm font-medium">Key Secret</label><Input type="password" value={config.razorpayKeySecret} onChange={e => setConfig(c => ({ ...c, razorpayKeySecret: e.target.value }))} /></div></div>}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
