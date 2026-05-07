/** Storefront policy routes — used by Policy page, Header, Footer */
export const POLICIES = [
  { id: 'refund', slug: 'refund-policy', name: 'Refund Policy', navLabel: 'Refund' },
  { id: 'returns', slug: 'return-exchange-policy', name: 'Return & Exchange', navLabel: 'Returns' },
  { id: 'shipping', slug: 'shipping-policy', name: 'Shipping Policy', navLabel: 'Shipping' },
  { id: 'privacy', slug: 'privacy', name: 'Privacy Policy', navLabel: 'Privacy' },
] as const;

export type PolicyId = (typeof POLICIES)[number]['id'];

export function policyIdFromSlug(slug: string | undefined): PolicyId | null {
  if (!slug) return null;
  const m = POLICIES.find((p) => p.slug === slug);
  return m ? (m.id as PolicyId) : null;
}
