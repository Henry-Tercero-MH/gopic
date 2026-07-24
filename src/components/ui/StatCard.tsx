import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { cn } from '@/lib/cn';

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive: boolean };
  icon?: LucideIcon;
  iconTone?: 'brand' | 'action' | 'accent' | 'info';
}

const iconTones: Record<NonNullable<StatCardProps['iconTone']>, string> = {
  brand: 'bg-brand-100 text-brand-700',
  action: 'bg-action-50 text-action-700',
  accent: 'bg-accent-400/20 text-accent-600',
  info: 'bg-info/12 text-info',
};

export function StatCard({ label, value, hint, trend, icon: Icon, iconTone = 'brand' }: StatCardProps) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-start justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        {Icon && (
          <span className={cn('grid h-8 w-8 place-items-center rounded-md', iconTones[iconTone])}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="num mt-2 text-xl font-semibold text-text sm:text-2xl">{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              'num inline-flex items-center gap-0.5 text-xs font-semibold',
              trend.positive ? 'text-success' : 'text-danger',
            )}
          >
            {trend.positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
    </Card>
  );
}
