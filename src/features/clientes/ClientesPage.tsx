import { useState, type ReactNode } from 'react';
import { UserPlus, Pencil, Trash2, X, Check, Search, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';

interface Cliente {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  visitas: number;
}

const CLIENTES_SEED: Cliente[] = [
  { id: 'c-1', nombre: 'Consumidor Final', nit: 'CF', telefono: '', email: '', visitas: 0 },
  { id: 'c-2', nombre: 'María Fernández', nit: '2456781-0', telefono: '+502 5544 1122', email: 'maria.f@mail.gt', visitas: 18 },
  { id: 'c-3', nombre: 'Restaurante El Buen Sabor', nit: '789123-4', telefono: '+502 2233 4455', email: 'compras@buensabor.gt', visitas: 42 },
  { id: 'c-4', nombre: 'José Morales', nit: '5566778-9', telefono: '+502 5566 7788', email: 'jose.morales@mail.gt', visitas: 7 },
];

const inputCls =
  'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

const iniciales = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES_SEED);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const q = busqueda.trim().toLowerCase();
  const visibles = clientes.filter(
    (c) => !q || c.nombre.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q),
  );

  function guardar(c: Cliente) {
    const esNuevo = !clientes.some((x) => x.id === c.id);
    setClientes((prev) => (esNuevo ? [...prev, c] : prev.map((x) => (x.id === c.id ? c : x))));
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
    setClientes((prev) => prev.filter((x) => x.id !== c.id));
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
                        <Badge tone="accent"><Star size={12} className="mr-1" /> {c.visitas}</Badge>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
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
          onClick={() => onGuardar({ id: cliente?.id ?? `c-${Date.now()}`, nombre: nombre.trim(), nit: nit.trim(), telefono: telefono.trim(), email: email.trim(), visitas: cliente?.visitas ?? 0 })}
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
