import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmOpciones {
  titulo: string;
  mensaje: string;
  /** Texto del botón de confirmación (nombra la acción: "Eliminar", "Cerrar caja"). */
  confirmar?: string;
  cancelar?: string;
  /** Marca la acción como destructiva → botón rojo. */
  peligro?: boolean;
}

type ConfirmFn = (opciones: ConfirmOpciones) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Diálogo de confirmación imperativo: `const ok = await confirm({...})`.
 * Reutiliza la primitiva Modal (focus-trap, Escape, scroll-lock).
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opciones, setOpciones] = useState<ConfirmOpciones | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOpciones(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const cerrar = useCallback((valor: boolean) => {
    resolver.current?.(valor);
    resolver.current = null;
    setOpciones(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opciones && (
        <Modal onClose={() => cerrar(false)} ariaLabel={opciones.titulo} className="w-full max-w-sm">
          <div className="p-5">
            <div className="flex items-start gap-3">
              {opciones.peligro && (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger/12 text-danger">
                  <AlertTriangle size={20} />
                </span>
              )}
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-text">{opciones.titulo}</h3>
                <p className="mt-1 text-sm text-text-muted">{opciones.mensaje}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => cerrar(false)}>
                {opciones.cancelar ?? 'Cancelar'}
              </Button>
              <Button variant={opciones.peligro ? 'danger' : 'primary'} onClick={() => cerrar(true)}>
                {opciones.confirmar ?? 'Confirmar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>.');
  return ctx;
}
