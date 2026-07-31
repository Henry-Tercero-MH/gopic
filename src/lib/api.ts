/**
 * Cliente HTTP del backend GOPIC. La URL base sale de VITE_API_URL
 * (definida en .env / variables de Vercel). Guarda el JWT en localStorage.
 */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';
const TOKEN_KEY = 'gopic.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Error con el código HTTP, para distinguir 401/403/etc. en la UI. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** fetch con base URL, JSON y Authorization: Bearer <token>. Lanza ApiError si no es 2xx. */
export async function apiFetch<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) mensaje = body.error;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(mensaje, res.status);
  }

  return res.status === 204 ? (null as T) : ((await res.json()) as T);
}

// ---- Auth ----
export interface UsuarioApi {
  id: string;
  email: string;
  nombre: string;
  sucursalId: string;
  roles: string[];
}

/** Inicia sesión, guarda el token y devuelve el usuario. */
export async function loginApi(email: string, password: string): Promise<UsuarioApi> {
  const { token, usuario } = await apiFetch<{ token: string; usuario: UsuarioApi }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
  return usuario;
}

// ---- Catálogo ----
export interface ProductoApi {
  id: string;
  categoriaId: string;
  nombre: string;
  precio: string; // Decimal serializado
  estacion: 'Barra' | 'Cocina';
  destacado: boolean;
  imagenUrl: string | null;
}
export interface CategoriaApi {
  id: string;
  nombre: string;
  icono: string | null;
  orden: number;
}

export const getProductos = () => apiFetch<ProductoApi[]>('/productos');
export const getCategorias = () => apiFetch<CategoriaApi[]>('/categorias');

export type ProductoInput = {
  categoriaId: string;
  nombre: string;
  precio: number;
  estacion: 'Barra' | 'Cocina';
  destacado?: boolean;
  imagenUrl?: string;
};
export const crearProducto = (data: ProductoInput) =>
  apiFetch('/productos', { method: 'POST', body: JSON.stringify(data) });
