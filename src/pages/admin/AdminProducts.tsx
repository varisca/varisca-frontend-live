import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter, Upload, X, ImagePlus, Package, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Checkbox } from '@/components/ui/checkbox';
import { type Product } from '@/lib/productStore';
import { getProducts, addProduct, updateProduct, deleteProduct, deleteProducts, fileToBase64, getNextProductSku } from '@/lib/productStore';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  type CatalogCategoryRow,
  type CatalogAttributeRow,
  resolveScopedAttributeValues,
  subcategoryKind,
  parentIsWomen,
  parentIsMen,
  legacyGenderKeyFromParent,
  resolveProductCategoryIds,
} from '@/lib/admin/catalogOptions';

/** Women → Kurti / Cord set */
const WOMEN_KURTI_CORD_SLEEVES = [
  'Full Sleeve',
  'Half Sleeve',
  'Sleeveless',
  'Short Sleeve',
  'Elbow length',
];

const WOMEN_KURTI_CORD_NECKS = [
  'Round neck',
  'V neck',
  'U Neck',
  'Square Neck',
  'Sweetheart Neck',
];

const WOMEN_KURTI_CORD_MATERIALS = [
  'Cotton',
  'Polyester',
  'Roman Silk',
  'Cotton Slub Fabric',
  'Vertican Silk',
  'Rayon',
  'Dabu Cotton',
];

const WOMEN_PANTS_LENGTHS = ['Ankle', 'Long', 'Chudidar'];

const neckOptions = {
  men: ['Crew Neck T-Shirt', 'V-Neck T-Shirt', 'Polo T-Shirt', 'Henley T-Shirt', 'Scoop Neck T-Shirt'],
  women: ['Crew Neck T-Shirt', 'V-Neck T-Shirt', 'Scoop Neck T-Shirt', 'Polo T-Shirt', 'Henley T-Shirt']
};

const sleeveOptions = {
  men: ['Short Sleeve T-Shirt', 'Long Sleeve T-Shirt', 'Sleeveless / Tank Top'],
  women: ['Short Sleeve T-Shirt', 'Long Sleeve T-Shirt', 'Sleeveless T-Shirt', 'Cap Sleeve T-Shirt']
};

const fitOptions = {
  men: ['Regular Fit T-Shirt', 'Slim Fit T-Shirt', 'Oversized T-Shirt', 'Muscle Fit T-Shirt'],
  women: ['Regular Fit T-Shirt', 'Slim Fit T-Shirt', 'Oversized T-Shirt', 'Crop Top T-Shirt']
};

const designOptions = {
  men: ['Plain / Solid T-Shirt', 'Graphic Print T-Shirt', 'Typography / Quote T-Shirt', 'Pattern Printed T-Shirt', 'Vintage / Retro T-Shirt'],
  women: ['Plain / Solid T-Shirt', 'Graphic Print T-Shirt', 'Typography / Quote T-Shirt', 'Pattern Printed T-Shirt']
};

const purposeOptions = {
  men: ['Sports / Gym T-Shirt', 'Anime / Pop Culture T-Shirt', 'Funny / Meme T-Shirt', 'Custom Printed T-Shirt'],
  women: []
};
const materialOptions = ['Cotton', 'Polyester', 'Dry-fit'];
const sizeOptionsFallback = ['S', 'M', 'L', 'XL'];
const badgeOptions = [
  { value: 'none', label: 'None' },
  { value: 'new', label: 'New' },
  { value: 'sale', label: 'Sale' },
  { value: 'bestseller', label: 'Bestseller' },
];

/** Radix Select requires a value that exists in SelectItem — empty string breaks add/edit flows */
const SELECT_NONE = '__none__';

const SKU_PREFIX = 'VRN-TSH-';

