import { useState, type ReactNode } from 'react';
import { UserPlus, Pencil, Trash2, X, Check, Search, Star, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { useOperacion, type Cliente, type MovimientoLealtad } from '@/lib/operacion';
import { cn } from '@/lib/cn';

const inputCls =
  'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

const iniciales = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');

export function ClientesPage() {
  const { clientes, setClientes, lealtad } = useOperacion();
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [historialDe, setHistorialDe] = useState<Cliente | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const q = busqueda.trim().toLowerCase();
  const visibles = clientes.filter(
    (c) => !q || c.nombre.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q),
  );

  function guardar(c: Cliente) {
    const esNuevo = !clientes.some((x) => x.id === c.id);
    setClientes(esNuevo ? [...clientes, c] : clientes.map((x) => (x.id === c.id ? c : x)));
    setAbierto(false);
    toast.exito(esNuevo ? `Cliente "${c.nombre}" agregado.` : `Cliente "${c.nombre}" actualizado.`);
  }

  async function eliminar(c: Cliente) {
    const ok = await confirm({
      titulo: 'Eliminar cliente',
      mensaje: `¿Eliminar a "${c.nombre}"? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    setClientes(clientes.filter((x) => x.id !== c.id));
    toast.info(`Cliente "${c.nombre}" eliminado.`);
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Clientes"
        subtitle="Directorio de clientes para facturación y fidelización"
        actions={
          <Button onClick={() => { setEditando(null); setAbierto(true); }}>
            <UserPlus size={18} /> Nuevo cliente
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="relative max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o NIT…"
              className="h-10 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        {visibles.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-muted">Sin resultados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-2.5 font-semibold">Cliente</th>
                  <th className="px-4 py-2.5 font-semibold">NIT</th>
                  <th className="px-4 py-2.5 font-semibold">Contacto</th>
                  <th className="px-4 py-2.5 font-semibold">Visitas</th>
                  <th className="px-4 py-2.5 font-semibold">Puntos</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                          {iniciales(c.nombre) || 'CF'}
                        </span>
                        <span className="font-medium text-text">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="num px-4 py-3 text-text-muted">{c.nit || '—'}</td>
                    <td className="px-4 py-3 text-text-muted">
                      <div>{c.telefono || '—'}</div>
                      {c.email && <div className="text-xs">{c.email}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {c.visitas > 0 ? (
                        <span className="num text-text-muted">{c.visitas}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.puntos > 0 ? (
                        <Badge tone="accent"><Star size={12} className="mr-1" /> {c.puntos} pts</Badge>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setHistorialDe(c)}
                          aria-label="Ver historial de puntos"
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text"
                        >
                          <History size={16} />
                        </button>
                        <button
                          onClick={() => { setEditando(c); setAbierto(true); }}
                          aria-label="Editar"
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => eliminar(c)}
                          aria-label="Eliminar"
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {abierto && <ClienteModal cliente={editando} onCerrar={() => setAbierto(false)} onGuardar={guardar} />}

      <HistorialLealtadDrawer
        cliente={historialDe}
        movimientos={historialDe ? lealtad.filter((m) => m.clienteId === historialDe.id) : []}
        onClose={() => setHistorialDe(null)}
      />
    </div>
  );
}

function ClienteModal({ cliente, onCerrar, onGuardar }: { cliente: Cliente | null; onCerrar: () => void; onGuardar: (c: Cliente) => void }) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? '');
  const [nit, setNit] = useState(cliente?.nit ?? '');
  const [telefono, setTelefono] = useState(cliente?.telefono ?? '');
  const [email, setEmail] = useState(cliente?.email ?? '');
  const valido = nombre.trim() !== '';

  return (
    <Modal onClose={onCerrar} ariaLabel={cliente ? 'Editar cliente' : 'Nuevo cliente'} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{cliente ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <button onClick={onCerrar} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk">
          <X size={18} />
        </button>
      </header>
      <div className="space-y-4 p-4">
        <Campo label="Nombre / Razón social">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus className={inputCls} />
        </Campo>
        <Campo label="NIT">
          <input value={nit} onChange={(e) => setNit(e.target.value)} placeholder="CF" className={cn(inputCls, 'num')} />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Teléfono">
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputCls} />
          </Campo>
          <Campo label="Correo">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </Campo>
        </div>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button
          disabled={!valido}
          onClick={() => onGuardar({ id: cliente?.id ?? `c-${Date.now()}`, nombre: nombre.trim(), nit: nit.trim(), telefono: telefono.trim(), email: email.trim(), visitas: cliente?.visitas ?? 0, puntos: cliente?.puntos ?? 0 })}
        >
          <Check size={18} /> Guardar
        </Button>
      </footer>
    </Modal>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
    </label>
  );
}

function HistorialLealtadDrawer({
  cliente,
  movimientos,
  onClose,
}: {
  cliente: Cliente | null;
  movimientos: MovimientoLealtad[];
  onClose: () => void;
}) {
  return (
    <Drawer open={cliente !== null} onClose={onClose} ariaLabel="Historial de puntos">
      {cliente && (
        <>
          <header className="flex items-start justify-between border-b border-border p-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-text">{cliente.nombre}</h2>
              <p className="num mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-accent-600">
                <Star size={14} /> {cliente.puntos} puntos disponibles
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
            >
              <X size={18} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-auto scroll-thin p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <History size={14} /> Movimientos de puntos
            </div>
            {movimientos.length === 0 ? (
              <div className="grid place-items-center py-10 text-center">
                <div>
                  <Star size={32} className="mx-auto text-text-muted" />
                  <p className="mt-2 text-sm font-medium text-text">Sin movimientos aún</p>
                  <p className="text-sm text-text-muted">Los puntos aparecerán al cobrar compras de este cliente.</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {movimientos.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-text">{m.descripcion}</div>
                      <div className="num text-xs text-text-muted">{m.fecha}</div>
                    </div>
                    <span className={cn('num text-sm font-semibold', m.puntos >= 0 ? 'text-success' : 'text-danger')}>
                      {m.puntos >= 0 ? '+' : ''}{m.puntos} pts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
