import { useState, type ReactNode } from 'react';
import { Plus, Pencil, Trash2, X, Check, Package, Tags, Boxes, Truck, Ruler, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { useOperacion } from '@/lib/operacion';
import { useCatalogoMutations } from '@/lib/catalogo';
import { useProveedores, useProveedorMutations } from '@/lib/proveedores';
import { useInsumos, useInsumoMutations } from '@/lib/inventario';
import { useUnidades, useUnidadMutations } from '@/lib/unidades';
import { ICONOS_DISPONIBLES, componenteIcono } from '@/lib/iconosCategoria';
import {
  type ProductoInput,
  type CategoriaInput,
  type ProveedorApi,
  type ProveedorInput,
  type InsumoApi,
  type InsumoInput,
  type UnidadApi,
  type UnidadInput,
} from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import {
  type Producto,
  type Categoria,
  type NivelStock,
} from '@/lib/tipos';

type TipoMedida = UnidadApi['tipo'];
type Medida = UnidadApi;

const TIPOS_MEDIDA: TipoMedida[] = ['Peso', 'Volumen', 'Unidad'];

/* ------------------------------------------------------------------ */
/*  Página                                                            */
/* ------------------------------------------------------------------ */

type Pestana = 'productos' | 'categorias' | 'medidas' | 'insumos' | 'proveedores';

const PESTANAS: { id: Pestana; label: string; icon: LucideIcon }[] = [
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'categorias', label: 'Categorías', icon: Tags },
  { id: 'medidas', label: 'Unidades de medida', icon: Ruler },
  { id: 'insumos', label: 'Insumos', icon: Boxes },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
];

export function CatalogosPage() {
  const [pestana, setPestana] = useState<Pestana>('productos');
  // Productos y categorías viven en el backend (el store los refleja para POS); insumos
  // y proveedores también vienen del backend vía React Query. Medidas siguen locales.
  const { productos, categorias } = useOperacion();
  const { data: insumos = [] } = useInsumos();
  const { data: medidas = [] } = useUnidades();

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader title="Catálogos" subtitle="Administra los datos maestros del sistema" />

      <div className="flex gap-1 overflow-x-auto border-b border-border scroll-thin">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPestana(p.id)}
            className={cn(
              '-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              pestana === p.id
                ? 'border-action-500 text-action-700'
                : 'border-transparent text-text-muted hover:text-text',
            )}
          >
            <p.icon size={16} /> {p.label}
          </button>
        ))}
      </div>

      {pestana === 'productos' && <ProductosCat productos={productos} categorias={categorias} />}
      {pestana === 'categorias' && <CategoriasCat categorias={categorias} productos={productos} />}
      {pestana === 'medidas' && <MedidasCat medidas={medidas} insumos={insumos} />}
      {pestana === 'insumos' && <InsumosCat insumos={insumos} medidas={medidas} />}
      {pestana === 'proveedores' && <ProveedoresCat />}
    </div>
  );
}

/* ================================================================== */
/*  Productos                                                         */
/* ================================================================== */

