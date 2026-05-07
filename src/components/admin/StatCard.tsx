import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  className?: string;
}

export const StatCard = ({ title, value, change, trend, icon: Icon, className }: StatCardProps) => (
  <div
    className={cn(
      'group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20',
      className
    )}
  >
    {/* Gradient accent line at top */}
    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-accent/60 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            )}
          >
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </div>
      <div className="rounded-xl bg-primary/5 p-3 transition-colors group-hover:bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);
