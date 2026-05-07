import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { getProducts, type Product as ApiProduct } from "@/lib/productStore";
import { type Product as UiProduct } from "@/lib/data";

function normalizeBadge(badge: ApiProduct["badge"]): UiProduct["badge"] | undefined {
  if (badge === "new" || badge === "sale" || badge === "bestseller") return badge;
  return undefined;
}

function normalizeColorImages(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) out[k] = v;
  }
  return out;
}

function normalizeProduct(p: ApiProduct): UiProduct {
  const op =
    p.original_price != null && p.original_price !== ""
      ? Number(p.original_price)
      : undefined;
  const sub = p.sub_images ?? [];
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    original_price: Number.isFinite(op as number) ? op : undefined,
    originalPrice: Number.isFinite(op as number) ? op : undefined,
    image: p.image,
    hover_image: p.hover_image ?? undefined,
    hoverImage: p.hover_image ?? undefined,
    sub_images: sub,
    subImages: sub,
    category: p.category,
    subcategory: p.subcategory ?? "",
    sizes: p.sizes,
    colors: p.colors,
    color_images: normalizeColorImages((p as { color_images?: unknown }).color_images),
    badge: normalizeBadge(p.badge),
    rating: p.rating,
    reviews: p.reviews,
    description: p.description,
    material: p.material,
    fit: p.fit,
    sleeve_length: p.sleeve_length ?? undefined,
    neck_type: p.neck_type ?? undefined,
    pants_length: (p as { pants_length?: string }).pants_length ?? undefined,
    inventory: p.inventory,
    sku: p.sku,
    status: p.status,
  };
}

export const useProducts = (): UseQueryResult<UiProduct[]> => {
  const queryClient = useQueryClient();

  // Listen for product store updates and refetch
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    };
    window.addEventListener("products-updated", handler);
    return () => window.removeEventListener("products-updated", handler);
  }, [queryClient]);

  return useQuery<UiProduct[]>({
    queryKey: ["products"],
    queryFn: async (): Promise<UiProduct[]> => {
      // Request only active products from the server
      const result = await getProducts({ status: "active", limit: 500 });
      return result.data.map(normalizeProduct);
    },
  });
};