function ProductosCat({
  productos,
  categorias,
}: {
  productos: Producto[];
  categorias: Categoria[];
}) {
  const [editando, setEditando] = useState<Producto | null>(null);
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const { crearProducto, editarProducto, eliminarProducto } = useCatalogoMutations();
  const nombreCat = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? '—';

  function abrirNuevo() {
    setEditando(null);
    setAbierto(true);
  }
  function abrirEditar(p: Producto) {
    setEditando(p);
    setAbierto(true);
  }
  async function guardar(input: ProductoInput) {
    try {
      if (editando) {
        await editarProducto.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Producto "${input.nombre}" actualizado.`);
      } else {
        await crearProducto.mutateAsync(input);
        toast.exito(`Producto "${input.nombre}" creado.`);
      }
      setAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar el producto.');
    }
  }

  return (
    <CatalogoLayout titulo="Productos" total={productos.length} onNuevo={abrirNuevo}>
      <Tabla
        columnas={[
          {
            header: 'Producto',
            render: (p: Producto) => (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-alt text-xl">
                  {p.imagen ? <img src={p.imagen} alt="" className="h-full w-full object-cover" /> : p.emoji}
                </span>
                <span className="font-medium text-text">{p.nombre}</span>
              </div>
            ),
          },
          { header: 'Categoría', render: (p: Producto) => <span className="text-text-muted">{nombreCat(p.categoriaId)}</span> },
          { header: 'Estación', render: (p: Producto) => <span className="text-text-muted">{p.estacion ?? '—'}</span> },
          { header: 'Precio', render: (p: Producto) => <span className="num font-semibold text-text">{formatCurrency(p.precio)}</span> },
          { header: 'Popular', render: (p: Producto) => (p.destacado ? <Badge tone="accent">Popular</Badge> : <span className="text-text-muted">—</span>) },
        ]}
        filas={productos}
        entidad="producto"
        describir={(p) => p.nombre}
        onEditar={abrirEditar}
        onEliminar={async (p) => { await eliminarProducto.mutateAsync(p.id); }}
      />

      {abierto && (
        <ProductoModal producto={editando} categorias={categorias} onCerrar={() => setAbierto(false)} onGuardar={guardar} />
      )}
    </CatalogoLayout>
  );
}

function ProductoModal({
  producto,
  categorias,
  onCerrar,
  onGuardar,
}: {
  producto: Producto | null;
  categorias: Categoria[];
  onCerrar: () => void;
  onGuardar: (input: ProductoInput) => void;
}) {
  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [categoriaId, setCategoriaId] = useState(producto?.categoriaId ?? categorias[0]?.id ?? '');
  const [precio, setPrecio] = useState(String(producto?.precio ?? ''));
  const [estacion, setEstacion] = useState<'Barra' | 'Cocina'>(producto?.estacion ?? 'Cocina');
  const [imagen, setImagen] = useState(producto?.imagen ?? '');
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const valido = nombre.trim() !== '' && parseFloat(precio) > 0 && categoriaId !== '';

  return (
    <ModalShell titulo={producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <Campo label="Nombre">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus className={inputCls} />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Categoría">
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputCls}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Precio (Q)">
            <input type="number" min={0} step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} className={cn(inputCls, 'num')} />
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Estación (KDS)">
            <select value={estacion} onChange={(e) => setEstacion(e.target.value as 'Barra' | 'Cocina')} className={inputCls}>
              <option value="Cocina">Cocina</option>
              <option value="Barra">Barra</option>
            </select>
          </Campo>
          <Campo label="URL de imagen">
            <input value={imagen} onChange={(e) => setImagen(e.target.value)} placeholder="https://…" className={inputCls} />
          </Campo>
        </div>
        <button onClick={() => setDestacado((v) => !v)} className="flex items-center gap-2">
          <Switch on={destacado} />
          <span className="text-sm text-text">Marcar como “Popular”</span>
        </button>
      </div>
      <PieModal
        onCerrar={onCerrar}
        valido={valido}
        onGuardar={() =>
          onGuardar({
            nombre: nombre.trim(),
            categoriaId,
            precio: parseFloat(precio),
            estacion,
            imagenUrl: imagen.trim() || undefined,
            destacado,
          })
        }
      />
    </ModalShell>
  );
}

/* ================================================================== */
/*  Categorías                                                        */
/* ================================================================== */

function CategoriasCat({
  categorias,
  productos,
}: {
  categorias: Categoria[];
  productos: Producto[];
}) {
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const { crearCategoria, editarCategoria, eliminarCategoria } = useCatalogoMutations();
  const cuenta = (id: string) => productos.filter((p) => p.categoriaId === id).length;

  async function guardar(input: CategoriaInput) {
    try {
      if (editando) {
        await editarCategoria.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Categoría "${input.nombre}" actualizada.`);
      } else {
        await crearCategoria.mutateAsync(input);
        toast.exito(`Categoría "${input.nombre}" creada.`);
      }
      setAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la categoría.');
    }
  }

  return (
    <CatalogoLayout titulo="Categorías" total={categorias.length} onNuevo={() => { setEditando(null); setAbierto(true); }}>
      <Tabla
        columnas={[
          {
            header: 'Categoría',
            render: (c: Categoria) => {
              const Icono = componenteIcono(c.icono);
              return (
                <span className="flex items-center gap-2 font-medium text-text">
                  <Icono size={18} className="text-text-muted" />
                  {c.nombre}
                </span>
              );
            },
          },
          { header: 'Productos', render: (c: Categoria) => <span className="num text-text-muted">{cuenta(c.id)}</span> },
        ]}
        filas={categorias}
        entidad="categoría"
        describir={(c) => c.nombre}
        onEditar={(c) => { setEditando(c); setAbierto(true); }}
        onEliminar={async (c) => { await eliminarCategoria.mutateAsync(c.id); }}
      />

      {abierto && <CategoriaModal categoria={editando} onCerrar={() => setAbierto(false)} onGuardar={guardar} />}
    </CatalogoLayout>
  );
}

