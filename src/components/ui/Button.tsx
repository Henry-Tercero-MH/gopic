import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  // Tinta oscura fija sobre el lima de marca: 7.7:1 en ambos temas (vs 2.06:1 con blanco). Ver /color.
  primary: 'bg-action-500 text-on-action hover:bg-action-600 active:bg-action-700',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-sunk',
  ghost: 'bg-transparent text-text hover:bg-surface-sunk',
  danger: 'bg-danger text-text-invert hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors duration-100 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
