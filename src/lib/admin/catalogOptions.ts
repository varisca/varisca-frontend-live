/** Resolve attribute value lists from admin Attributes with optional category / subcategory scope */

export interface CatalogCategoryRow {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface CatalogAttributeRow {
  id: string;
  name: string;
  type: string;
  values: string[] | null;
  scope_parent_category_id?: string | null;
  scope_subcategory_id?: string | null;
}

export function normName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function mergeUnique(arrays: (string[] | null | undefined)[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const arr of arrays) {
    for (const v of arr || []) {
      const t = typeof v === 'string' ? v.trim() : '';
      if (t && !seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
  }
  return out;
}

/** Match attribute rows whose name equals any alias (case-insensitive, normalized spaces). */
function rowsMatchingName(rows: CatalogAttributeRow[], aliases: string[]): CatalogAttributeRow[] {
  const set = new Set(aliases.map(normName));
  return rows.filter((r) => set.has(normName(r.name)));
}

/**
 * Priority: subcategory-scoped (non-empty values) → parent-scoped → global (no scope).
 * Multiple rows at the same tier are merged (e.g. duplicate "Fit" definitions).
 */
export function resolveScopedAttributeValues(
  rows: CatalogAttributeRow[],
  nameAliases: string[],
  parentId: string | null,
  subcategoryId: string | null,
): string[] {
  const matching = rowsMatchingName(rows, nameAliases);
  if (matching.length === 0) return [];

  const subScoped = matching.filter(
    (r) => r.scope_subcategory_id && subcategoryId && r.scope_subcategory_id === subcategoryId,
  );
  const subVals = mergeUnique(subScoped.map((r) => r.values));
  if (subVals.length) return subVals;

  const parentScoped = matching.filter(
    (r) =>
      !r.scope_subcategory_id &&
      r.scope_parent_category_id &&
      parentId &&
      r.scope_parent_category_id === parentId,
  );
  const pVals = mergeUnique(parentScoped.map((r) => r.values));
  if (pVals.length) return pVals;

  const global = matching.filter((r) => !r.scope_subcategory_id && !r.scope_parent_category_id);
  return mergeUnique(global.map((r) => r.values));
}

export function subcategoryKind(sub: CatalogCategoryRow | undefined): {
  isWomenKurtiCord: boolean;
  isWomenPants: boolean;
  isWomenTshirt: boolean;
} {
  if (!sub) {
    return { isWomenKurtiCord: false, isWomenPants: false, isWomenTshirt: false };
  }
  const s = `${sub.slug || ''} ${sub.name || ''}`.toLowerCase();
  return {
    isWomenKurtiCord: /kurti|cord/.test(s),
    isWomenPants: /\bpants?\b/.test(s) || s.includes('pant'),
    isWomenTshirt: /t-?shirt|tshirt/.test(s),
  };
}

export function parentIsWomen(parent: CatalogCategoryRow | undefined): boolean {
  if (!parent) return false;
  const s = (parent.slug || parent.name || '').toLowerCase();
  return s === 'women' || s.includes('women');
}

export function parentIsMen(parent: CatalogCategoryRow | undefined): boolean {
  if (!parent) return false;
  const s = (parent.slug || parent.name || '').toLowerCase();
  // Avoid matching "women" (contains "men"). Treat as exact key or whole-word match.
  return s === 'men' || /\bmen\b/.test(s);
}

/** Legacy fit/sleeve buckets keyed men | women for fallback lists */
export type LegacyGenderKey = 'men' | 'women';

export function legacyGenderKeyFromParent(parent: CatalogCategoryRow | undefined): LegacyGenderKey {
  if (parentIsWomen(parent)) return 'women';
  return 'men';
}

const UUID_LEN = 36;

function looksLikeUuid(s: string): boolean {
  return s.length === UUID_LEN && /^[0-9a-f-]{36}$/i.test(s);
}

/**
 * Map stored product category strings / category_id to parent + leaf category rows.
 */
export function resolveProductCategoryIds(
  product: { category?: string; subcategory?: string; category_id?: string | null },
  rows: CatalogCategoryRow[],
  none: string,
): { parentId: string; subId: string } {
  if (!rows.length) return { parentId: none, subId: none };

  if (product.category_id && looksLikeUuid(product.category_id)) {
    const child = rows.find((c) => c.id === product.category_id);
    if (child) {
      return {
        parentId: child.parent_id || none,
        subId: child.id,
      };
    }
  }

  const parents = rows.filter((c) => !c.parent_id);
  const cat = (product.category || '').trim().toLowerCase();
  const p = parents.find(
    (x) => x.slug?.toLowerCase() === cat || x.name.toLowerCase() === cat,
  );
  if (!p) return { parentId: none, subId: none };

  const children = rows.filter((c) => c.parent_id === p.id);
  const subRaw = (product.subcategory || '').trim();
  const sub = children.find(
    (c) =>
      c.name === subRaw ||
      c.slug?.toLowerCase() === subRaw.toLowerCase().replace(/\s+/g, '-') ||
      c.name.toLowerCase() === subRaw.toLowerCase(),
  );

  return {
    parentId: p.id,
    subId: sub?.id ?? none,
  };
}