function CategoriaModal({
  categoria,
  onCerrar,
  onGuardar,
}: {
  categoria: Categoria | null;
  onCerrar: () => void;
  onGuardar: (input: CategoriaInput) => void;
}) {
  const [nombre, setNombre] = useState(categoria?.nombre ?? '');
  const [icono, setIcono] = useState(categoria?.icono ?? ICONOS_DISPONIBLES[0]);
  const valido = nombre.trim() !== '';
  const IconoPrevia = componenteIcono(icono);

  return (
    <ModalShell titulo={categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <Campo label="Nombre">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus className={inputCls} />
        </Campo>
        <Campo label="Icono">
          <div className="mt-1 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-surface-alt">
              <IconoPrevia size={20} className="text-text" />
            </span>
            <select value={icono} onChange={(e) => setIcono(e.target.value)} className={cn(inputCls, 'mt-0')}>
              {ICONOS_DISPONIBLES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </Campo>
      </div>
      <PieModal
        onCerrar={onCerrar}
        valido={valido}
        onGuardar={() => onGuardar({ nombre: nombre.trim(), icono })}
      />
    </ModalShell>
  );
}

/* ================================================================== */
/*  Unidades de medida                                                */
/* ================================================================== */

const tipoMedidaTone: Record<TipoMedida, 'brand' | 'info' | 'accent'> = {
  Peso: 'brand',
  Volumen: 'info',
  Unidad: 'accent',
};

function MedidasCat({
  medidas,
  insumos,
}: {
  medidas: Medida[];
  insumos: InsumoApi[];
}) {
  const [editando, setEditando] = useState<Medida | null>(null);
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const { crear, editar, eliminar } = useUnidadMutations();
  const enUso = (abrev: string) => insumos.filter((i) => i.unidad === abrev).length;

  async function guardar(input: UnidadInput) {
    try {
      if (editando) {
        await editar.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Unidad "${input.nombre}" actualizada.`);
      } else {
        await crear.mutateAsync(input);
        toast.exito(`Unidad "${input.nombre}" creada.`);
      }
      setAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la unidad.');
    }
  }

  return (
    <CatalogoLayout titulo="Unidades de medida" total={medidas.length} onNuevo={() => { setEditando(null); setAbierto(true); }}>
      <Tabla
        columnas={[
          { header: 'Unidad', render: (m: Medida) => <span className="font-medium text-text">{m.nombre}</span> },
          { header: 'Abreviatura', render: (m: Medida) => <span className="num text-text-muted">{m.abreviatura}</span> },
          { header: 'Tipo', render: (m: Medida) => <Badge tone={tipoMedidaTone[m.tipo]}>{m.tipo}</Badge> },
          { header: 'Insumos', render: (m: Medida) => <span className="num text-text-muted">{enUso(m.abreviatura)}</span> },
        ]}
        filas={medidas}
        entidad="unidad"
        describir={(m) => m.nombre}
        onEditar={(m) => { setEditando(m); setAbierto(true); }}
        onEliminar={async (m) => { await eliminar.mutateAsync(m.id); }}
      />

      {abierto && <MedidaModal medida={editando} onCerrar={() => setAbierto(false)} onGuardar={guardar} />}
    </CatalogoLayout>
  );
}

function MedidaModal({
  medida,
  onCerrar,
  onGuardar,
}: {
  medida: Medida | null;
  onCerrar: () => void;
  onGuardar: (input: UnidadInput) => void;
}) {
  const [nombre, setNombre] = useState(medida?.nombre ?? '');
  const [abreviatura, setAbreviatura] = useState(medida?.abreviatura ?? '');
  const [tipo, setTipo] = useState<TipoMedida>(medida?.tipo ?? 'Peso');
  const valido = nombre.trim() !== '' && abreviatura.trim() !== '';

  return (
    <ModalShell titulo={medida ? 'Editar unidad' : 'Nueva unidad de medida'} onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nombre">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus placeholder="Kilogramo" className={inputCls} />
          </Campo>
          <Campo label="Abreviatura">
            <input value={abreviatura} onChange={(e) => setAbreviatura(e.target.value)} placeholder="kg" className={cn(inputCls, 'num')} />
          </Campo>
        </div>
        <Campo label="Tipo">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMedida)} className={inputCls}>
            {TIPOS_MEDIDA.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Campo>
      </div>
      <PieModal
        onCerrar={onCerrar}
        valido={valido}
        onGuardar={() => onGuardar({ nombre: nombre.trim(), abreviatura: abreviatura.trim(), tipo })}
      />
    </ModalShell>
  );
}

/* ================================================================== */
/*  Insumos                                                           */
/* ================================================================== */

const nivelBadge: Record<NivelStock, { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  ok: { tone: 'success', label: 'OK' },
  bajo: { tone: 'warning', label: 'Bajo' },
  critico: { tone: 'danger', label: 'Crítico' },
};

function InsumosCat({
  insumos,
  medidas,
}: {
  insumos: InsumoApi[];
  medidas: Medida[];
}) {
  const [editando, setEditando] = useState<InsumoApi | null>(null);
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const { crear, editar, eliminar } = useInsumoMutations();

  async function guardar(input: InsumoInput) {
    try {
      if (editando) {
        await editar.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Insumo "${input.nombre}" actualizado.`);
      } else {
        await crear.mutateAsync(input);
        toast.exito(`Insumo "${input.nombre}" creado.`);
      }
      setAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar el insumo.');
    }
  }

  return (
    <CatalogoLayout titulo="Insumos" total={insumos.length} onNuevo={() => { setEditando(null); setAbierto(true); }}>
      <Tabla
        columnas={[
          { header: 'Insumo', render: (i: InsumoApi) => <span className="font-medium text-text">{i.nombre}</span> },
          { header: 'Categoría', render: (i: InsumoApi) => <span className="text-text-muted">{i.categoria ?? '—'}</span> },
          { header: 'Existencia', render: (i: InsumoApi) => <span className="num text-text">{i.existencia} {i.unidad}</span> },
          { header: 'Mínimo', render: (i: InsumoApi) => <span className="num text-text-muted">{i.minimo} {i.unidad}</span> },
          { header: 'Costo', render: (i: InsumoApi) => <span className="num text-text">{formatCurrency(i.costoUnitario)}</span> },
          { header: 'Nivel', render: (i: InsumoApi) => <Badge tone={nivelBadge[i.nivel].tone}>{nivelBadge[i.nivel].label}</Badge> },
        ]}
        filas={insumos}
        entidad="insumo"
        describir={(i) => i.nombre}
        onEditar={(i) => { setEditando(i); setAbierto(true); }}
        onEliminar={async (i) => { await eliminar.mutateAsync(i.id); }}
      />

      {abierto && <InsumoModal insumo={editando} medidas={medidas} onCerrar={() => setAbierto(false)} onGuardar={guardar} />}
    </CatalogoLayout>
  );
}

function InsumoModal({
  insumo,
  medidas,
  onCerrar,
  onGuardar,
}: {
  insumo: InsumoApi | null;
  medidas: Medida[];
  onCerrar: () => void;
  onGuardar: (input: InsumoInput) => void;
}) {
  const [nombre, setNombre] = useState(insumo?.nombre ?? '');
  const [categoria, setCategoria] = useState(insumo?.categoria ?? '');
  const [existencia, setExistencia] = useState(String(insumo?.existencia ?? ''));
  const [unidad, setUnidad] = useState(insumo?.unidad ?? medidas[0]?.abreviatura ?? 'u');
  const [minimo, setMinimo] = useState(String(insumo?.minimo ?? ''));
  const [costo, setCosto] = useState(String(insumo?.costoUnitario ?? ''));
  const valido = nombre.trim() !== '' && existencia !== '' && minimo !== '';

  return (
    <ModalShell titulo={insumo ? 'Editar insumo' : 'Nuevo insumo'} onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nombre">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus className={inputCls} />
          </Campo>
          <Campo label="Categoría">
            <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej. Lácteos" className={inputCls} />
          </Campo>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Campo label="Existencia">
            <input type="number" min={0} step="0.01" value={existencia} onChange={(e) => setExistencia(e.target.value)} className={cn(inputCls, 'num')} />
          </Campo>
          <Campo label="Unidad">
            <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className={inputCls}>
              {medidas.map((m) => (
                <option key={m.id} value={m.abreviatura}>{m.abreviatura} · {m.nombre}</option>
              ))}
              {!medidas.some((m) => m.abreviatura === unidad) && <option value={unidad}>{unidad}</option>}
            </select>
          </Campo>
          <Campo label="Mínimo">
            <input type="number" min={0} step="0.01" value={minimo} onChange={(e) => setMinimo(e.target.value)} className={cn(inputCls, 'num')} />
          </Campo>
        </div>
        <Campo label="Costo unitario (Q)">
          <input type="number" min={0} step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} className={cn(inputCls, 'num')} />
        </Campo>
      </div>
      <PieModal
        onCerrar={onCerrar}
        valido={valido}
        onGuardar={() =>
          onGuardar({
            nombre: nombre.trim(),
            categoria: categoria.trim() || undefined,
            unidad: unidad || 'u',
            existencia: parseFloat(existencia) || 0,
            minimo: parseFloat(minimo) || 0,
            costoUnitario: parseFloat(costo) || 0,
          })
        }
      />
    </ModalShell>
  );
}

