import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  Store,
  Printer,
  Users,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Pencil,
  UserPlus,
  X,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ */
/*  Catálogo de permisos por módulo                                   */
/* ------------------------------------------------------------------ */

interface Permiso {
  id: string;
  label: string;
}
interface GrupoPermisos {
  modulo: string;
  permisos: Permiso[];
}

const CATALOGO_PERMISOS: GrupoPermisos[] = [
  {
    modulo: 'Punto de venta',
    permisos: [
      { id: 'pos.ver', label: 'Ver y tomar pedidos' },
      { id: 'pos.cobrar', label: 'Cobrar' },
      { id: 'pos.descuento', label: 'Aplicar descuentos' },
      { id: 'pos.cancelar', label: 'Anular ticket' },
    ],
  },
  {
    modulo: 'Caja',
    permisos: [
      { id: 'caja.abrir', label: 'Abrir / cerrar caja' },
      { id: 'caja.retiro', label: 'Retiros y cortes' },
    ],
  },
  {
    modulo: 'Mesas',
    permisos: [
      { id: 'mesas.ver', label: 'Ver mesas' },
      { id: 'mesas.gestionar', label: 'Abrir, mover y unir' },
      { id: 'mesas.dividir', label: 'Dividir cuenta' },
    ],
  },
  {
    modulo: 'Cocina (KDS)',
    permisos: [
      { id: 'kds.ver', label: 'Ver comandas' },
      { id: 'kds.marcar', label: 'Marcar preparado / entregar' },
    ],
  },
  {
    modulo: 'Inventario',
    permisos: [
      { id: 'inv.ver', label: 'Ver existencias' },
      { id: 'inv.ajustar', label: 'Ajustes y mermas' },
      { id: 'inv.comprar', label: 'Órdenes de compra' },
    ],
  },
  {
    modulo: 'Reportes',
    permisos: [
      { id: 'rep.ver', label: 'Ver reportes' },
      { id: 'rep.exportar', label: 'Exportar' },
    ],
  },
  {
    modulo: 'Configuración',
    permisos: [
      { id: 'cfg.negocio', label: 'Datos del negocio' },
      { id: 'cfg.usuarios', label: 'Usuarios y roles' },
    ],
  },
];

const TODOS_LOS_PERMISOS = CATALOGO_PERMISOS.flatMap((g) => g.permisos.map((p) => p.id));

/* ------------------------------------------------------------------ */
/*  Tipos y datos de demostración                                     */
/* ------------------------------------------------------------------ */

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  protegido?: boolean;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rolId: string;
  activo: boolean;
}

const ROLES_INICIALES: Rol[] = [
  { id: 'r-admin', nombre: 'Administrador', descripcion: 'Acceso total al sistema', permisos: [...TODOS_LOS_PERMISOS], protegido: true },
  { id: 'r-cajero', nombre: 'Cajero', descripcion: 'Cobra y maneja la caja', permisos: ['pos.ver', 'pos.cobrar', 'pos.descuento', 'pos.cancelar', 'caja.abrir', 'caja.retiro'] },
  { id: 'r-mesero', nombre: 'Mesero', descripcion: 'Toma pedidos y gestiona mesas', permisos: ['pos.ver', 'mesas.ver', 'mesas.gestionar', 'mesas.dividir', 'kds.ver'] },
  { id: 'r-barista', nombre: 'Barista / Cocina', descripcion: 'Prepara y marca comandas', permisos: ['kds.ver', 'kds.marcar', 'rep.ver'] },
  { id: 'r-almacen', nombre: 'Almacenista', descripcion: 'Controla el inventario', permisos: ['inv.ver', 'inv.ajustar', 'inv.comprar'] },
];

const USUARIOS_INICIALES: Usuario[] = [
  { id: 'u-1', nombre: 'Owner GOPIC', email: 'admin@gopic.gt', rolId: 'r-admin', activo: true },
  { id: 'u-2', nombre: 'Ana Rodríguez', email: 'ana@gopic.gt', rolId: 'r-cajero', activo: true },
  { id: 'u-3', nombre: 'Luis Pérez', email: 'luis@gopic.gt', rolId: 'r-mesero', activo: true },
  { id: 'u-4', nombre: 'Marta López', email: 'marta@gopic.gt', rolId: 'r-barista', activo: true },
  { id: 'u-5', nombre: 'Carlos Gómez', email: 'carlos@gopic.gt', rolId: 'r-almacen', activo: false },
];

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/* ------------------------------------------------------------------ */
/*  Página                                                            */
/* ------------------------------------------------------------------ */

type Pestana = 'general' | 'usuarios' | 'roles';

const PESTANAS: { id: Pestana; label: string; icon: LucideIcon }[] = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'roles', label: 'Roles y permisos', icon: ShieldCheck },
];

