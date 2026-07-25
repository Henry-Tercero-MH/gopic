/**
 * Sistema de notificaciones (toasts) de la demo.
 * Cola en memoria con autodescarte; cada toast se cierra solo tras `duracion`.
 * Se consume con `useToast()` → `toast.exito(...)`, `toast.error(...)`, etc.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTipo = 'exito' | 'error' | 'info' | 'advertencia';

interface Toast {
  id: number;
  tipo: ToastTipo;
  mensaje: string;
}

interface ToastApi {
  exito: (mensaje: string) => void;
  error: (mensaje: string) => void;
  info: (mensaje: string) => void;
  advertencia: (mensaje: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURACION_MS = 3200;

const estilos: Record<ToastTipo, { icon: LucideIcon; barra: string; icono: string }> = {
  exito: { icon: CheckCircle2, barra: 'bg-success', icono: 'text-success' },
  error: { icon: XCircle, barra: 'bg-danger', icono: 'text-danger' },
  info: { icon: Info, barra: 'bg-info', icono: 'text-info' },
  advertencia: { icon: AlertTriangle, barra: 'bg-warning', icono: 'text-warning' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const siguienteId = useRef(1);

  const descartar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const emitir = useCallback(
    (tipo: ToastTipo, mensaje: string) => {
      const id = siguienteId.current++;
      setToasts((prev) => [...prev, { id, tipo, mensaje }]);
      window.setTimeout(() => descartar(id), DURACION_MS);
    },
    [descartar],
  );

  const api = useMemo<ToastApi>(
    () => ({
      exito: (m) => emitir('exito', m),
      error: (m) => emitir('error', m),
      info: (m) => emitir('info', m),
      advertencia: (m) => emitir('advertencia', m),
    }),
    [emitir],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onCerrar={() => descartar(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onCerrar }: { toast: Toast; onCerrar: () => void }) {
  const { icon: Icon, barra, icono } = estilos[toast.tipo];
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-lg border border-border bg-surface p-3 shadow-modal',
        'animate-[toast-in_150ms_ease-out] motion-reduce:animate-none',
      )}
    >
      <span className={cn('mt-0.5 shrink-0', icono)}>
        <Icon size={20} />
      </span>
      <p className="flex-1 pt-0.5 text-sm font-medium text-text">{toast.mensaje}</p>
      <button
        onClick={onCerrar}
        aria-label="Cerrar notificación"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-text-muted hover:bg-surface-sunk hover:text-text"
      >
        <X size={16} />
      </button>
      <span className={cn('absolute bottom-0 left-0 h-1 w-full', barra)} aria-hidden />
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  return ctx;
}
