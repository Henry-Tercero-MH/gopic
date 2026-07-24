import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface DrawerProps {
  /** Controla visibilidad; el panel permanece montado para animar la salida. */
  open: boolean;
  /** Se invoca con Escape o al hacer clic en el fondo. */
  onClose: () => void;
  /** Lado desde el que entra el panel. */
  side?: 'right' | 'left';
  ariaLabel?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Panel lateral deslizante y accesible: mientras está abierto bloquea el scroll
 * del fondo, cierra con Escape, atrapa el foco y lo devuelve al cerrar.
 * Comparte el contrato de accesibilidad con `<Modal>`, cambiando solo el layout.
 */
export function Drawer({
  open,
  onClose,
  side = 'right',
  ariaLabel,
  labelledBy,
  className,
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const previoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previoRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const primero = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (primero ?? panel)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const foco = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (foco.length === 0) {
        e.preventDefault();
        return;
      }
      const inicio = foco[0];
      const fin = foco[foco.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && activo === inicio) {
        e.preventDefault();
        fin.focus();
      } else if (!e.shiftKey && activo === fin) {
        e.preventDefault();
        inicio.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previoRef.current?.focus();
    };
  }, [open, onClose]);

  const cerrado = side === 'right' ? 'translate-x-full' : '-translate-x-full';

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'fixed inset-0 z-modal bg-text/40 transition-opacity duration-100 motion-reduce:transition-none',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          'fixed top-0 z-modal flex h-full w-full max-w-md flex-col bg-surface shadow-modal transition-transform duration-100 ease-out focus:outline-none motion-reduce:transition-none',
          side === 'right' ? 'right-0' : 'left-0',
          open ? 'translate-x-0' : cerrado,
          className,
        )}
      >
        {open && children}
      </aside>
    </>
  );
}
