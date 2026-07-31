import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
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
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';
import { useToast } from '@/lib/toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useSucursal, useSucursalMutation } from '@/lib/sucursal';
import {
  useRoles,
  useCatalogoPermisos,
  useRolMutations,
  useUsuarios,
  useUsuarioMutations,
} from '@/lib/accesos';
import {
  type RolApi,
  type GrupoPermisosApi,
  type RolInput,
  type UsuarioAdminApi,
  type UsuarioCrearInput,
} from '@/lib/api';

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

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader title="Configuración" subtitle="Negocio, impresión y control de accesos" />

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
      {pestana === 'usuarios' && <UsuariosTab />}
      {pestana === 'roles' && <RolesTab />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab General                                                       */
/* ------------------------------------------------------------------ */

function GeneralTab() {
  const { data: sucursal } = useSucursal();
  const guardar = useSucursalMutation();
  const toast = useToast();

  const [form, setForm] = useState({ nombre: '', nit: '', telefono: '', moneda: '', direccion: '' });

  // Rellena el formulario cuando llegan los datos del negocio.
  useEffect(() => {
    if (sucursal) {
      setForm({
        nombre: sucursal.nombre,
        nit: sucursal.nit,
        telefono: sucursal.telefono,
        moneda: sucursal.moneda,
        direccion: sucursal.direccion,
      });
    }
  }, [sucursal]);

  const set = (campo: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function onGuardar() {
    try {
      await guardar.mutateAsync(form);
      toast.exito('Datos del negocio guardados.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudieron guardar los datos.');
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard icon={Store} title="Datos del negocio" desc="Información general de la sucursal">
        <Field label="Nombre comercial" value={form.nombre} onChange={set('nombre')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="NIT" value={form.nit} onChange={set('nit')} />
          <Field label="Teléfono" value={form.telefono} onChange={set('telefono')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Moneda" value={form.moneda} onChange={set('moneda')} hint="Código ISO (p. ej. GTQ)" />
          <div />
        </div>
        <Field label="Dirección" value={form.direccion} onChange={set('direccion')} />
        <div className="flex justify-end pt-1">
          <Button onClick={onGuardar} disabled={guardar.isPending || !form.nombre.trim()}>
            <Save size={18} /> {guardar.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </SectionCard>

      <SectionCard icon={Printer} title="Impresoras" desc="Ticket y comandas por estación">
        <Field label="Impresora de tickets" value="Epson TM-T20 (mostrador)" readOnly />
        <Field label="Impresora de cocina" value="Star TSP143 (cocina)" readOnly />
        <Field label="Impresora de barra" value="Epson TM-T20 (barra)" readOnly />
        <p className="text-xs text-text-muted">La configuración de impresoras se habilitará con el módulo de impresión.</p>
      </SectionCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Usuarios                                                      */
/* ------------------------------------------------------------------ */

function UsuariosTab() {
  const [modal, setModal] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const { data: usuarios = [] } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const { crear, editar, eliminar } = useUsuarioMutations();

  async function toggleActivo(u: UsuarioAdminApi) {
    try {
      await editar.mutateAsync({ id: u.id, data: { activo: !u.activo } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar.');
    }
  }

  async function borrar(u: UsuarioAdminApi) {
    const ok = await confirm({
      titulo: 'Eliminar usuario',
      mensaje: `¿Eliminar la cuenta de "${u.nombre}" (${u.email})? Perderá el acceso al sistema.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await eliminar.mutateAsync(u.id);
      toast.info(`Cuenta de "${u.nombre}" eliminada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar.');
    }
  }

  async function onCrear(data: UsuarioCrearInput) {
    try {
      await crear.mutateAsync(data);
      toast.exito(`Usuario "${data.nombre}" creado.`);
      setModal(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el usuario.');
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">Usuarios del sistema</h2>
          <p className="text-sm text-text-muted">{usuarios.length} cuentas · {usuarios.filter((u) => u.activo).length} activas</p>
        </div>
        <Button onClick={() => setModal(true)} disabled={roles.length === 0}>
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
                  <Badge tone="brand">{u.rol}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActivo(u)}
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
                    onClick={() => borrar(u)}
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

      {modal && <UsuarioModal roles={roles} onCerrar={() => setModal(false)} onCrear={onCrear} />}
    </Card>
  );
}

function UsuarioModal({
  roles,
  onCerrar,
  onCrear,
}: {
  roles: RolApi[];
  onCerrar: () => void;
  onCrear: (u: UsuarioCrearInput) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [rolId, setRolId] = useState(roles[0]?.id ?? '');
  const valido = nombre.trim() !== '' && /.+@.+\..+/.test(email) && password.length >= 6 && rolId !== '';

  const inputCls =
    'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

  return (
    <ModalShell titulo="Nuevo usuario" onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium text-text">Nombre completo</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Correo</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@gopic.gt" className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Teléfono (WhatsApp)</span>
          <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+502 5555 1234" className={inputCls} />
          <span className="mt-1 block text-xs text-text-muted">Para enviarle el enlace de recuperación por WhatsApp.</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Contraseña temporal</span>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" className={cn(inputCls, 'num')} />
          <span className="mt-1 block text-xs text-text-muted">El usuario podrá cambiarla luego desde recuperación.</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Rol</span>
          <select value={rolId} onChange={(e) => setRolId(e.target.value)} className={inputCls}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </label>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={() => onCrear({ nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim() || undefined, password, rolId })}>
          <Check size={18} /> Crear usuario
        </Button>
      </footer>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab Roles y permisos                                              */
/* ------------------------------------------------------------------ */

function RolesTab() {
  const [editando, setEditando] = useState<RolApi | null>(null);
  const [creando, setCreando] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const { data: roles = [] } = useRoles();
  const { data: catalogo = [] } = useCatalogoPermisos();
  const { crear, editar, eliminar } = useRolMutations();

  const totalPermisos = catalogo.reduce((s, g) => s + g.permisos.length, 0);

  async function guardar(input: RolInput) {
    try {
      if (editando) {
        await editar.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Rol "${input.nombre}" actualizado.`);
      } else {
        await crear.mutateAsync(input);
        toast.exito(`Rol "${input.nombre}" creado.`);
      }
      setEditando(null);
      setCreando(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar el rol.');
    }
  }

  async function borrar(rol: RolApi) {
    const ok = await confirm({
      titulo: 'Eliminar rol',
      mensaje: `¿Eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await eliminar.mutateAsync(rol.id);
      toast.info(`Rol "${rol.nombre}" eliminado.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar el rol.');
    }
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
          const todos = totalPermisos > 0 && total === totalPermisos;
          return (
            <Card key={rol.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-100 text-brand-700">
                  <ShieldCheck size={20} />
                </span>
                {rol.esSistema && <Badge tone="info">Sistema</Badge>}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-text">{rol.nombre}</h3>
              <p className="text-sm text-text-muted">{rol.descripcion}</p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                <span>{todos ? 'Todos los permisos' : `${total} permiso${total === 1 ? '' : 's'}`}</span>
                <span>· {rol.usuarios} usuario{rol.usuarios === 1 ? '' : 's'}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditando(rol)}>
                  <Pencil size={16} /> Editar permisos
                </Button>
                <button
                  onClick={() => borrar(rol)}
                  disabled={rol.esSistema || rol.usuarios > 0}
                  aria-label="Eliminar rol"
                  title={rol.esSistema ? 'Rol del sistema (no se puede eliminar)' : rol.usuarios > 0 ? 'Tiene usuarios asignados' : 'Eliminar rol'}
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
        <RolModal rol={editando} catalogo={catalogo} onCerrar={() => { setEditando(null); setCreando(false); }} onGuardar={guardar} />
      )}
    </div>
  );
}

/** Etiqueta legible para el nombre de módulo (código en minúsculas del backend). */
const moduloLabel = (m: string) => m.charAt(0).toUpperCase() + m.slice(1);

function RolModal({
  rol,
  catalogo,
  onCerrar,
  onGuardar,
}: {
  rol: RolApi | null;
  catalogo: GrupoPermisosApi[];
  onCerrar: () => void;
  onGuardar: (input: RolInput) => void;
}) {
  const [nombre, setNombre] = useState(rol?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? '');
  const [permisos, setPermisos] = useState<Set<string>>(new Set(rol?.permisos ?? []));
  const bloqueado = rol?.esSistema ?? false;

  const totalSel = permisos.size;
  const valido = nombre.trim() !== '';

  function toggle(codigo: string) {
    setPermisos((prev) => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  }
  function toggleGrupo(grupo: GrupoPermisosApi) {
    const codigos = grupo.permisos.map((p) => p.codigo);
    const todos = codigos.every((c) => permisos.has(c));
    setPermisos((prev) => {
      const next = new Set(prev);
      codigos.forEach((c) => (todos ? next.delete(c) : next.add(c)));
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
          {catalogo.map((grupo) => {
            const codigos = grupo.permisos.map((p) => p.codigo);
            const todos = codigos.every((c) => permisos.has(c));
            return (
              <div key={grupo.modulo} className="rounded-lg border border-border">
                <div className="flex items-center justify-between border-b border-border bg-surface-alt px-3 py-2">
                  <span className="text-sm font-semibold text-text">{moduloLabel(grupo.modulo)}</span>
                  <button onClick={() => toggleGrupo(grupo)} className="text-xs font-medium text-action-600 hover:underline">
                    {todos ? 'Quitar todo' : 'Seleccionar todo'}
                  </button>
                </div>
                <div className="grid gap-1 p-2 sm:grid-cols-2">
                  {grupo.permisos.map((p) => (
                    <label key={p.codigo} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-alt">
                      <Checkbox on={permisos.has(p.codigo)} onClick={() => toggle(p.codigo)} />
                      <span className="text-sm text-text">{p.descripcion}</span>
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
          onClick={() => onGuardar({ nombre: nombre.trim(), descripcion, permisos: [...permisos] })}
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
    <Modal onClose={onCerrar} ariaLabel={titulo} className={cn('w-full', ancho)}>
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
    </Modal>
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
      <span className={cn('inline-block h-4 w-4 rounded-full bg-surface shadow transition-transform', on ? 'translate-x-4' : 'translate-x-0.5')} />
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
        on ? 'border-action-500 bg-action-500 text-on-action' : 'border-border bg-surface',
      )}
    >
      {on && <Check size={14} />}
    </button>
  );
}

function Field({
  label,
  value,
  hint,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  hint?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        value={value}
        onChange={onChange}
        readOnly={readOnly || !onChange}
        className={cn(
          'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none',
          (readOnly || !onChange) && 'opacity-70',
        )}
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
