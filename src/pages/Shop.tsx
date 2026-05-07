import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Loader2, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categories, formatPrice, Product } from '@/lib/data';
import { useProducts } from '@/hooks/useProducts';
import { getProductFilters } from '@/lib/productStore';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

// Top-level: All | Men | Women (always shown)
const TOP_LEVEL_CATEGORIES = ['Men', 'Women'] as const;
const SUBCATEGORIES = {
  men: ['T-Shirt'],
  women: ['T-Shirt', 'Kurti', 'Cord set', 'Pants'],
} as const;
const priceRanges = [
  { label: 'Under ₹1000', min: 0, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹3000', min: 2000, max: 3000 },
  { label: 'Above ₹3000', min: 3000, max: Infinity },
];
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

const FilterSection = ({ title, options, selected, toggle, compact = false }: { title: string, options?: string[], selected: string[], toggle: (val: string) => void, compact?: boolean }) => {
  if (!options || options.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              compact ? "w-10 h-10" : "px-3 py-1.5",
              "rounded-lg border text-sm font-medium transition-all",
              selected.includes(opt)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const Shop = () => {
  const navigate = useNavigate();
  const { data: fetchedProducts, isLoading, isError, error, refetch } = useProducts();
  const products = fetchedProducts || [];

  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const categoryFromUrl = searchParams.get('category');
  const collectionFromUrl = searchParams.get('collection');
  const [selectedCategory, setSelectedCategory] = useState<'men' | 'women'>(
    categoryFromUrl === 'men' || categoryFromUrl === 'women' ? categoryFromUrl : 'men'
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedSleeves, setSelectedSleeves] = useState<string[]>([]);
  const [selectedNecks, setSelectedNecks] = useState<string[]>([]);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');

  const { data: filters } = useQuery({
    queryKey: ['productFilters'],
    queryFn: getProductFilters,
  });

  // SEO
  useEffect(() => {
    document.title = "Shop Collection | Varisca";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Explore Varisca's complete collection of premium clothing. Find the perfect fit for your style.");
  }, []);

  // Sync category with URL
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat === 'men' || cat === 'women' ? cat : 'men');
  }, [searchParams]);

  const setCategoryAndUrl = (cat: 'men' | 'women') => {
    setSelectedCategory(cat);
    setSearchParams({ category: cat });
    setSelectedSubcategory(null);
    // Reset category-dependent filters on switch
    setSelectedSleeves([]);
    setSelectedNecks([]);
    setSelectedColors([]);
  };

  // Map ?collection= param to a badge filter
  const collectionBadgeMap: Record<string, string> = {
    'sale': 'sale',
    'new-drops': 'new',
    'streetwear': 'new',
  };
  const collectionBadge = collectionFromUrl ? collectionBadgeMap[collectionFromUrl] : null;

  const isWomen = selectedCategory === 'women';

  const categoryProducts = useMemo(
    () => products.filter(p => (p.category || '').toLowerCase() === selectedCategory),
    [products, selectedCategory],
  );

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    for (const p of categoryProducts) {
      for (const c of p.colors || []) {
        const t = String(c || '').trim();
        if (t) set.add(t);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categoryProducts]);

  const availableSleeves = useMemo(() => {
    if (!isWomen) return [];
    const set = new Set<string>();
    for (const p of categoryProducts) {
      const v = String(p.sleeve_length || '').trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categoryProducts, isWomen]);

  const availableNecks = useMemo(() => {
    if (!isWomen) return [];
    const set = new Set<string>();
    for (const p of categoryProducts) {
      const v = String(p.neck_type || '').trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categoryProducts, isWomen]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Collection filter from URL (?collection=sale, ?collection=new-drops, etc.)
    if (collectionBadge) {
      result = result.filter(p => p.badge === collectionBadge);
    }

    // Category filter (Men / Women)
    result = result.filter(p => (p.category || '').toLowerCase() === selectedCategory);
    // Subcategory filter (T-Shirt, Kurti, Cord Set)
    if (selectedSubcategory) {
      result = result.filter(p => {
        const sub = (p.subcategory || '').trim();
        return sub.toLowerCase() === selectedSubcategory.toLowerCase() ||
          (selectedSubcategory === 'T-Shirt' && /tshirt|t-?shirt|tee/i.test(sub)) ||
          (selectedSubcategory === 'Kurti' && /kurti/i.test(sub)) ||
          (selectedSubcategory === 'Cord set' && /cord/i.test(sub)) ||
          (selectedSubcategory === 'Pants' && /pants?/i.test(sub));
      });
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizes.some(s => selectedSizes.includes(s))
      );
    }
    
    // Additional filters
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors && p.colors.some(c => selectedColors.includes(c)));
    }
    if (selectedFits.length > 0) {
      result = result.filter(p => p.fit && selectedFits.includes(p.fit));
    }
    if (selectedSleeves.length > 0) {
      result = result.filter(p => p.sleeve_length && selectedSleeves.includes(p.sleeve_length));
    }
    if (selectedNecks.length > 0) {
      result = result.filter(p => p.neck_type && selectedNecks.includes(p.neck_type));
    }
    if (selectedDesigns.length > 0) {
      result = result.filter(p => p.design && selectedDesigns.includes(p.design));
    }

    // Price filter
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange];
      result = result.filter(p => p.price >= range.min && p.price < range.max);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (a.badge === 'new' ? -1 : 1));
        break;
      default:
        result.sort((a, b) => (a.badge === 'new' ? -1 : 1));
    }

    return result;
  }, [products, collectionBadge, selectedCategory, selectedSubcategory, selectedSizes, selectedColors, selectedFits, selectedSleeves, selectedNecks, selectedDesigns, selectedPriceRange, sortBy]);

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const clearFilters = () => {
    setSelectedSubcategory(null);
    // Keep category (no "All" section). Clear other params like ?collection=.
    setSearchParams({ category: selectedCategory });
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedFits([]);
    setSelectedSleeves([]);
    setSelectedNecks([]);
    setSelectedDesigns([]);
    setSelectedPriceRange(null);
  };

  const hasActiveFilters = collectionFromUrl || selectedSubcategory || selectedSizes.length > 0 || selectedColors.length > 0 || selectedFits.length > 0 || selectedSleeves.length > 0 || selectedNecks.length > 0 || selectedDesigns.length > 0 || selectedPriceRange !== null;

  return (
    <main className="min-h-screen">
      {/* Category Tabs - Mobile: Back on top, then Men, Women, Filter */}
      <div className="bg-muted/50 py-4 md:py-6">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:justify-center gap-3 md:gap-4"
          >
            {/* Back button - Mobile only, top row */}
            <button
              onClick={() => navigate(-1)}
              className="md:hidden flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors self-start"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            {/* Category tabs + Filter - second row on mobile */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {TOP_LEVEL_CATEGORIES.map(catName => (
                <button
                  key={catName}
                  onClick={() => setCategoryAndUrl(catName.toLowerCase() as 'men' | 'women')}
                  className={cn(
                    "px-5 py-2.5 sm:px-6 rounded-full font-medium text-sm transition-all duration-300",
                    selectedCategory === catName.toLowerCase()
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-background border border-border hover:border-primary"
                  )}
                >
                  {catName}
                </button>
              ))}
              {/* Filter button - Mobile only */}
              <button
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border rounded-full font-medium text-sm hover:border-primary transition-colors ml-auto"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal size={18} />
                Filter
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {isLoading ? (
        <div className="container-custom py-20 flex justify-center items-center">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </div>
      ) : isError ? (
        <div className="container-custom py-16 text-center max-w-lg mx-auto px-4">
          <p className="text-lg font-medium mb-2">Couldn&apos;t load products</p>
          <p className="text-sm text-muted-foreground mb-6">
            {error instanceof Error ? error.message : String(error ?? 'Unknown error')}
          </p>
          <Button type="button" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
        {/* Collection heading when navigating from a collection link */}
        {collectionFromUrl && (
          <div className="container-custom pt-6 pb-0">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <h1 className="text-2xl font-bold capitalize">
                {collectionFromUrl === 'new-drops' ? 'New Drops' :
                 collectionFromUrl === 'sale' ? 'Sale' :
                 collectionFromUrl.charAt(0).toUpperCase() + collectionFromUrl.slice(1)} Collection
              </h1>
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
              >
                View All
              </button>
            </motion.div>
          </div>
        )}

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-accent hover:underline"
                >
                  Clear all filters
                </button>
              )}

               {/* Subcategory (when Men or Women selected) — above attribute filters */}
               {selectedCategory && SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES] && (
                 <FilterSection
                   title="Category"
                   options={[...SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES]]}
                   selected={selectedSubcategory ? [selectedSubcategory] : []}
                   toggle={(v) => setSelectedSubcategory(prev => prev === v ? null : v)}
                 />
               )}

              {/* 1) Price → 2) Size → 3) Colors → 4) Fit → 5) Sleeve → 6) Neck → 7) Design */}
              <div>
                <h3 className="font-semibold mb-4">Price</h3>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setSelectedPriceRange(
                        selectedPriceRange === index ? null : index
                      )}
                      className={cn(
                        "w-full text-left py-2 px-3 rounded-lg transition-colors text-sm",
                        selectedPriceRange === index
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

               <FilterSection title="Size" options={(filters?.sizes?.length ? filters.sizes : sizes) as string[]} selected={selectedSizes} toggle={(v) => toggleFilter(setSelectedSizes, v)} compact />
               <FilterSection title="Colors" options={availableColors.length ? availableColors : filters?.colors} selected={selectedColors} toggle={(v) => toggleFilter(setSelectedColors, v)} />
               <FilterSection title="Fit" options={filters?.fits} selected={selectedFits} toggle={(v) => toggleFilter(setSelectedFits, v)} />
               {isWomen && (
                 <>
                   <FilterSection title="Sleeve Length" options={availableSleeves.length ? availableSleeves : filters?.sleeve_lengths} selected={selectedSleeves} toggle={(v) => toggleFilter(setSelectedSleeves, v)} />
                   <FilterSection title="Neck Type" options={availableNecks.length ? availableNecks : filters?.neck_types} selected={selectedNecks} toggle={(v) => toggleFilter(setSelectedNecks, v)} />
                 </>
               )}
               <FilterSection title="Design" options={filters?.designs} selected={selectedDesigns} toggle={(v) => toggleFilter(setSelectedDesigns, v)} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedSubcategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    {selectedSubcategory}
                    <button onClick={() => setSelectedSubcategory(null)}><X size={14} /></button>
                  </span>
                )}
                {selectedPriceRange !== null && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    {priceRanges[selectedPriceRange].label}
                    <button onClick={() => setSelectedPriceRange(null)}><X size={14} /></button>
                  </span>
                )}
                {selectedSizes.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    Size: {v} <button onClick={() => toggleFilter(setSelectedSizes, v)}><X size={14} /></button>
                  </span>
                ))}
                {selectedColors.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    Color: {v} <button onClick={() => toggleFilter(setSelectedColors, v)}><X size={14} /></button>
                  </span>
                ))}
                {selectedFits.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    Fit: {v} <button onClick={() => toggleFilter(setSelectedFits, v)}><X size={14} /></button>
                  </span>
                ))}
                {selectedSleeves.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    Sleeve: {v} <button onClick={() => toggleFilter(setSelectedSleeves, v)}><X size={14} /></button>
                  </span>
                ))}
                {selectedNecks.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    Neck: {v} <button onClick={() => toggleFilter(setSelectedNecks, v)}><X size={14} /></button>
                  </span>
                ))}
                {selectedDesigns.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    Design: {v} <button onClick={() => toggleFilter(setSelectedDesigns, v)}><X size={14} /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No products found matching your filters.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setIsFilterOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 h-full w-[280px] sm:w-80 bg-background p-4 sm:p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {selectedCategory && SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES] && (
                <FilterSection
                  title="Category"
                  options={[...SUBCATEGORIES[selectedCategory as keyof typeof SUBCATEGORIES]]}
                  selected={selectedSubcategory ? [selectedSubcategory] : []}
                  toggle={(v) => setSelectedSubcategory(prev => prev === v ? null : v)}
                />
              )}

              <div>
                <h3 className="font-semibold mb-4">Price</h3>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setSelectedPriceRange(
                        selectedPriceRange === index ? null : index
                      )}
                      className={cn(
                        "w-full text-left py-2 px-3 rounded-lg transition-colors text-sm",
                        selectedPriceRange === index
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <FilterSection title="Size" options={(filters?.sizes?.length ? filters.sizes : sizes) as string[]} selected={selectedSizes} toggle={(v) => toggleFilter(setSelectedSizes, v)} compact />
              <FilterSection title="Colors" options={availableColors.length ? availableColors : filters?.colors} selected={selectedColors} toggle={(v) => toggleFilter(setSelectedColors, v)} />
              <FilterSection title="Fit" options={filters?.fits} selected={selectedFits} toggle={(v) => toggleFilter(setSelectedFits, v)} />
              {isWomen && (
                <>
                  <FilterSection title="Sleeve Length" options={availableSleeves.length ? availableSleeves : filters?.sleeve_lengths} selected={selectedSleeves} toggle={(v) => toggleFilter(setSelectedSleeves, v)} />
                  <FilterSection title="Neck Type" options={availableNecks.length ? availableNecks : filters?.neck_types} selected={selectedNecks} toggle={(v) => toggleFilter(setSelectedNecks, v)} />
                </>
              )}
              <FilterSection title="Design" options={filters?.designs} selected={selectedDesigns} toggle={(v) => toggleFilter(setSelectedDesigns, v)} />
            </div>

            <div className="mt-8 space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setIsFilterOpen(false)}
              >
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    clearFilters();
                    setIsFilterOpen(false);
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </main>
  );
};

export default Shop;
