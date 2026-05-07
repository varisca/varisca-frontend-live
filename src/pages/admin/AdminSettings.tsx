import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Plus, Shield, Bell, Store, Users } from 'lucide-react';
import { toast } from 'sonner';

const teamMembers = [
  { name: 'Varisca Admin', email: 'admin@varisca.com', role: 'Super Admin', joined: 'Mar 2025' },
  { name: 'Store Manager', email: 'manager@varisca.com', role: 'Manager', joined: 'Jun 2025' },
];

const AdminSettings = () => {
  const [storeName, setStoreName] = useState('Varisca');
  const [storeDescription, setStoreDescription] = useState('Premium handcrafted Indian ethnic wear — Sarees, Lehengas, Suits & Accessories');
  const [currency, setCurrency] = useState('INR');
  const [orderNotif, setOrderNotif] = useState(true);
  const [stockNotif, setStockNotif] = useState(true);
  const [customerNotif, setCustomerNotif] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved', { description: 'Your changes have been applied.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your store configuration</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="gap-2 data-[state=active]:shadow-sm">
            <Store className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" /> Team
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">Store Information</h3>
              <div className="grid gap-5 max-w-lg">
                <div className="grid gap-2">
                  <Label>Store Name</Label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="bg-muted/30 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label>Store Description</Label>
                  <Textarea value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} rows={3} className="bg-muted/30 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label>Currency</Label>
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-muted/30 border-border/50 w-32" />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold mb-4">Store Logo</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-orange-600 text-2xl font-bold text-white shadow-lg">
                  V
                </div>
                <div>
                  <Button variant="outline" size="sm">Upload New Logo</Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <Separator />

            <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-accent to-orange-600 text-white hover:opacity-90">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
            <h3 className="text-sm font-semibold mb-2">Email Notifications</h3>
            <p className="text-xs text-muted-foreground mb-4">Configure which notifications you receive via email.</p>

            <div className="space-y-4 max-w-lg">
              {[
                { label: 'New Order', desc: 'Get notified when a new order is placed', value: orderNotif, setter: setOrderNotif },
                { label: 'Low Stock Alert', desc: 'Alert when product inventory is below threshold', value: stockNotif, setter: setStockNotif },
                { label: 'New Customer', desc: 'Notification when a new customer registers', value: customerNotif, setter: setCustomerNotif },
                { label: 'Newsletter Subscribers', desc: 'Weekly digest of new subscribers', value: newsletter, setter: setNewsletter },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={item.setter} />
                </div>
              ))}
            </div>

            <Separator />

            <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-accent to-orange-600 text-white hover:opacity-90">
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="rounded-xl border border-border/50 bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Team Members</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage admin access to the dashboard.</p>
              </div>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-accent to-orange-600 text-white hover:opacity-90">
                <Plus className="h-4 w-4" />
                Invite Member
              </Button>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.email} className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-orange-500/20 text-xs font-bold text-accent">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === 'Super Admin' ? 'default' : 'secondary'} className="text-[10px]">
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{member.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