export const editarProducto = (id: string, data: Partial<ProductoInput>) =>
  apiFetch(`/productos/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarProducto = (id: string) => apiFetch<null>(`/productos/${id}`, { method: 'DELETE' });

export type CategoriaInput = { nombre: string; icono?: string; orden?: number };
export const crearCategoria = (data: CategoriaInput) =>
  apiFetch('/categorias', { method: 'POST', body: JSON.stringify(data) });
export const editarCategoria = (id: string, data: Partial<CategoriaInput>) =>
  apiFetch(`/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarCategoria = (id: string) => apiFetch<null>(`/categorias/${id}`, { method: 'DELETE' });

// ---- Formas de pago ----
export interface FormaPagoApi {
  id: string;
  nombre: string;
}
export const getFormasPago = () => apiFetch<FormaPagoApi[]>('/formas-pago');

// ---- Caja ----
export interface CajaActual {
  abierta: boolean;
  sesion?: { id: string; fondoApertura: string };
  resumen?: { facturas: number; totalVendido: string | number; efectivoEsperado: number };
}
export const getCajaActual = () => apiFetch<CajaActual>('/caja/actual');
export const abrirCaja = (fondoApertura: number) =>
  apiFetch('/caja/abrir', { method: 'POST', body: JSON.stringify({ fondoApertura }) });

// ---- Ventas ----
export interface ItemVentaApi {
  producto_id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  impuesto_tasa: number;
  es_cortesia?: boolean;
}
export interface PagoVentaApi {
  forma_pago_id: string;
  monto: number;
  recibido?: number;
}
export interface VentaResultado {
  factura_id: string;
  folio: number;
  serie: string;
  total: number;
  puntos_ganados: number;
}
export const registrarVenta = (payload: {
  tipoVenta: 'mesa' | 'mostrador' | 'llevar';
  items: ItemVentaApi[];
  pagos: PagoVentaApi[];
  descuento?: number;
  clienteId?: string;
  recompensaId?: string;
}) => apiFetch<VentaResultado>('/ventas', { method: 'POST', body: JSON.stringify(payload) });

// ---- Clientes ----
export interface ClienteApi {
  id: string;
  nombre: string;
  nit: string | null;
  telefono: string | null;
  email: string | null;
  puntos: number;
  visitas: number;
}
export interface MovimientoLealtadApi {
  id: string;
  tipo: 'acumula' | 'canjea';
  puntos: number;
  descripcion: string;
  createdAt: string;
}
export type ClienteInput = { nombre: string; nit?: string; telefono?: string; email?: string };

export const getClientes = () => apiFetch<ClienteApi[]>('/clientes');
export const getMovimientosLealtad = (id: string) =>
  apiFetch<MovimientoLealtadApi[]>(`/clientes/${id}/movimientos`);
export const crearCliente = (data: ClienteInput) =>
  apiFetch<ClienteApi>('/clientes', { method: 'POST', body: JSON.stringify(data) });
export const editarCliente = (id: string, data: Partial<ClienteInput>) =>
  apiFetch<ClienteApi>(`/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarCliente = (id: string) => apiFetch<null>(`/clientes/${id}`, { method: 'DELETE' });

// ---- Recompensas ----
export interface RecompensaApi {
  id: string;
  nombre: string;
  tipo: 'producto' | 'descuento_monto' | 'descuento_pct';
  costoPuntos: number;
  valor: string | null;
  productoId: string | null;
}
export const getRecompensas = () => apiFetch<RecompensaApi[]>('/recompensas');

// ---- Dashboard ----
export interface DashboardData {
  ventasHoy: number;
  ventasAyer: number;
  transacciones: number;
  ticketPromedio: number;
  ventasPorHora: { hora: number; monto: number }[];
  ultimasVentas: {
    id: string;
    folio: number;
    serie: string;
    total: number;
    tipoVenta: 'mesa' | 'mostrador' | 'llevar';
    hora: string;
  }[];
  topProductos: { nombre: string; unidades: number; ingreso: number }[];
  lealtad: {
    puntosOtorgados: number;
    puntosCanjeados: number;
    canjes: number;
    clientesConPuntos: number;
    puntosEnCirculacion: number;
    totalClientes: number;
  };
}
export const getDashboard = () => apiFetch<DashboardData>('/dashboard');

// ---- Comandas (KDS) ----
export interface ComandaApi {
  id: string;
  folio: string;
  estacion: 'Barra' | 'Cocina';
  estado: 'pendiente' | 'preparacion' | 'listo' | 'entregada';
  origen: string | null;
  creadaEn: string;
  items: { nombre: string; cantidad: number; nota: string | null }[];
}
export type EstadoComandaApi = ComandaApi['estado'];

export const getComandas = () => apiFetch<ComandaApi[]>('/comandas');
export const crearComanda = (payload: {
  tipoVenta: 'mesa' | 'mostrador' | 'llevar';
  mesaId?: string;
  origen?: string;
  items: { productoId: string; cantidad: number; nota?: string }[];
}) => apiFetch('/comandas', { method: 'POST', body: JSON.stringify(payload) });
export const avanzarComanda = (id: string, estado: EstadoComandaApi) =>
  apiFetch<ComandaApi>(`/comandas/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });

// ---- Mesas ----
export interface MesaApi {
  id: string;
  nombre: string;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'cuenta' | 'reservada';
  zona: string;
}
export type MesaInput = { nombre: string; zona: string; capacidad: number };

