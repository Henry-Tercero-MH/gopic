import { useState } from 'react';
import { StickyNote, X, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const NOTAS_RAPIDAS = ['Sin cebolla', 'Sin tomate', 'Sin salsa', 'Para llevar', 'Extra salsa', 'Bien cocido'];

/** Editor de nota para una línea del ticket (aplica a cualquier producto). */
export function NotaLineaModal({
  nombre,
  notaActual,
  onGuardar,
  onCerrar,
}: {
  nombre: string;
  notaActual: string;
  onGuardar: (nota: string) => void;
  onCerrar: () => void;
}) {
  const [texto, setTexto] = useState(notaActual);

  /** Agrega/quita una nota rápida como fragmento separado por comas. */
  function toggleRapida(chip: string) {
    const partes = texto.split(',').map((s) => s.trim()).filter(Boolean);
    const i = partes.findIndex((p) => p.toLowerCase() === chip.toLowerCase());
    if (i >= 0) partes.splice(i, 1);
    else partes.push(chip);
    setTexto(partes.join(', '));
  }

  return (
    <Modal onClose={onCerrar} ariaLabel={`Nota para ${nombre}`} className="w-full max-w-sm">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-text">
            <StickyNote size={18} className="text-text-muted" /> Nota
          </h3>
          <p className="truncate text-sm text-text-muted">{nombre}</p>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {NOTAS_RAPIDAS.map((chip) => {
            const activo = texto.toLowerCase().includes(chip.toLowerCase());
            return (
              <button
                key={chip}
                onClick={() => toggleRapida(chip)}
                aria-pressed={activo}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                  activo
                    ? 'border-action-500 bg-action-50 text-action-700'
                    : 'border-border text-text-muted hover:bg-surface-sunk',
                )}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoFocus
          rows={3}
          placeholder="Ej. sin cebolla, término medio…"
          className="w-full resize-none rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
        />
      </div>

      <footer className="grid grid-cols-2 gap-2 border-t border-border p-4">
        <Button variant="secondary" size="lg" onClick={() => onGuardar('')}>
          Quitar nota
        </Button>
        <Button size="lg" onClick={() => onGuardar(texto)}>
          <Check size={18} /> Guardar
        </Button>
      </footer>
    </Modal>
  );
}
