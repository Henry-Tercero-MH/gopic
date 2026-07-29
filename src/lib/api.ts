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
}) => apiFetch<VentaResultado>('/ventas', { method: 'POST', body: JSON.stringify(payload) });