export const getMesas = () => apiFetch<MesaApi[]>('/mesas');
export const crearMesa = (data: MesaInput) => apiFetch<MesaApi>('/mesas', { method: 'POST', body: JSON.stringify(data) });
export const editarMesa = (id: string, data: Partial<MesaInput>) =>
  apiFetch<MesaApi>(`/mesas/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarMesa = (id: string) => apiFetch<null>(`/mesas/${id}`, { method: 'DELETE' });

// ---- Inventario ----
export interface InsumoApi {
  id: string;
  nombre: string;
  categoria: string | null;
  tipo: 'materia_prima' | 'elaborado' | 'terminado';
  unidad: string;
  existencia: number;
  minimo: number;
  costoUnitario: number;
  nivel: 'ok' | 'bajo' | 'critico';
}
export interface KardexMovApi {
  fecha: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Merma';
  documento: string;
  cantidad: number;
  saldo: number;
}
export type InsumoInput = {
  nombre: string;
  categoria?: string;
  tipo?: InsumoApi['tipo'];
  unidad: string;
  existencia?: number;
  minimo?: number;
  costoUnitario?: number;
};
export const getInsumos = () => apiFetch<InsumoApi[]>('/insumos');
export const getKardex = (id: string) => apiFetch<KardexMovApi[]>(`/insumos/${id}/kardex`);
export const reprocesar = (payload: { origenId: string; consumo: number; destinoId: string; produccion: number }) =>
  apiFetch('/insumos/reproceso', { method: 'POST', body: JSON.stringify(payload) });
export const crearInsumo = (data: InsumoInput) => apiFetch('/insumos', { method: 'POST', body: JSON.stringify(data) });
export const editarInsumo = (id: string, data: Partial<InsumoInput>) =>
  apiFetch(`/insumos/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarInsumo = (id: string) => apiFetch<null>(`/insumos/${id}`, { method: 'DELETE' });

// ---- Gastos ----
export interface GastoApi {
  id: string;
  fecha: string;
  concepto: string;
  categoria: string;
  proveedor: string;
  metodo: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  estado: 'pagado' | 'pendiente';
  monto: number;
}
export type GastoInput = {
  concepto: string;
  categoria: string;
  proveedor?: string;
  metodo: GastoApi['metodo'];
  estado: GastoApi['estado'];
  monto: number;
};
export const getGastos = () => apiFetch<GastoApi[]>('/gastos');
export const crearGasto = (data: GastoInput) => apiFetch('/gastos', { method: 'POST', body: JSON.stringify(data) });
export const editarGasto = (id: string, data: Partial<GastoInput>) =>
  apiFetch(`/gastos/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarGasto = (id: string) => apiFetch<null>(`/gastos/${id}`, { method: 'DELETE' });

// ---- Empleados (Personal) ----
export interface EmpleadoApi {
  id: string;
  nombre: string;
  iniciales: string;
  puesto: string;
  telefono: string;
  turno: string;
  estado: 'trabajando' | 'sin_marcar' | 'salio';
  entrada: string | null;
  salida: string | null;
}
export type EmpleadoInput = { nombre: string; puesto: string; telefono?: string; turno?: string };

export const getEmpleados = () => apiFetch<EmpleadoApi[]>('/empleados');
export const crearEmpleado = (data: EmpleadoInput) =>
  apiFetch('/empleados', { method: 'POST', body: JSON.stringify(data) });
export const editarEmpleado = (id: string, data: Partial<EmpleadoInput>) =>
  apiFetch(`/empleados/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarEmpleado = (id: string) => apiFetch<null>(`/empleados/${id}`, { method: 'DELETE' });
export const marcarEntradaEmpleado = (id: string) => apiFetch(`/empleados/${id}/entrada`, { method: 'POST' });
export const marcarSalidaEmpleado = (id: string) => apiFetch(`/empleados/${id}/salida`, { method: 'POST' });

// ---- Proveedores ----
export interface ProveedorApi {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
}
export type ProveedorInput = { nombre: string; contacto?: string; telefono?: string; email?: string };

// ---- Compras (órdenes de compra) ----
export interface OrdenCompraItemApi {
  insumo: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
}
export interface OrdenCompraApi {
  id: string;
  folio: string;
  proveedor: string;
  fecha: string;
  estado: 'borrador' | 'enviada' | 'recibida' | 'cancelada';
  items: OrdenCompraItemApi[];
}
export type OrdenCompraInput = {
  proveedorId: string;
  items: { insumoId: string; cantidad: number; costoUnitario: number }[];
};
export const getOrdenesCompra = () => apiFetch<OrdenCompraApi[]>('/ordenes-compra');
export const crearOrdenCompra = (data: OrdenCompraInput) =>
  apiFetch<{ id: string; folio: string }>('/ordenes-compra', { method: 'POST', body: JSON.stringify(data) });
export const recibirOrdenCompra = (id: string) =>
  apiFetch(`/ordenes-compra/${id}/recibir`, { method: 'POST' });
export const eliminarOrdenCompra = (id: string) =>
  apiFetch<null>(`/ordenes-compra/${id}`, { method: 'DELETE' });

// ---- Recetas ----
export interface RecetaDetalleApi {
  insumo: string;
  cantidad: string;
  merma: string;
  costo: number;
}
export interface RecetaItemApi {
  insumoId: string;
  cantidad: number;
  mermaPct: number;
}
export interface RecetaApi {
  id: string;
  productoId: string;
  producto: string;
  emoji: string;
  precioVenta: number;
  costo: number;
  detalle: RecetaDetalleApi[];
  items: RecetaItemApi[];
}
export type RecetaInput = {
  productoId: string;
  rendimiento?: number;
  items: { insumoId: string; cantidad: number; mermaPct?: number }[];
};
export const getRecetas = () => apiFetch<RecetaApi[]>('/recetas');
export const guardarReceta = (data: RecetaInput) =>
  apiFetch<{ id: string }>('/recetas', { method: 'POST', body: JSON.stringify(data) });
export const eliminarReceta = (id: string) => apiFetch<null>(`/recetas/${id}`, { method: 'DELETE' });

// ---- Promociones ----
export interface PromocionApi {
  id: string;
  nombre: string;
  tipo: 'porcentaje' | 'monto' | '2x1' | 'combo';
  valor: number;
  aplicaEn: string;
  vigencia: string;
  activa: boolean;
}
export type PromocionInput = {
  nombre: string;
  tipo: PromocionApi['tipo'];
  valor: number;
  aplicaEn?: string;
  vigencia?: string;
  activa?: boolean;
};
export const getPromociones = () => apiFetch<PromocionApi[]>('/promociones');
export const crearPromocion = (data: PromocionInput) =>
  apiFetch<PromocionApi>('/promociones', { method: 'POST', body: JSON.stringify(data) });
export const editarPromocion = (id: string, data: Partial<PromocionInput>) =>
  apiFetch<PromocionApi>(`/promociones/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarPromocion = (id: string) => apiFetch<null>(`/promociones/${id}`, { method: 'DELETE' });

// ---- Sucursal (Config general) ----
export interface SucursalApi {
  id: string;
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  moneda: string;
}
export type SucursalInput = Partial<Omit<SucursalApi, 'id'>>;
export const getSucursal = () => apiFetch<SucursalApi>('/sucursal');
export const editarSucursal = (data: SucursalInput) =>
  apiFetch<SucursalApi>('/sucursal', { method: 'PATCH', body: JSON.stringify(data) });

// ---- Roles y permisos ----
export interface RolApi {
  id: string;
  nombre: string;
  descripcion: string;
  esSistema: boolean;
  permisos: string[];
  usuarios: number;
}
export interface GrupoPermisosApi {
  modulo: string;
  permisos: { codigo: string; descripcion: string }[];
}
export type RolInput = { nombre: string; descripcion?: string; permisos: string[] };

export const getRoles = () => apiFetch<RolApi[]>('/roles');
export const getCatalogoPermisos = () => apiFetch<GrupoPermisosApi[]>('/roles/catalogo');
export const crearRol = (data: RolInput) => apiFetch('/roles', { method: 'POST', body: JSON.stringify(data) });
export const editarRol = (id: string, data: Partial<RolInput>) =>
  apiFetch(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarRol = (id: string) => apiFetch<null>(`/roles/${id}`, { method: 'DELETE' });

// ---- Usuarios (cuentas de acceso) ----
export interface UsuarioAdminApi {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  rolId: string | null;
  rol: string;
}
export type UsuarioCrearInput = { nombre: string; email: string; password: string; rolId: string };
export type UsuarioEditarInput = { nombre?: string; activo?: boolean; rolId?: string; password?: string };

export const getUsuarios = () => apiFetch<UsuarioAdminApi[]>('/usuarios');
export const crearUsuario = (data: UsuarioCrearInput) =>
  apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(data) });
export const editarUsuario = (id: string, data: UsuarioEditarInput) =>
  apiFetch(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarUsuario = (id: string) => apiFetch<null>(`/usuarios/${id}`, { method: 'DELETE' });

export const getProveedores = () => apiFetch<ProveedorApi[]>('/proveedores');
export const crearProveedor = (data: ProveedorInput) =>
  apiFetch<ProveedorApi>('/proveedores', { method: 'POST', body: JSON.stringify(data) });
export const editarProveedor = (id: string, data: Partial<ProveedorInput>) =>
  apiFetch<ProveedorApi>(`/proveedores/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const eliminarProveedor = (id: string) => apiFetch<null>(`/proveedores/${id}`, { method: 'DELETE' });
