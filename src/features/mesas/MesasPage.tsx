import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, ShoppingBag, Plus, Pencil, Trash2, Settings2, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { RUTAS } from '@/lib/rutas';
import { useOperacion, type MesaInput } from '@/lib/operacion';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';
import type { EstadoMesa, Mesa } from '@/mock/data';

const estadoConfig: Record<EstadoMesa, { label: string; tone: 'neutral' | 'action' | 'warning' | 'info'; ring: string }> = {
  libre: { label: 'Libre', tone: 'neutral', ring: 'border-border' },
  ocupada: { label: 'Ocupada', tone: 'action', ring: 'border-action-500' },
  cuenta: { label: 'Pidió cuenta', tone: 'warning', ring: 'border-accent-600' },
  reservada: { label: 'Reservada', tone: 'info', ring: 'border-info' },
};

export function MesasPage() {
  const { mesas, abrirMesa, crearMesa, editarMesa, eliminarMesa } = useOperacion();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Mesa | null>(null);

  const zonas = [...new Set(mesas.map((m) => m.zona))];
  const ocupadas = mesas.filter((m) => m.estado !== 'libre' && m.estado !== 'reservada').length;
  const mesero = user?.nombre ?? 'Mesero';

  function abrirCuenta(mesa: Mesa) {
    if (mesa.estado === 'reservada') {
      toast.advertencia(`${mesa.nombre} está reservada.`);
      return;
    }
    if (mesa.estado === 'libre') {
      abrirMesa(mesa.id, mesero);
      toast.exito(`${mesa.nombre} abierta. Toma la comanda.`);
    }
    navigate(`${RUTAS.pos}?mesa=${mesa.id}`);
  }

  function nuevaMesa() {
    setEditando(null);
    setModalAbierto(true);
  }

  function editar(mesa: Mesa) {
    setEditando(mesa);
    setModalAbierto(true);
  }

  function guardar(datos: MesaInput) {
    if (editando) {
      editarMesa(editando.id, datos);
      toast.exito(`${datos.nombre} actualizada.`);
    } else {
      crearMesa(datos);
      toast.exito(`${datos.nombre} creada.`);
    }
    setModalAbierto(false);
  }

  async function eliminar(mesa: Mesa) {
    if (mesa.estado !== 'libre' && mesa.estado !== 'reservada') {
      toast.error(`${mesa.nombre} tiene una cuenta abierta. Cóbrala antes de eliminarla.`);
      return;
    }
    const ok = await confirm({
      titulo: 'Eliminar mesa',
      mensaje: `¿Eliminar "${mesa.nombre}"? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    eliminarMesa(mesa.id);
    toast.info(`${mesa.nombre} eliminada.`);
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">Mapa de mesas</h1>
          <p className="text-sm text-text-muted">
            {admin ? `${mesas.length} mesas registradas` : `${ocupadas} de ${mesas.length} en servicio`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {admin ? (
            <>
              <Button onClick={nuevaMesa}>
                <Plus size={18} /> Nueva mesa
              </Button>
              <Button variant="secondary" onClick={() => setAdmin(false)}>
                Salir de administración
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate(`${RUTAS.pos}?tipo=mostrador`)}>
                <Store size={18} /> Venta en mostrador
              </Button>
              <Button variant="secondary" onClick={() => navigate(`${RUTAS.pos}?tipo=llevar`)}>
                <ShoppingBag size={18} /> Para llevar
              </Button>
              <Button variant="secondary" onClick={() => setAdmin(true)}>
                <Settings2 size={18} /> Administrar mesas
              </Button>
            </>
          )}
        </div>
      </header>

      {admin ? (
        <div className="rounded-lg border border-info/30 bg-info/5 px-4 py-2 text-sm text-info">
          Modo administración: crea, edita o elimina mesas. Solo puedes eliminar mesas libres o reservadas.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 text-sm">
          {(Object.keys(estadoConfig) as EstadoMesa[]).map((e) => (
            <span key={e} className="inline-flex items-center gap-1.5 text-text-muted">
              <span className={cn('h-3 w-3 rounded-full border-2', estadoConfig[e].ring)} />
              {estadoConfig[e].label}
            </span>
          ))}
        </div>
      )}

      {zonas.map((zona) => (
        <section key={zona}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">{zona}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {mesas.filter((m) => m.zona === zona).map((m) => (
              <MesaCard
                key={m.id}
                mesa={m}
                admin={admin}
                onAbrir={() => abrirCuenta(m)}
                onEditar={() => editar(m)}
                onEliminar={() => eliminar(m)}
              />
            ))}
          </div>
        </section>
      ))}

      {modalAbierto && (
        <MesaModal
          mesa={editando}
          zonasExistentes={zonas}
          onCerrar={() => setModalAbierto(false)}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}

function MesaCard({
  mesa,
  admin,
  onAbrir,
  onEditar,
  onEliminar,
}: {
  mesa: Mesa;
  admin: boolean;
  onAbrir: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const cfg = estadoConfig[mesa.estado];

  // En modo administración la tarjeta no abre cuenta: muestra acciones de edición.
  if (admin) {
    return (
      <div className={cn('flex flex-col rounded-lg border-2 bg-surface p-4 shadow-card', cfg.ring)}>
        <div className="flex items-start justify-between">
          <span className="font-display text-lg font-semibold text-text">{mesa.nombre}</span>
          <Badge tone={cfg.tone}>{cfg.label}</Badge>
        </div>
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted">
          <Users size={13} /> {mesa.capacidad} personas · {mesa.zona}
        </span>
        <div className="mt-4 flex gap-1.5">
          <button
            onClick={onEditar}
            aria-label={`Editar ${mesa.nombre}`}
            className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onEliminar}
            aria-label={`Eliminar ${mesa.nombre}`}
            className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onAbrir}
      className={cn(
        'flex flex-col rounded-lg border-2 bg-surface p-4 text-left shadow-card transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
        cfg.ring,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-lg font-semibold text-text">{mesa.nombre}</span>
        <Badge tone={cfg.tone}>{cfg.label}</Badge>
      </div>
      <span className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted">
        <Users size={13} /> {mesa.capacidad} personas
      </span>

      {mesa.estado === 'libre' ? (
        <span className="mt-4 text-sm text-text-muted">Toca para abrir cuenta</span>
      ) : mesa.estado === 'reservada' ? (
        <span className="mt-4 text-sm text-info">Reservada 19:00</span>
      ) : (
        <div className="mt-4 space-y-1">
          <div className="num text-xl font-semibold text-brand-700">{formatCurrency(mesa.totalActual ?? 0)}</div>
          <div className="text-xs text-text-muted">
            {mesa.mesero ?? '—'}
            {mesa.estado === 'cuenta' && ' · pidió cuenta'}
          </div>
        </div>
      )}
    </button>
  );
}

function MesaModal({
  mesa,
  zonasExistentes,
  onCerrar,
  onGuardar,
}: {
  mesa: Mesa | null;
  zonasExistentes: string[];
  onCerrar: () => void;
  onGuardar: (datos: MesaInput) => void;
}) {
  const [nombre, setNombre] = useState(mesa?.nombre ?? '');
  const [zona, setZona] = useState(mesa?.zona ?? zonasExistentes[0] ?? 'Salón');
  const [capacidad, setCapacidad] = useState(String(mesa?.capacidad ?? 2));

  const capacidadNum = parseInt(capacidad, 10);
  const valido = nombre.trim() !== '' && zona.trim() !== '' && capacidadNum > 0;

  const inputCls =
    'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

  return (
    <Modal onClose={onCerrar} ariaLabel={mesa ? 'Editar mesa' : 'Nueva mesa'} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{mesa ? 'Editar mesa' : 'Nueva mesa'}</h3>
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
          <span className="text-sm font-medium text-text">Nombre</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Mesa 10, Barra 3…"
            autoFocus
            className={inputCls}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text">Zona</span>
            <input
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Salón, Terraza…"
              list="zonas-existentes"
              className={inputCls}
            />
            <datalist id="zonas-existentes">
              {zonasExistentes.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text">Capacidad</span>
            <input
              type="number"
              min={1}
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              className={cn(inputCls, 'num')}
            />
          </label>
        </div>
      </div>

      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button
          disabled={!valido}
          onClick={() => onGuardar({ nombre: nombre.trim(), zona: zona.trim(), capacidad: capacidadNum })}
        >
          <Check size={18} /> Guardar
        </Button>
      </footer>
    </Modal>
  );
}