export function ConfigPage() {
  const [pestana, setPestana] = useState<Pestana>('general');
  const [roles, setRoles] = useState<Rol[]>(ROLES_INICIALES);
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIALES);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Configuración"
        subtitle="Negocio, impresión y control de accesos"
        actions={
          <Button>
            <Save size={18} /> Guardar cambios
          </Button>
        }
      />

      {/* Pestañas */}
      <div className="flex gap-1 border-b border-border">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPestana(p.id)}
            className={cn(
              '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              pestana === p.id
                ? 'border-action-500 text-action-700'
                : 'border-transparent text-text-muted hover:text-text',
            )}
          >
            <p.icon size={16} /> {p.label}
          </button>
        ))}
      </div>

      {pestana === 'general' && <GeneralTab />}
      {pestana === 'usuarios' && <UsuariosTab usuarios={usuarios} setUsuarios={setUsuarios} roles={roles} />}
      {pestana === 'roles' && <RolesTab roles={roles} setRoles={setRoles} usuarios={usuarios} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab General                                                       */
/* ------------------------------------------------------------------ */

function GeneralTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard icon={Store} title="Datos del negocio" desc="Información general de la sucursal">
        <Field label="Nombre comercial" value="GOPIC — Preparaciones con sabor" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono" value="+502 5555 1234" />
          <Field label="Moneda" value="GTQ (Q)" />
        </div>
        <Field label="Dirección" value="Zona 10, Ciudad de Guatemala" />
      </SectionCard>

      <SectionCard icon={Printer} title="Impresoras" desc="Ticket y comandas por estación">
        <Field label="Impresora de tickets" value="Epson TM-T20 (mostrador)" />
        <Field label="Impresora de cocina" value="Star TSP143 (cocina)" />
        <Field label="Impresora de barra" value="Epson TM-T20 (barra)" />
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Usuarios                                                      */
/* ------------------------------------------------------------------ */

function UsuariosTab({
  usuarios,
  setUsuarios,
  roles,
}: {
  usuarios: Usuario[];
  setUsuarios: Dispatch<SetStateAction<Usuario[]>>;
  roles: Rol[];
}) {
  const [modal, setModal] = useState(false);
  const nombreRol = (id: string) => roles.find((r) => r.id === id)?.nombre ?? '—';

  function toggleActivo(id: string) {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)));
  }
  function eliminar(id: string) {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  }
  function crear(nuevo: Omit<Usuario, 'id'>) {
    setUsuarios((prev) => [...prev, { ...nuevo, id: `u-${Date.now()}` }]);
    setModal(false);
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">Usuarios del sistema</h2>
          <p className="text-sm text-text-muted">{usuarios.length} cuentas · {usuarios.filter((u) => u.activo).length} activas</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <UserPlus size={18} /> Nuevo usuario
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
              <th className="px-4 py-2.5 font-semibold">Usuario</th>
              <th className="px-4 py-2.5 font-semibold">Rol</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
              <th className="px-4 py-2.5 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {iniciales(u.nombre)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-text">{u.nombre}</div>
                      <div className="truncate text-xs text-text-muted">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="brand">{nombreRol(u.rolId)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActivo(u.id)}
                    className="inline-flex items-center gap-2"
                    title={u.activo ? 'Desactivar' : 'Activar'}
                  >
                    <Switch on={u.activo} />
                    <span className={cn('text-xs font-medium', u.activo ? 'text-success' : 'text-text-muted')}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => eliminar(u.id)}
                    aria-label="Eliminar usuario"
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <UsuarioModal roles={roles} onCerrar={() => setModal(false)} onCrear={crear} />}
    </Card>
  );
}

