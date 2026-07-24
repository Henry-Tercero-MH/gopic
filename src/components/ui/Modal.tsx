import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  /** Se invoca con Escape o al hacer clic en el fondo. */
  onClose: () => void;
  /** Etiqueta accesible del diálogo (usar si no hay un título visible referenciable). */
  ariaLabel?: string;
  /** id de un título visible dentro del contenido, para `aria-labelledby`. */
  labelledBy?: string;
  /** Clases del panel (p. ej. ancho máximo). */
  className?: string;
  children: ReactNode;
}

/**
 * Shell accesible para diálogos: bloquea el scroll del fondo, cierra con Escape,
 * atrapa el foco dentro del panel y lo devuelve al elemento previo al cerrar.
 * El contenido y su cabecera los aporta cada consumidor.
 */
export function Modal({ onClose, ariaLabel, labelledBy, className, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Foco inicial: primer elemento enfocable del panel, o el panel mismo.
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
      const primero = foco[0];
      const ultimo = foco[foco.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && activo === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previo?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-modal grid place-items-center bg-text/40 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn('overflow-hidden rounded-xl bg-surface shadow-modal focus:outline-none', className)}
      >
        {children}
      </div>
    </div>
  );
}
