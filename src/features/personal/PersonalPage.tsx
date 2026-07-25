import { useMemo, useState } from 'react';
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Clock,
  Users,
  UserCheck,
  UserX,
  X,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { empleadosSeed, type Empleado, type EstadoMarcaje, type Puesto } from '@/mock/data';

const PUESTOS: Puesto[] = ['Cajero', 'Mesero', 'Barista', 'Cocina', 'Almacenista', 'Administrador'];

const estadoMarcaje: Record<EstadoMarcaje, { label: string; tone: 'success' | 'neutral' | 'info' }> = {
  trabajando: { label: 'En turno', tone: 'success' },
  sin_marcar: { label: 'Sin marcar', tone: 'neutral' },
  salio: { label: 'Salió', tone: 'info' },
};

const iniciales = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');

const horaActual = () =>
  new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

export function PersonalPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>(empleadosSeed);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const q = busqueda.trim().toLowerCase();
  const visibles = useMemo(
    () => empleados.filter((e) => !q || e.nombre.toLowerCase().includes(q) || e.puesto.toLowerCase().includes(q)),
    [empleados, q],
  );

  const enTurno = empleados.filter((e) => e.estado === 'trabajando').length;
  const ausentes = empleados.filter((e) => e.estado === 'sin_marcar').length;

  /** Marca la entrada del empleado (registra la hora y lo pone "en turno"). */
  function marcarEntrada(e: Empleado) {
    setEmpleados((prev) =>
      prev.map((x) => (x.id === e.id ? { ...x, estado: 'trabajando', entrada: horaActual(), salida: null } : x)),
    );
    toast.exito(`${e.nombre} marcó entrada.`);
  }

  /** Marca la salida del empleado (registra la hora y lo pone "salió"). */
  function marcarSalida(e: Empleado) {
    setEmpleados((prev) =>
      prev.map((x) => (x.id === e.id ? { ...x, estado: 'salio', salida: horaActual() } : x)),
    );
    toast.info(`${e.nombre} marcó salida.`);
  }

  function guardar(emp: Empleado) {
    const esNuevo = !empleados.some((x) => x.id === emp.id);
    setEmpleados((prev) => (esNuevo ? [...prev, emp] : prev.map((x) => (x.id === emp.id ? emp : x))));
    setModalAbierto(false);
    toast.exito(esNuevo ? `${emp.nombre} agregado al personal.` : `${emp.nombre} actualizado.`);
  }

  async function eliminar(e: Empleado) {
    const ok = await confirm({
      titulo: 'Eliminar empleado',
      mensaje: `¿Eliminar a "${e.nombre}" del personal? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    setEmpleados((prev) => prev.filter((x) => x.id !== e.id));
    toast.info(`${e.nombre} eliminado.`);
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Personal"
        subtitle="Empleados, turnos y control de marcaje"
        actions={
          <Button onClick={() => { setEditando(null); setModalAbierto(true); }}>
            <UserPlus size={18} /> Nuevo empleado
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Users} label="Total del personal" valor={String(empleados.length)} tono="brand" />
        <Kpi icon={UserCheck} label="En turno ahora" valor={String(enTurno)} tono="success" />
        <Kpi icon={UserX} label="Sin marcar" valor={String(ausentes)} tono="accent" />
        <Kpi icon={Clock} label="Turnos activos" valor="2" tono="info" hint="mañana y tarde" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="relative max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o puesto…"
              className="h-10 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none"
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
                  <th className="px-4 py-2.5 font-semibold">Empleado</th>
                  <th className="px-4 py-2.5 font-semibold">Puesto</th>
                  <th className="px-4 py-2.5 font-semibold">Turno</th>
                  <th className="px-4 py-2.5 font-semibold">Entrada</th>
                  <th className="px-4 py-2.5 font-semibold">Salida</th>
                  <th className="px-4 py-2.5 font-semibold">Estado</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Marcaje</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                          {e.iniciales || iniciales(e.nombre)}
                        </span>
                        <span className="font-medium text-text">{e.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{e.puesto}</td>
                    <td className="px-4 py-3 text-text-muted">{e.turno}</td>
                    <td className="num px-4 py-3 text-text">{e.entrada ?? '—'}</td>
                    <td className="num px-4 py-3 text-text">{e.salida ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge tone={estadoMarcaje[e.estado].tone}>{estadoMarcaje[e.estado].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {e.estado === 'trabajando' ? (
                          <Button size="sm" variant="secondary" onClick={() => marcarSalida(e)}>
                            <LogOut size={15} /> Salida
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => marcarEntrada(e)}>
                            <LogIn size={15} /> {e.estado === 'salio' ? 'Reingresar' : 'Entrada'}
                          </Button>
                        )}
                        <button
                          onClick={() => { setEditando(e); setModalAbierto(true); }}
                          aria-label={`Editar ${e.nombre}`}
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => eliminar(e)}
                          aria-label={`Eliminar ${e.nombre}`}
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
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

      {modalAbierto && (
        <EmpleadoModal empleado={editando} onCerrar={() => setModalAbierto(false)} onGuardar={guardar} />
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  valor,
  tono,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  tono: 'brand' | 'success' | 'info' | 'accent';
  hint?: string;
}) {
  const tonos: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-success/15 text-success',
    info: 'bg-info/12 text-info',
    accent: 'bg-accent-400/25 text-accent-600',
  };
  return (
    <Card className="p-4">
      <span className={cn('grid h-9 w-9 place-items-center rounded-md', tonos[tono])}>
        <Icon size={18} />
      </span>
      <p className="mt-3 text-sm text-text-muted">{label}</p>
      <p className="num mt-0.5 text-2xl font-semibold text-text">{valor}</p>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </Card>
  );
}

function EmpleadoModal({
  empleado,
  onCerrar,
  onGuardar,
}: {
  empleado: Empleado | null;
  onCerrar: () => void;
  onGuardar: (e: Empleado) => void;
}) {
  const [nombre, setNombre] = useState(empleado?.nombre ?? '');
  const [puesto, setPuesto] = useState<Puesto>(empleado?.puesto ?? 'Mesero');
  const [telefono, setTelefono] = useState(empleado?.telefono ?? '');
  const [turno, setTurno] = useState(empleado?.turno ?? 'Mañana · 07:00–15:00');

  const valido = nombre.trim() !== '';

  const inputCls =
    'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

  function guardar() {
    const nombreLimpio = nombre.trim();
    onGuardar({
      id: empleado?.id ?? `e-${Date.now()}`,
      nombre: nombreLimpio,
      puesto,
      telefono: telefono.trim(),
      turno: turno.trim(),
      iniciales: iniciales(nombreLimpio),
      estado: empleado?.estado ?? 'sin_marcar',
      entrada: empleado?.entrada ?? null,
      salida: empleado?.salida ?? null,
    });
  }

  return (
    <Modal onClose={onCerrar} ariaLabel={empleado ? 'Editar empleado' : 'Nuevo empleado'} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{empleado ? 'Editar empleado' : 'Nuevo empleado'}</h3>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium text-text">Nombre completo</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text">Puesto</span>
            <select value={puesto} onChange={(e) => setPuesto(e.target.value as Puesto)} className={inputCls}>
              {PUESTOS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text">Teléfono</span>
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputCls} />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-text">Turno</span>
          <input value={turno} onChange={(e) => setTurno(e.target.value)} placeholder="Mañana · 07:00–15:00" className={inputCls} />
        </label>
      </div>

      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={guardar}>
          <Check size={18} /> Guardar
        </Button>
      </footer>
    </Modal>
  );
}