function UsuarioModal({
  roles,
  onCerrar,
  onCrear,
}: {
  roles: Rol[];
  onCerrar: () => void;
  onCrear: (u: Omit<Usuario, 'id'>) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rolId, setRolId] = useState(roles[0]?.id ?? '');
  const [activo, setActivo] = useState(true);
  const valido = nombre.trim() !== '' && email.trim() !== '';

  return (
    <ModalShell titulo="Nuevo usuario" onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium text-text">Nombre completo</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Correo</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@gopic.gt"
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Rol</span>
          <select
            value={rolId}
            onChange={(e) => setRolId(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </label>
        <button onClick={() => setActivo((v) => !v)} className="flex items-center gap-2">
          <Switch on={activo} />
          <span className="text-sm text-text">{activo ? 'Cuenta activa' : 'Cuenta inactiva'}</span>
        </button>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={() => onCrear({ nombre, email, rolId, activo })}>
          <Check size={18} /> Crear usuario
        </Button>
      </footer>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Roles y permisos                                              */
/* ------------------------------------------------------------------ */

function RolesTab({
  roles,
  setRoles,
  usuarios,
}: {
  roles: Rol[];
  setRoles: Dispatch<SetStateAction<Rol[]>>;
  usuarios: Usuario[];
}) {
  const [editando, setEditando] = useState<Rol | null>(null);
  const [creando, setCreando] = useState(false);

  const contarUsuarios = (rolId: string) => usuarios.filter((u) => u.rolId === rolId).length;

  function guardar(rol: Rol) {
    setRoles((prev) => {
      const existe = prev.some((r) => r.id === rol.id);
      return existe ? prev.map((r) => (r.id === rol.id ? rol : r)) : [...prev, rol];
    });
    setEditando(null);
    setCreando(false);
  }
  function eliminar(id: string) {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Define perfiles y qué puede hacer cada uno.</p>
        <Button onClick={() => setCreando(true)}>
          <Plus size={18} /> Nuevo rol
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((rol) => {
          const total = rol.permisos.length;
          const todos = total === TODOS_LOS_PERMISOS.length;
          return (
            <Card key={rol.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-100 text-brand-700">
                  <ShieldCheck size={20} />
                </span>
                {rol.protegido && <Badge tone="info">Sistema</Badge>}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-text">{rol.nombre}</h3>
              <p className="text-sm text-text-muted">{rol.descripcion}</p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                <span>{todos ? 'Todos los permisos' : `${total} permiso${total === 1 ? '' : 's'}`}</span>
                <span>· {contarUsuarios(rol.id)} usuario{contarUsuarios(rol.id) === 1 ? '' : 's'}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditando(rol)}>
                  <Pencil size={16} /> Editar permisos
                </Button>
                <button
                  onClick={() => eliminar(rol.id)}
                  disabled={rol.protegido}
                  aria-label="Eliminar rol"
                  title={rol.protegido ? 'Rol del sistema (no se puede eliminar)' : 'Eliminar rol'}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {(editando || creando) && (
        <RolModal rol={editando} onCerrar={() => { setEditando(null); setCreando(false); }} onGuardar={guardar} />
      )}
    </div>
  );
}

function RolModal({
  rol,
  onCerrar,
  onGuardar,
}: {
  rol: Rol | null;
  onCerrar: () => void;
  onGuardar: (r: Rol) => void;
}) {
  const [nombre, setNombre] = useState(rol?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? '');
  const [permisos, setPermisos] = useState<Set<string>>(new Set(rol?.permisos ?? []));
  const bloqueado = rol?.protegido ?? false;

  const totalSel = permisos.size;
  const valido = nombre.trim() !== '';

  function toggle(id: string) {
    setPermisos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleGrupo(grupo: GrupoPermisos) {
    const ids = grupo.permisos.map((p) => p.id);
    const todos = ids.every((id) => permisos.has(id));
    setPermisos((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (todos ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  return (
    <ModalShell titulo={rol ? `Permisos · ${rol.nombre}` : 'Nuevo rol'} onCerrar={onCerrar} ancho="max-w-2xl">
      <div className="max-h-[70vh] space-y-4 overflow-auto scroll-thin p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-text">Nombre del rol</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={bloqueado}
              className="mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none disabled:opacity-60"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text">Descripción</span>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text">Permisos ({totalSel})</span>
        </div>

        <div className="space-y-3">
          {CATALOGO_PERMISOS.map((grupo) => {
            const ids = grupo.permisos.map((p) => p.id);
            const todos = ids.every((id) => permisos.has(id));
            return (
              <div key={grupo.modulo} className="rounded-lg border border-border">
                <div className="flex items-center justify-between border-b border-border bg-surface-alt px-3 py-2">
                  <span className="text-sm font-semibold text-text">{grupo.modulo}</span>
                  <button onClick={() => toggleGrupo(grupo)} className="text-xs font-medium text-action-600 hover:underline">
                    {todos ? 'Quitar todo' : 'Seleccionar todo'}
                  </button>
                </div>
                <div className="grid gap-1 p-2 sm:grid-cols-2">
                  {grupo.permisos.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-alt">
                      <Checkbox on={permisos.has(p.id)} onClick={() => toggle(p.id)} />
                      <span className="text-sm text-text">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button
          disabled={!valido}
          onClick={() =>
            onGuardar({
              id: rol?.id ?? `r-${Date.now()}`,
              nombre,
              descripcion,
              permisos: [...permisos],
              protegido: rol?.protegido,
            })
          }
        >
          <Check size={18} /> Guardar rol
        </Button>
      </footer>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Piezas reutilizables                                              */
/* ------------------------------------------------------------------ */

function ModalShell({
  titulo,
  ancho = 'max-w-md',
  onCerrar,
  children,
}: {
  titulo: string;
  ancho?: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-modal grid place-items-center bg-text/40 p-4" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={cn('w-full overflow-hidden rounded-xl bg-surface shadow-modal', ancho)}
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-display text-lg font-semibold text-text">{titulo}</h3>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        on ? 'bg-success' : 'bg-surface-sunk',
      )}
    >
      <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', on ? 'translate-x-4' : 'translate-x-0.5')} />
    </span>
  );
}

function Checkbox({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors',
        on ? 'border-action-500 bg-action-500 text-white' : 'border-border bg-surface',
      )}
    >
      {on && <Check size={14} />}
    </button>
  );
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        defaultValue={value}
        className="mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  );
}

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-700">
          <Icon size={20} />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-text">{title}</h2>
          <p className="text-sm text-text-muted">{desc}</p>
        </div>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </Card>
  );
}