/* ================================================================== */
/*  Proveedores                                                       */
/* ================================================================== */

function ProveedoresCat() {
  const [editando, setEditando] = useState<ProveedorApi | null>(null);
  const [abierto, setAbierto] = useState(false);
  const toast = useToast();
  const { data: proveedores = [] } = useProveedores();
  const { crear, editar, eliminar } = useProveedorMutations();

  async function guardar(input: ProveedorInput) {
    try {
      if (editando) {
        await editar.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Proveedor "${input.nombre}" actualizado.`);
      } else {
        await crear.mutateAsync(input);
        toast.exito(`Proveedor "${input.nombre}" creado.`);
      }
      setAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar el proveedor.');
    }
  }

  return (
    <CatalogoLayout titulo="Proveedores" total={proveedores.length} onNuevo={() => { setEditando(null); setAbierto(true); }}>
      <Tabla
        columnas={[
          { header: 'Proveedor', render: (p: ProveedorApi) => <span className="font-medium text-text">{p.nombre}</span> },
          { header: 'Contacto', render: (p: ProveedorApi) => <span className="text-text-muted">{p.contacto || '—'}</span> },
          { header: 'Teléfono', render: (p: ProveedorApi) => <span className="num text-text-muted">{p.telefono || '—'}</span> },
          { header: 'Correo', render: (p: ProveedorApi) => <span className="text-text-muted">{p.email || '—'}</span> },
        ]}
        filas={proveedores}
        entidad="proveedor"
        describir={(p) => p.nombre}
        onEditar={(p) => { setEditando(p); setAbierto(true); }}
        onEliminar={async (p) => { await eliminar.mutateAsync(p.id); }}
      />

      {abierto && <ProveedorModal proveedor={editando} onCerrar={() => setAbierto(false)} onGuardar={guardar} />}
    </CatalogoLayout>
  );
}

function ProveedorModal({
  proveedor,
  onCerrar,
  onGuardar,
}: {
  proveedor: ProveedorApi | null;
  onCerrar: () => void;
  onGuardar: (input: ProveedorInput) => void;
}) {
  const [nombre, setNombre] = useState(proveedor?.nombre ?? '');
  const [contacto, setContacto] = useState(proveedor?.contacto ?? '');
  const [telefono, setTelefono] = useState(proveedor?.telefono ?? '');
  const [email, setEmail] = useState(proveedor?.email ?? '');
  const valido = nombre.trim() !== '';

  return (
    <ModalShell titulo={proveedor ? 'Editar proveedor' : 'Nuevo proveedor'} onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <Campo label="Nombre / Razón social">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus className={inputCls} />
        </Campo>
        <Campo label="Contacto">
          <input value={contacto} onChange={(e) => setContacto(e.target.value)} className={inputCls} />
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
      <PieModal
        onCerrar={onCerrar}
        valido={valido}
        onGuardar={() =>
          onGuardar({
            nombre: nombre.trim(),
            contacto: contacto.trim() || undefined,
            telefono: telefono.trim() || undefined,
            email: email.trim() || undefined,
          })
        }
      />
    </ModalShell>
  );
}

/* ================================================================== */
/*  Piezas reutilizables                                              */
/* ================================================================== */

const inputCls =
  'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

function CatalogoLayout({
  titulo,
  total,
  onNuevo,
  children,
}: {
  titulo: string;
  total: number;
  onNuevo: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">{titulo}</h2>
          <p className="text-sm text-text-muted">{total} registro{total === 1 ? '' : 's'}</p>
        </div>
        <Button onClick={onNuevo}>
          <Plus size={18} /> Nuevo
        </Button>
      </div>
      {children}
    </Card>
  );
}

interface Columna<T> {
  header: string;
  render: (row: T) => ReactNode;
}

function Tabla<T extends { id: string }>({
  columnas,
  filas,
  entidad,
  describir,
  onEditar,
  onEliminar,
}: {
  columnas: Columna<T>[];
  filas: T[];
  /** Nombre singular de la entidad para los mensajes de confirmación (p. ej. "producto"). */
  entidad: string;
  /** Texto que identifica la fila en el diálogo (p. ej. su nombre). */
  describir: (row: T) => string;
  onEditar: (row: T) => void;
  onEliminar: (row: T) => void | Promise<void>;
}) {
  const confirm = useConfirm();
  const toast = useToast();

  async function pedirEliminar(row: T) {
    const nombre = describir(row);
    const ok = await confirm({
      titulo: `Eliminar ${entidad}`,
      mensaje: `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await onEliminar(row);
      toast.info(`${entidad[0].toUpperCase()}${entidad.slice(1)} "${nombre}" eliminado.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `No se pudo eliminar ${entidad}.`);
    }
  }

  if (filas.length === 0) {
    return <p className="p-8 text-center text-sm text-text-muted">Sin registros. Agrega el primero con “Nuevo”.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
            {columnas.map((c) => (
              <th key={c.header} className="px-4 py-2.5 font-semibold">{c.header}</th>
            ))}
            <th className="px-4 py-2.5 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
              {columnas.map((c) => (
                <td key={c.header} className="px-4 py-3">{c.render(row)}</td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => onEditar(row)}
                    aria-label="Editar"
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => pedirEliminar(row)}
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

function ModalShell({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  return (
    <Modal onClose={onCerrar} ariaLabel={titulo} className="w-full max-w-lg">
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

function PieModal({ onCerrar, valido, onGuardar }: { onCerrar: () => void; valido: boolean; onGuardar: () => void }) {
  return (
    <footer className="flex justify-end gap-2 border-t border-border p-4">
      <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
      <Button disabled={!valido} onClick={onGuardar}>
        <Check size={18} /> Guardar
      </Button>
    </footer>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={cn('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors', on ? 'bg-success' : 'bg-surface-sunk')}>
      <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', on ? 'translate-x-4' : 'translate-x-0.5')} />
    </span>
  );
}
