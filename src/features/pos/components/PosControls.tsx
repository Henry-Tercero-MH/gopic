import { Plus, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Botón de método de pago (efectivo / tarjeta). */
export function MetodoBtn({
  activo,
  icon: Icon,
  label,
  onClick,
}: {
  activo: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border p-4 text-sm font-semibold transition-colors',
        activo
          ? 'border-action-500 bg-action-50 text-action-700'
          : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
      )}
    >
      <Icon size={24} />
      {label}
    </button>
  );
}

/** Chip de categoría del catálogo del POS. */
export function CatChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
        active
          ? 'border-action-500 bg-action-50 text-action-700'
          : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
      )}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

/** Botón +/- para ajustar la cantidad de una línea del ticket. */
export function StepBtn({ dir, onClick }: { dir: 'up' | 'down'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-text hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
      aria-label={dir === 'up' ? 'Aumentar' : 'Disminuir'}
    >
      {dir === 'up' ? <Plus size={16} /> : <Minus size={16} />}
    </button>
  );
}