/** Next SKU after the highest `VRN-TSH-###` in the catalog (3-digit padding). */
function computeNextSku(catalog: Product[]): string {
  let max = 0;
  const re = /^VRN-TSH-(\d+)$/i;
  for (const p of catalog) {
    const m = (p.sku || '').trim().match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${SKU_PREFIX}${String(max + 1).padStart(3, '0')}`;
}

interface ProductFormData {
  name: string;
  sku: string;
  /** Top-level category id */
  parent_category_id: string;
  /** Leaf subcategory id (matches products.category_id) */
  subcategory_id: string;
  price: string;
  original_price: string;
  description: string;
  material: string;
  sizes: string[];
  colors: string[];
  badge: string;
  rating: string;
  reviews: string;
  inventory: string;
  status: 'active' | 'draft' | 'archived';
  mainImage: string;
  sub_images: string[];
  fit: string;
  sleeve_length: string;
  neck_type: string;
  design: string;
  purpose: string;
  /** Women's pants: Ankle / Long / Chudidar */
  pants_length: string;
  /** Color label -> image (URL or data URL) for storefront swatches */
  color_images: Record<string, string>;
}

const emptyForm: ProductFormData = {
  name: '', sku: '', parent_category_id: SELECT_NONE, subcategory_id: SELECT_NONE,
  price: '', original_price: '', description: '', material: SELECT_NONE,
  sizes: [], colors: [], color_images: {}, badge: 'none', rating: '4.5', reviews: '0',
  inventory: '0', status: 'active', mainImage: '', sub_images: ['', '', '', ''],
  fit: SELECT_NONE, sleeve_length: SELECT_NONE, pants_length: SELECT_NONE, neck_type: SELECT_NONE, design: SELECT_NONE, purpose: SELECT_NONE,
};

// Helpers removed and replaced by constants above

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  /** Total non-deleted rows from API (may differ from products.length if the response is capped). */
  const [productListTotal, setProductListTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [colorInput, setColorInput] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [colorImageFor, setColorImageFor] = useState<string | null>(null);
  const colorImageInputRef = useRef<HTMLInputElement>(null);
  const perPage = 8;

  // Form state
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm });
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategoryRow[]>([]);
  const [catalogAttributes, setCatalogAttributes] = useState<CatalogAttributeRow[]>([]);

  const loadCatalog = useCallback(async () => {
    try {
      const res = await api.get<{ data: CatalogCategoryRow[] }>('/categories');
      setCatalogCategories(res.data || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadAttributes = useCallback(async () => {
    try {
      const res = await api.get<{ data: CatalogAttributeRow[] }>('/attributes', { limit: '500' });
      setCatalogAttributes(res.data || []);
    } catch {
      /* ignore */
    }
  }, []);

  // Image upload refs
  const mainImageRef = useRef<HTMLInputElement>(null);
  const subImageRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Refresh products from API
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ limit: 500, page: 1 }, { skipAdminAuth: false });
      const raw = res as { data?: Product[]; total?: number };
      const data = Array.isArray(res) ? res : raw?.data || [];
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      setProductListTotal(typeof raw?.total === 'number' ? raw.total : list.length);
    } catch (err: any) {
      setError(err?.message || 'Failed to load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for external updates + initial load
  useEffect(() => {
    refreshProducts();
    const handler = () => refreshProducts();
    window.addEventListener('products-updated', handler);
    return () => window.removeEventListener('products-updated', handler);
  }, [refreshProducts]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (dialogOpen) {
      loadCatalog();
      loadAttributes();
    }
  }, [dialogOpen, loadCatalog, loadAttributes]);

  /** Default parent + subcategory when adding a product (after categories load). */
  useEffect(() => {
    if (!dialogOpen || editProductId) return;
    if (!catalogCategories.length) return;
    setForm((f) => {
      if (f.parent_category_id !== SELECT_NONE) return f;
      const parents = catalogCategories
        .filter((c) => !c.parent_id)
        .sort((a, b) => a.name.localeCompare(b.name));
      if (!parents.length) return f;
      const p = parents[0];
      const children = catalogCategories
        .filter((c) => c.parent_id === p.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        ...f,
        parent_category_id: p.id,
        subcategory_id: children[0]?.id ?? SELECT_NONE,
      };
    });
  }, [dialogOpen, editProductId, catalogCategories]);

  /** If categories loaded after opening edit, fill parent/sub once they were still unset. */
  useEffect(() => {
    if (!dialogOpen || !editProductId || !catalogCategories.length) return;
    const product = products.find((p) => p.id === editProductId);
    if (!product) return;
    const { parentId, subId } = resolveProductCategoryIds(product, catalogCategories, SELECT_NONE);
    setForm((f) => {
      if (f.parent_category_id !== SELECT_NONE || f.subcategory_id !== SELECT_NONE) return f;
      if (parentId === SELECT_NONE && subId === SELECT_NONE) return f;
      return { ...f, parent_category_id: parentId, subcategory_id: subId };
    });
  }, [dialogOpen, editProductId, catalogCategories, products]);

  const topLevelCategories = useMemo(
    () =>
      catalogCategories
        .filter((c) => !c.parent_id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [catalogCategories],
  );

  const childCategoriesForParent = useMemo(
    () =>
      catalogCategories
        .filter((c) => c.parent_id === form.parent_category_id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [catalogCategories, form.parent_category_id],
  );

  const parentRow = useMemo(
    () => catalogCategories.find((c) => c.id === form.parent_category_id),
    [catalogCategories, form.parent_category_id],
  );
  const subRow = useMemo(
    () => catalogCategories.find((c) => c.id === form.subcategory_id),
    [catalogCategories, form.subcategory_id],
  );

  const parentIdForAttrs = form.parent_category_id === SELECT_NONE ? null : form.parent_category_id;
  const subIdForAttrs = form.subcategory_id === SELECT_NONE ? null : form.subcategory_id;

  const legacyKey = useMemo(() => legacyGenderKeyFromParent(parentRow), [parentRow]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === 'All' ||
        (p.category || '').toLowerCase() === categoryFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  const isWomen = parentIsWomen(parentRow);
  const isMen = parentIsMen(parentRow);
  const subKinds = useMemo(() => subcategoryKind(subRow), [subRow]);
  const isWomenKurtiCord = isWomen && subKinds.isWomenKurtiCord;
  const isWomenPants = isWomen && subKinds.isWomenPants;

  const fitSelectOptions = useMemo(() => {
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['fit', 'Fit'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    const fb = fitOptions[legacyKey] || fitOptions.men;
    return db.length ? db : fb;
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs, legacyKey]);

  const sleeveSelectOptions = useMemo(() => {
    if (isWomenPants) return [];
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['sleeve length', 'Sleeve Length', 'sleeve', 'Sleeve'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    if (db.length) return db;
    if (legacyKey === 'men') return sleeveOptions.men;
    if (isWomenKurtiCord) return WOMEN_KURTI_CORD_SLEEVES;
    return sleeveOptions.women;
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs, legacyKey, isWomenPants, isWomenKurtiCord]);

  const neckSelectOptions = useMemo(() => {
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['neck type', 'Neck Type', 'neck', 'Neck'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    if (db.length) return db;
    if (isWomenKurtiCord) return WOMEN_KURTI_CORD_NECKS;
    return neckOptions[legacyKey] || neckOptions.men;
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs, isWomenKurtiCord, legacyKey]);

  const materialSelectOptions = useMemo(() => {
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['material', 'Material'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    if (db.length) return db;
    if (isWomenKurtiCord) return WOMEN_KURTI_CORD_MATERIALS;
    return materialOptions;
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs, isWomenKurtiCord]);

  const designSelectOptions = useMemo(() => {
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['design', 'Design'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    const fb = designOptions[legacyKey] || designOptions.men;
    return db.length ? db : fb;
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs, legacyKey]);

  const sizeSelectOptions = useMemo(() => {
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['size', 'Size', 'sizes', 'Sizes'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    return db.length ? db : sizeOptionsFallback;
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs]);

  const purposeSelectOptions = useMemo(() => {
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['purpose', 'Purpose'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    if (db.length) return db;
    return isMen ? purposeOptions.men : [];
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs, isMen]);

  const pantsLengthSelectOptions = useMemo(() => {
    const db = resolveScopedAttributeValues(
      catalogAttributes,
      ['pants length', 'Pants Length', 'length', 'Length'],
      parentIdForAttrs,
      subIdForAttrs,
    );
    return db.length ? db : WOMEN_PANTS_LENGTHS;
  }, [catalogAttributes, parentIdForAttrs, subIdForAttrs]);

  /** Keep selected sizes valid for current attribute scope. */
  useEffect(() => {
    if (!dialogOpen) return;
    setForm((prev) => {
      if (!prev.sizes.length) return prev;
      const allowed = new Set(sizeSelectOptions);
      const next = prev.sizes.filter((s) => allowed.has(s));
      if (next.length === prev.sizes.length) return prev;
      return { ...prev, sizes: next };
    });
  }, [dialogOpen, sizeSelectOptions]);

  // ─── Image handlers ─────────────────────────────────────────────

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setForm(prev => ({ ...prev, mainImage: base64 }));
  };

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setForm(prev => {
      const sub_images = [...prev.sub_images];
      sub_images[index] = base64;
      return { ...prev, sub_images };
    });
  };

  const removeSubImage = (index: number) => {
    setForm(prev => {
      const sub_images = [...prev.sub_images];
      sub_images[index] = '';
      return { ...prev, sub_images };
    });
  };

  // ─── Size toggle ────────────────────────────────────────────────

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // ─── Color tag input ────────────────────────────────────────────

  const addColor = () => {
    const color = colorInput.trim();
    if (color && !form.colors.includes(color)) {
      setForm(prev => ({ ...prev, colors: [...prev.colors, color] }));
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setForm(prev => {
      const { [color]: _, ...rest } = prev.color_images;
      return { ...prev, colors: prev.colors.filter(c => c !== color), color_images: rest };
    });
  };

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = colorImageFor;
    e.target.value = '';
    setColorImageFor(null);
    if (!file || !target) return;
    try {
      const base64 = await fileToBase64(file);
      setForm(prev => ({
        ...prev,
        color_images: { ...prev.color_images, [target]: base64 },
      }));
    } catch {
      toast.error('Could not read image');
    }
  };

  // ─── Open Add / Edit ───────────────────────────────────────────

  const openAdd = () => {
    setEditProductId(null);
    setForm({ ...emptyForm, sku: computeNextSku(products) });
    setColorInput('');
    setSaveError(null);
    setDialogOpen(true);
    void (async () => {
      try {
        const sku = await getNextProductSku();
        setForm((f) => ({ ...f, sku }));
      } catch {
        /* keep client-side computeNextSku fallback */
      }
    })();
  };

  const openEdit = (product: Product) => {
    setEditProductId(product.id);
    const { parentId, subId } = resolveProductCategoryIds(product, catalogCategories, SELECT_NONE);
    const opt = (v: string | undefined) => (v && String(v).trim() ? String(v).trim() : SELECT_NONE);

    setForm({
      name: product.name,
      sku: product.sku || '',
      parent_category_id: parentId,
      subcategory_id: subId,
      price: product.price.toString(),
      original_price: product.original_price ? product.original_price.toString() : '',
      description: product.description || '',
      material: opt(product.material),
      sizes: product.sizes || [],
      colors: product.colors || [],
      badge: product.badge || 'none',
      rating: (product.rating || 4.5).toString(),
      reviews: (product.reviews || 0).toString(),
      inventory: (product.inventory || 0).toString(),
      status: product.status || 'active',
      mainImage: product.image || '',
      sub_images: [...(product.sub_images || []), '', '', '', ''].slice(0, 4),
      fit: opt(product.fit),
      sleeve_length: opt(product.sleeve_length),
      pants_length: opt(product.pants_length),
      neck_type: opt(product.neck_type),
      design: opt(product.design),
      purpose: opt(product.purpose),
      color_images:
        product.color_images && typeof product.color_images === 'object' && !Array.isArray(product.color_images)
          ? { ...(product.color_images as Record<string, string>) }
          : {},
    });
    setColorInput('');
    setSaveError(null);
    setDialogOpen(true);
  };

  // ─── Save ──────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaveError(null);
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error('Valid price is required');
      return;
    }

    const sel = (v: string) => (v === SELECT_NONE ? '' : v);

    /** New products: resolve SKU from the database so we never reuse a code that exists but is not in the paginated admin list. */
    let skuToSend = form.sku.trim();
    if (!editProductId) {
      try {
        if (!skuToSend || /^VRN-TSH-\d+$/i.test(skuToSend)) {
          skuToSend = await getNextProductSku();
        }
      } catch {
        if (!skuToSend) skuToSend = computeNextSku(products);
      }
    } else {
      skuToSend = form.sku.trim();
    }

    const categoryStr = (parentRow?.slug || parentRow?.name || 'men').toLowerCase();
    const subcategoryStr = subRow?.name || '';
    const category_id =
      form.subcategory_id !== SELECT_NONE && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(form.subcategory_id)
        ? form.subcategory_id
        : null;

    const productData: Omit<Product, 'id'> = {
      name: form.name.trim(),
      sku: skuToSend,
      category: categoryStr,
      subcategory: subcategoryStr,
      category_id: category_id ?? undefined,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : undefined,
      description: form.description.trim(),
      material: sel(form.material).trim(),
      sizes: form.sizes,
      colors: form.colors,
      color_images: form.color_images,
      badge: form.badge === 'none' ? undefined : (form.badge as 'new' | 'sale' | 'bestseller'),
      rating: Number(form.rating) || 4.5,
      reviews: Number(form.reviews) || 0,
      inventory: Number(form.inventory) || 0,
      status: form.status,
      image: form.mainImage,
      hover_image: form.sub_images[0] || undefined,
      sub_images: form.sub_images.filter(Boolean),
      fit: isWomenKurtiCord ? '' : sel(form.fit),
      sleeve_length: isWomenPants ? '' : sel(form.sleeve_length),
      pants_length: isWomenPants ? sel(form.pants_length) : '',
      neck_type: sel(form.neck_type),
      design: isWomenKurtiCord ? '' : sel(form.design),
      purpose: isWomenKurtiCord ? '' : sel(form.purpose),
    };

    try {
      if (editProductId) {
        await updateProduct(editProductId, productData);
        toast.success('Product updated', {
          description: `${form.name} has been updated successfully.`,
        });
      } else {
        await addProduct(productData);
        toast.success('Product created', {
          description: `${form.name} has been created successfully.`,
        });
      }
      await refreshProducts();
      window.dispatchEvent(new Event('products-updated'));
      setDialogOpen(false);
      setSaveError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save product';
      setSaveError(msg);
      const skuDuplicate =
        /products_sku_key|duplicate key.*sku/i.test(msg) ||
        (/duplicate/i.test(msg) && /sku/i.test(msg));
      const description = skuDuplicate
        ? 'That SKU is already used by another active product. Choose a different code, or clear the field and save again to use the next free VRN-TSH-### from the server.'
        : msg;
      toast.error('Could not save product', {
        description,
        duration: 14_000,
      });
    }
  };

  // ─── Delete ────────────────────────────────────────────────────

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    const id = productToDelete;
    if (id) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        await refreshProducts();
        window.dispatchEvent(new Event('products-updated'));
        toast.success('Product deleted');
      } catch (e: unknown) {
        toast.error('Failed to delete product', {
          description: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleBulkAction = async (action: 'active' | 'draft' | 'delete') => {
    const ids = Array.from(selectedProducts);
    try {
      if (action === 'delete') {
        await deleteProducts(ids);
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
        toast.success(`${ids.length} products deleted`);
      } else {
        await Promise.all(ids.map(id => updateProduct(id, { status: action })));
        toast.success(`${ids.length} products set to ${action}`);
      }
      await refreshProducts();
      window.dispatchEvent(new Event('products-updated'));
      setSelectedProducts(new Set());
    } catch (e: unknown) {
      toast.error('Failed to perform bulk action', {
        description: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  };

  // ─── Select helpers ────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {productListTotal} total products
            {filteredProducts.length !== products.length && (
              <span className="text-muted-foreground/80"> · {filteredProducts.length} match current filters</span>
            )}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-accent to-orange-600 text-white hover:opacity-90 shadow-lg shadow-accent/20">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 bg-muted/30 border-border/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[150px] h-9 bg-muted/30 border-border/50">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {topLevelCategories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedProducts.size} selected</span>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleBulkAction('active')}>Set Active</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleBulkAction('draft')}>Set Draft</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs text-red-500" onClick={() => setBulkDeleteConfirmOpen(true)}>Delete</Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={paginatedProducts.length > 0 && selectedProducts.size === paginatedProducts.length}
                    onCheckedChange={() => {
                      if (selectedProducts.size === paginatedProducts.length) setSelectedProducts(new Set());
                      else setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Inventory</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground font-medium">No products found</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Add your first product to get started</p>
                  </td>
                </tr>
              ) : paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <Checkbox checked={selectedProducts.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <ImagePlus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-muted-foreground font-mono">{product.sku || '—'}</td>
                  <td className="px-4 py-3.5 text-sm capitalize">{product.category}</td>
                  <td className="px-4 py-3.5 text-right">
                    <p className="text-sm font-semibold">₹{product.price.toLocaleString()}</p>
                    {product.original_price && (
                      <p className="text-xs text-muted-foreground line-through">₹{product.original_price.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-sm font-medium ${(product.inventory || 0) === 0 ? 'text-red-500' : (product.inventory || 0) <= 5 ? 'text-amber-500' : ''}`}>
                      {product.inventory || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={product.status || 'active'} type="product" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => confirmDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredProducts.length)} of {filteredProducts.length}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${currentPage === i + 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Add / Edit Product Dialog                                       */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSaveError(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editProductId ? 'Update the product details below.' : 'Fill in the details to create a new product. Required: name and price; add a main image for best results.'}
            </DialogDescription>
          </DialogHeader>

          {!editProductId && (
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Example setup (sync with Attributes)</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  In Admin → Catalog → Categories, create <span className="font-medium">Men</span> → <span className="font-medium">T-Shirts</span> and <span className="font-medium">Women</span> → <span className="font-medium">Pants</span>.
                </li>
                <li>
                  In Admin → Catalog → Attributes, create <span className="font-medium">Size</span> (values: XS, S, M, L, XL, XXL) scoped to <span className="font-medium">T-Shirts</span>.
                </li>
                <li>
                  Create <span className="font-medium">Pants Length</span> (values: Ankle, Long, Chudidar) scoped to <span className="font-medium">Pants</span>.
                </li>
              </ul>
            </div>
          )}

          {saveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Server error</AlertTitle>
              <AlertDescription className="text-sm whitespace-pre-wrap break-words">{saveError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 py-4">
            {/* ── Images ────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Product Images</Label>
              <div className="grid grid-cols-5 gap-3">
                {/* Main Image */}
                <div className="col-span-2 row-span-2">
                  <input type="file" accept="image/*" ref={mainImageRef} onChange={handleMainImageUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => mainImageRef.current?.click()}
                    className={cn(
                      "relative w-full aspect-[3/4] rounded-xl border-2 border-dashed transition-all overflow-hidden group",
                      form.mainImage ? "border-accent/50" : "border-border hover:border-accent/50 hover:bg-muted/30"
                    )}
                  >
                    {form.mainImage ? (
                      <>
                        <img src={form.mainImage} alt="Main" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium">Main Image</span>
                        <span className="text-[10px] mt-1">Click to upload</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Sub Images (4 slots) */}
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                    <input type="file" accept="image/*" ref={subImageRefs[i]} onChange={(e) => handleSubImageUpload(e, i)} className="hidden" />
                    <button
                      type="button"
                      onClick={() => subImageRefs[i].current?.click()}
                      className={cn(
                        "relative w-full aspect-square rounded-lg border-2 border-dashed transition-all overflow-hidden group",
                        form.sub_images[i] ? "border-accent/50" : "border-border hover:border-accent/50 hover:bg-muted/30"
                      )}
                    >
                      {form.sub_images[i] ? (
                        <>
                          <img src={form.sub_images[i]} alt={`Sub ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="h-4 w-4 text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeSubImage(i); }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <ImagePlus className="h-4 w-4 mb-1" />
                          <span className="text-[10px]">Image {i + 1}</span>
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Basic Info ────────────────────────────────────── */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. VRN-TSH-001"
                  className="font-mono"
                />
                {!editProductId && (
                  <p className="text-xs text-muted-foreground">
                    Suggested automatically from existing SKUs ({SKU_PREFIX}###). You can change it before saving.
                  </p>
                )}
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={form.parent_category_id}
                    onValueChange={(parentId) => {
                      const children = catalogCategories
                        .filter((c) => c.parent_id === parentId)
                        .sort((a, b) => a.name.localeCompare(b.name));
                      const firstSub = children[0]?.id ?? SELECT_NONE;
                      setForm((prev) => ({
                        ...prev,
                        parent_category_id: parentId,
                        subcategory_id: firstSub,
                        purpose: parentIsWomen(catalogCategories.find((c) => c.id === parentId)) ? SELECT_NONE : prev.purpose,
                        pants_length: parentIsMen(catalogCategories.find((c) => c.id === parentId)) ? SELECT_NONE : prev.pants_length,
                      }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {topLevelCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={form.subcategory_id}
                    onValueChange={(subId) => {
                      setForm((prev) => {
                        const sub = catalogCategories.find((c) => c.id === subId);
                        const parent = catalogCategories.find((c) => c.id === prev.parent_category_id);
                        const next: ProductFormData = { ...prev, subcategory_id: subId };
                        const kinds = subcategoryKind(sub);
                        if (!parentIsWomen(parent)) {
                          next.pants_length = SELECT_NONE;
                        }
                        if (kinds.isWomenPants) {
                          next.sleeve_length = SELECT_NONE;
                        } else {
                          next.pants_length = SELECT_NONE;
                        }
                        if (kinds.isWomenKurtiCord) {
                          next.fit = SELECT_NONE;
                          next.design = SELECT_NONE;
                          next.purpose = SELECT_NONE;
                        }
                        const prevSub = catalogCategories.find((c) => c.id === prev.subcategory_id);
                        const prevKc = subcategoryKind(prevSub).isWomenKurtiCord;
                        const nextKc = kinds.isWomenKurtiCord;
                        if (prevKc !== nextKc) {
                          next.material = SELECT_NONE;
                        }
                        return next;
                      });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                    <SelectContent>
                      {childCategoriesForParent.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ── Pricing & Inventory ──────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1299" />
              </div>
              <div className="grid gap-2">
                <Label>Compare Price (₹)</Label>
                <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="e.g. 1799 (optional)" />
              </div>
              <div className="grid gap-2">
                <Label>Inventory</Label>
                <Input type="number" value={form.inventory} onChange={(e) => setForm({ ...form, inventory: e.target.value })} placeholder="e.g. 45" />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: 'active' | 'draft' | 'archived') => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Attributes ──────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Fit</Label>
                <Select
                  value={form.fit}
                  onValueChange={(v) => setForm({ ...form, fit: v })}
                  disabled={isWomenKurtiCord}
                >
                  <SelectTrigger className={cn(isWomenKurtiCord && 'opacity-60')}>
                    <SelectValue placeholder={isWomenKurtiCord ? 'Not used for Kurti / Cord set' : 'Select Fit'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_NONE}>Not specified</SelectItem>
                    {fitSelectOptions.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isWomenKurtiCord && (
                  <p className="text-xs text-muted-foreground">Fit does not apply to Kurti or Cord set.</p>
                )}
              </div>
              <div className="grid gap-2">
                {isWomenPants ? (
                  <>
                    <Label>Length</Label>
                    <Select value={form.pants_length} onValueChange={(v) => setForm({ ...form, pants_length: v })}>
                      <SelectTrigger><SelectValue placeholder="Select length" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_NONE}>Not specified</SelectItem>
                        {pantsLengthSelectOptions.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Length options come from Admin → Catalog → Attributes (attribute name “Pants Length”), scoped by selected category/subcategory.
                      Sleeve length is not used for pants.
                    </p>
                  </>
                ) : (
                  <>
                    <Label>Sleeve Length</Label>
                    <Select
                      value={form.sleeve_length}
                      onValueChange={(v) => setForm({ ...form, sleeve_length: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select Sleeve" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SELECT_NONE}>Not specified</SelectItem>
                        {sleeveSelectOptions.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Neck Type</Label>
                <Select value={form.neck_type} onValueChange={(v) => setForm({ ...form, neck_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Neck Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_NONE}>Not specified</SelectItem>
                    {neckSelectOptions.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Design</Label>
                <Select
                  value={form.design}
                  onValueChange={(v) => setForm({ ...form, design: v })}
                  disabled={isWomenKurtiCord}
                >
                  <SelectTrigger className={cn(isWomenKurtiCord && 'opacity-60')}>
                    <SelectValue placeholder={isWomenKurtiCord ? 'Not used for Kurti / Cord set' : 'Select Design'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_NONE}>Not specified</SelectItem>
                    {designSelectOptions.map(o => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isWomenKurtiCord && (
                  <p className="text-xs text-muted-foreground">Design does not apply to Kurti or Cord set.</p>
                )}
              </div>
              {!isWomenKurtiCord && (
                <div className="grid gap-2">
                  <Label>Purpose</Label>
                  <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                    <SelectTrigger><SelectValue placeholder="Select Purpose" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SELECT_NONE}>Not specified</SelectItem>
                      {purposeSelectOptions.map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* ── Description & Material ──────────────────────── */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows={3} />
              </div>
              <div className="grid gap-2">
                <Label>Material</Label>
                <Select value={form.material} onValueChange={(v) => setForm({ ...form, material: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Material" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELECT_NONE}>Not specified</SelectItem>
                    {materialSelectOptions.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isWomenKurtiCord && (
                  <p className="text-xs text-muted-foreground">Extended fabric list for Kurti and Cord set.</p>
                )}
              </div>
            </div>

            {/* ── Sizes ───────────────────────────────────────── */}
            <div className="space-y-2">
              <Label>Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {sizeSelectOptions.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      "w-11 h-9 rounded-md border text-xs font-medium transition-all",
                      form.sizes.includes(size)
                        ? "border-accent bg-accent text-white"
                        : "border-border hover:border-accent"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Size options come from Admin → Catalog → Attributes (attribute name “Size”), scoped by selected category/subcategory.
              </p>
            </div>

            {/* ── Colors (+ per-color tee image for storefront) ─ */}
            <div className="space-y-2">
              <Label>Colors</Label>
              <p className="text-xs text-muted-foreground">
                Add each color name, then upload a small t-shirt photo for that color. Shown as swatches on the product page.
              </p>
              <input
                ref={colorImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleColorImageUpload}
              />
              <div className="flex gap-2">
                <Input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
                  placeholder="Type color & press Enter"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addColor}>Add</Button>
              </div>
              {form.colors.length > 0 && (
                <div className="grid gap-3 mt-3">
                  {form.colors.map((color) => (
                    <div
                      key={color}
                      className="flex flex-wrap items-start gap-3 p-3 rounded-lg border border-border bg-muted/20"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setColorImageFor(color);
                          colorImageInputRef.current?.click();
                        }}
                        className={cn(
                          'relative shrink-0 w-[4.5rem] aspect-[3/4] rounded-md border-2 overflow-hidden bg-background transition-all',
                          form.color_images[color] ? 'border-accent/60' : 'border-dashed border-border'
                        )}
                      >
                        {form.color_images[color] ? (
                          <img src={form.color_images[color]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-[10px] text-muted-foreground text-center leading-tight">
                            <Upload className="h-4 w-4 mb-1" />
                            Tee photo
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{color}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="text-muted-foreground hover:text-red-500"
                            aria-label={`Remove ${color}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Optional. If missing, the main product image is used for this color on the storefront.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Badge, Rating, Reviews ──────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Badge</Label>
                <Select value={form.badge} onValueChange={(v) => setForm({ ...form, badge: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {badgeOptions.map(b => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Rating</Label>
                <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="4.5" />
              </div>
              <div className="grid gap-2">
                <Label>Reviews</Label>
                <Input type="number" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: e.target.value })} placeholder="0" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-accent to-orange-600 text-white hover:opacity-90">
              {editProductId ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { handleBulkAction('delete'); setBulkDeleteConfirmOpen(false); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
