import { Card } from './Card';
import { cn } from '@/lib/cn';

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive: boolean };
  icon?: string;
}

export function StatCard({ label, value, hint, trend, icon }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        {icon && <span className="text-lg" aria-hidden>{icon}</span>}
      </div>
      <div className="num mt-2 text-2xl font-semibold text-text">{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              'num text-xs font-semibold',
              trend.positive ? 'text-success' : 'text-danger',
            )}
          >
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
        )}
        {hint && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
    </Card>
  );
}
