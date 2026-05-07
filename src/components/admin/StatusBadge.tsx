import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/orderStore';

type ProductStatus = 'active' | 'draft' | 'archived';

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  processing: { label: 'Processing', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  shipped: { label: 'Shipped', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
  delivered: { label: 'Delivered', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  refunded: { label: 'Refunded', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
};

const productStatusConfig: Record<ProductStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  draft: { label: 'Draft', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  archived: { label: 'Archived', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
};

interface StatusBadgeProps {
  status: OrderStatus | ProductStatus;
  type?: 'order' | 'product';
  className?: string;
}

export const StatusBadge = ({ status, type = 'order', className }: StatusBadgeProps) => {
  const config = type === 'order'
    ? orderStatusConfig[status as OrderStatus]
    : productStatusConfig[status as ProductStatus];

  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        config.className,
        className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
};
