import { useEffect, useState } from 'react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  addBanner,
  deleteBanner,
  deleteBanners,
  ensureBannerSeeded,
  getBanners,
  type BannerPosition,
  type BannerRecord,
  type BannerStatus,
  updateBanner,
} from '@/lib/bannerStore';
import { fileToBase64 } from '@/lib/productStore';

type BannerFormState = {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  position: BannerPosition;
  status: BannerStatus;
};

const emptyForm: BannerFormState = {
  title: '',
  subtitle: '',
  image_url: '',
  link_url: '/shop',
  position: 'hero',
  status: 'active',
};

const Banners = () => {
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BannerRecord | null>(null);
  const [form, setForm] = useState<BannerFormState>(emptyForm);

  const load = () => {
    setLoading(true);
    ensureBannerSeeded();
    setBanners(getBanners());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openDialog = (banner?: BannerRecord) => {
    if (banner) {
      setEditing(banner);
      setForm({
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.image_url,
        link_url: banner.link_url,
        position: banner.position,
        status: banner.status,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (file?: File | null) => {
    if (!file) return;
    const encoded = await fileToBase64(file);
    setForm((current) => ({ ...current, image_url: encoded }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        updateBanner(editing.id, form);
      } else {
        addBanner(form);
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<BannerRecord>[] = [
    {
      key: 'banner',
      header: 'Banner',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-md border bg-muted">
            <img src={row.image_url} alt={row.title} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground">{row.subtitle || 'No subtitle'}</p>
          </div>
        </div>
      ),
      sortValue: (row) => row.title,
      minWidth: 260,
    },
    {
      key: 'position',
      header: 'Position',
      render: (row) => <span className="capitalize text-sm bg-muted px-2 py-0.5 rounded">{row.position}</span>,
    },
    {
      key: 'link_url',
      header: 'Link',
      render: (row) => <span className="text-sm text-muted-foreground">{row.link_url || '-'}</span>,
      minWidth: 180,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${row.status === 'active' ? 'bg-green-500/10 text-green-600' : row.status === 'scheduled' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-500/10 text-gray-500'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openDialog(row);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              deleteBanner(row.id);
              load();
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
          <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground">Add, edit, and remove as many banner images as you need.</p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <div className="rounded-md border p-4">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            data={banners}
            columns={columns}
            searchPlaceholder="Search banners..."
            searchFields={['title', 'subtitle', 'position', 'status']}
            onRowClick={openDialog}
            bulkActions={[
              {
                label: 'Delete',
                icon: <Trash2 className="h-3.5 w-3.5 mr-1" />,
                variant: 'destructive' as const,
                confirmTitle: 'Delete banners',
                confirmMessage: 'Are you sure you want to delete the selected banners?',
                onClick: (ids) => {
                  deleteBanners(ids);
                  load();
                },
              },
            ]}
            emptyMessage="No banners yet"
            emptyIcon={<Image className="h-10 w-10" />}
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Subtitle</label>
                <Input value={form.subtitle} onChange={(e) => setForm((current) => ({ ...current, subtitle: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Banner Image URL</label>
                <Input value={form.image_url} onChange={(e) => setForm((current) => ({ ...current, image_url: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Upload Banner Image</label>
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground hover:bg-muted/40">
                  <Upload className="h-4 w-4" />
                  Choose image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  />
                </label>
              </div>
              <div>
                <label className="text-sm font-medium">Link URL</label>
                <Input value={form.link_url} onChange={(e) => setForm((current) => ({ ...current, link_url: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Select value={form.position} onValueChange={(value: BannerPosition) => setForm((current) => ({ ...current, position: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['hero', 'sidebar', 'footer', 'popup'].map((position) => (
                        <SelectItem key={position} value={position} className="capitalize">
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={form.status} onValueChange={(value: BannerStatus) => setForm((current) => ({ ...current, status: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['active', 'inactive', 'scheduled'].map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Preview</label>
              <div className="overflow-hidden rounded-xl border bg-muted">
                {form.image_url ? (
                  <img src={form.image_url} alt={form.title || 'Banner preview'} className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center text-sm text-muted-foreground">
                    No image selected
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Hero banners will appear in the homepage slider when status is `active`.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.image_url.trim()}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Banners;
