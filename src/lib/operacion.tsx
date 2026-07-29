/**
 * Store de operación: fuente ÚNICA de mesas, comandas (KDS) y movimientos de caja.
 * Conecta el flujo real mesero → cocina → caja entre pantallas.
 *
 * Flujo modelado:
 *  - Venta en MESA (post-pago): se abre la mesa, se toma la comanda en el POS,
 *    se envía a cocina (genera comanda + descuenta inventario), la cuenta queda
 *    ABIERTA; al final la caja cobra y libera la mesa.
 *  - Venta en MOSTRADOR o PARA LLEVAR (pre-pago): se cobra primero y en el mismo
 *    acto se envía la comanda a cocina.
 *
 * Es estado de cliente en memoria (Context + useReducer); cuando exista el backend,
 * cada acción despachará una mutación de TanStack Query contra la API.
 */
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import {
  mesas as mesasSeed,
  comandas as comandasSeed,
  productos,
  productos as productosSeed,
  categorias as categoriasSeed,
  insumos as insumosSeed,
  type Mesa,
  type Comanda,
  type ComandaItem,
  type Estacion,
  type Producto,
  type Categoria,
  type Insumo,
} from '@/mock/data';

export type TipoVenta = 'mesa' | 'mostrador' | 'llevar';
export type MetodoPago = 'efectivo' | 'tarjeta';

/** Línea de un ticket en construcción en el POS. */
export interface LineaTicket {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  emoji: string;
  estacion: Estacion;
  nota?: string;
}

/** Cuenta abierta asociada a una mesa (venta en mesa, post-pago). */
export interface CuentaMesa {
  mesaId: string;
  lineas: LineaTicket[];
  mesero: string;
  abiertaEn: number;
}

export interface MovimientoCaja {
  id: string;
  hora: string;
  folio: string;
  tipoVenta: TipoVenta;
  metodo: MetodoPago;
  total: number;
}

/* ---- Fidelización / Lealtad ---- */

export interface Cliente {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  visitas: number;
  /** Saldo de puntos de lealtad. */
  puntos: number;
}

export interface MovimientoLealtad {
  id: string;
  clienteId: string;
  fecha: string;
  /** Positivo = acumuló, negativo = canjeó. */
  puntos: number;
  descripcion: string;
}

export type TipoRecompensa = 'producto' | 'descuento_monto' | 'descuento_pct';

/** Recompensa configurable por el admin: a X puntos, tal beneficio. */
export interface Recompensa {
  id: string;
  nombre: string;
  tipo: TipoRecompensa;
  /** Puntos que cuesta canjearla. */
  costoPuntos: number;
  /** Producto gratis (productoId) o valor del descuento (Q o %) según tipo. */
  productoId?: string;
  valor?: number;
  activa: boolean;
}

/** Configuración del programa: cuántos quetzales equivalen a 1 punto. */
export interface ConfigLealtad {
  quetzalesPorPunto: number;
}

interface Estado {
  mesas: Mesa[];
  comandas: Comanda[];
  /** Cuentas abiertas por mesa, indexadas por mesaId. */
  cuentas: Record<string, CuentaMesa>;
  ventas: MovimientoCaja[];
  folioSeq: number;
  /** Estado de la caja del turno. */
  cajaAbierta: boolean;
  fondoCaja: number;
  cajero: string;
  /** Catálogos compartidos (editables desde Catálogos, leídos por Inventario). */
  productos: Producto[];
  categorias: Categoria[];
  insumos: Insumo[];
  /** Fidelización: clientes con puntos, historial, recompensas y configuración. */
  clientes: Cliente[];
  lealtad: MovimientoLealtad[];
  recompensas: Recompensa[];
  configLealtad: ConfigLealtad;
}

/** A qué estación va cada producto: bebidas frías a Barra, comida a Cocina. */
const CATEGORIAS_BARRA = new Set(['cat-frios', 'cat-bebidas']);
export function estacionDe(productoId: string): Estacion {
  const p = productos.find((x) => x.id === productoId);
  return p && CATEGORIAS_BARRA.has(p.categoriaId) ? 'Barra' : 'Cocina';
}

const horaActual = () =>
  new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

function siguienteFolio(seq: number): string {
  return `#${1042 + seq}`;
}

/** Datos editables de una mesa desde el CRUD de administración. */
export interface MesaInput {
  nombre: string;
  zona: string;
  capacidad: number;
}

type Accion =
  | { tipo: 'abrirMesa'; mesaId: string; mesero: string }
  | { tipo: 'enviarComanda'; origen: string; lineas: LineaTicket[]; mesaId?: string }
  | { tipo: 'pedirCuenta'; mesaId: string }
  | {
      tipo: 'cobrar';
      mesaId?: string;
      tipoVenta: TipoVenta;
      metodo: MetodoPago;
      total: number;
      folio: string;
      /** Cliente al que se le acumulan/canjean puntos (opcional). */
      clienteId?: string;
      /** Recompensa canjeada en esta venta (opcional). */
      recompensaId?: string;
    }
  | { tipo: 'moverComanda'; id: string; estado: Comanda['estado'] }
  | { tipo: 'retirarComanda'; id: string; desenlace: 'entregada' | 'descartada' }
  | { tipo: 'restaurarComanda'; id: string }
  | { tipo: 'crearMesa'; datos: MesaInput }
  | { tipo: 'editarMesa'; id: string; datos: MesaInput }
  | { tipo: 'eliminarMesa'; id: string }
  | { tipo: 'abrirCaja'; fondo: number; cajero: string }
  | { tipo: 'cerrarCaja' }
  | { tipo: 'setProductos'; productos: Producto[] }
  | { tipo: 'setCategorias'; categorias: Categoria[] }
  | { tipo: 'setInsumos'; insumos: Insumo[] }
  | { tipo: 'setClientes'; clientes: Cliente[] }
  | { tipo: 'setRecompensas'; recompensas: Recompensa[] }
  | { tipo: 'setConfigLealtad'; config: ConfigLealtad }
  | { tipo: 'canjearRecompensa'; clienteId: string; recompensaId: string };

/** Divide las líneas de un ticket en comandas por estación (Barra / Cocina). */
function comandasDesdeLineas(
  origen: string,
  lineas: LineaTicket[],
  folioBase: string,
): Comanda[] {
  const porEstacion = new Map<Estacion, ComandaItem[]>();
  for (const l of lineas) {
    const arr = porEstacion.get(l.estacion) ?? [];
    arr.push({ nombre: l.nombre, cantidad: l.cantidad, nota: l.nota });
    porEstacion.set(l.estacion, arr);
  }
  const creada = new Date();
  return [...porEstacion.entries()].map(([estacion, items], i) => ({
    id: `cmd-${Date.now()}-${i}`,
    folio: folioBase,
    origen,
    estacion,
    estado: 'pendiente' as const,
    creada,
    items,
  }));
}

function reducer(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case 'abrirMesa': {
      if (estado.cuentas[accion.mesaId]) return estado; // ya abierta
      return {
        ...estado,
        mesas: estado.mesas.map((m) =>
          m.id === accion.mesaId ? { ...m, estado: 'ocupada', mesero: accion.mesero, totalActual: 0 } : m,
        ),
        cuentas: {
          ...estado.cuentas,
          [accion.mesaId]: { mesaId: accion.mesaId, lineas: [], mesero: accion.mesero, abiertaEn: Date.now() },
        },
      };
    }

    case 'enviarComanda': {
      const folio = siguienteFolio(estado.folioSeq);
      const nuevas = comandasDesdeLineas(accion.origen, accion.lineas, folio);
      let cuentas = estado.cuentas;
      let mesas = estado.mesas;

      // Venta en mesa: acumula las líneas en la cuenta abierta.
      if (accion.mesaId) {
        const previa = estado.cuentas[accion.mesaId];
        const lineas = [...(previa?.lineas ?? []), ...accion.lineas];
        const total = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
        cuentas = {
          ...estado.cuentas,
          [accion.mesaId]: {
            mesaId: accion.mesaId,
            lineas,
            mesero: previa?.mesero ?? 'Mesero',
            abiertaEn: previa?.abiertaEn ?? Date.now(),
          },
        };
        mesas = estado.mesas.map((m) => (m.id === accion.mesaId ? { ...m, estado: 'ocupada', totalActual: total } : m));
      }

      return {
        ...estado,
        comandas: [...nuevas, ...estado.comandas],
        cuentas,
        mesas,
        folioSeq: estado.folioSeq + 1,
      };
    }

    case 'pedirCuenta':
      return {
        ...estado,
        mesas: estado.mesas.map((m) => (m.id === accion.mesaId ? { ...m, estado: 'cuenta' } : m)),
      };

    case 'cobrar': {
      const venta: MovimientoCaja = {
        id: `mv-${Date.now()}`,
        hora: horaActual(),
        folio: accion.folio,
        tipoVenta: accion.tipoVenta,
        metodo: accion.metodo,
        total: accion.total,
      };
      let mesas = estado.mesas;
      let cuentas = estado.cuentas;
      // Cobrar una mesa la libera y cierra su cuenta.
      if (accion.mesaId) {
        mesas = estado.mesas.map((m) =>
          m.id === accion.mesaId ? { ...m, estado: 'libre', totalActual: undefined, mesero: undefined } : m,
        );
        const { [accion.mesaId]: _cerrada, ...resto } = estado.cuentas;
        cuentas = resto;
      }

      // --- Fidelización ---
      let clientes = estado.clientes;
      let lealtad = estado.lealtad;
      if (accion.clienteId) {
        const fecha = new Date().toLocaleDateString('es-GT');
        const nuevosMov: MovimientoLealtad[] = [];

        // Canje de recompensa: descuenta los puntos que cuesta.
        const recompensa = accion.recompensaId
          ? estado.recompensas.find((r) => r.id === accion.recompensaId)
          : undefined;
        let deltaPuntos = 0;
        if (recompensa) {
          deltaPuntos -= recompensa.costoPuntos;
          nuevosMov.push({
            id: `ml-${Date.now()}-c`,
            clienteId: accion.clienteId,
            fecha,
            puntos: -recompensa.costoPuntos,
            descripcion: `Canje: ${recompensa.nombre}`,
          });
        }

        // Acumulación: puntos según el monto pagado y la tasa configurada.
        const ganados = Math.floor(accion.total / estado.configLealtad.quetzalesPorPunto);
        if (ganados > 0) {
          deltaPuntos += ganados;
          nuevosMov.push({
            id: `ml-${Date.now()}-a`,
            clienteId: accion.clienteId,
            fecha,
            puntos: ganados,
            descripcion: `Compra ${accion.folio}`,
          });
        }

        clientes = estado.clientes.map((c) =>
          c.id === accion.clienteId
            ? { ...c, puntos: Math.max(0, c.puntos + deltaPuntos), visitas: c.visitas + 1 }
            : c,
        );
        lealtad = [...nuevosMov, ...estado.lealtad];
      }

      return { ...estado, ventas: [venta, ...estado.ventas], mesas, cuentas, clientes, lealtad };
    }

    case 'moverComanda':
      return {
        ...estado,
        comandas: estado.comandas.map((c) => (c.id === accion.id ? { ...c, estado: accion.estado } : c)),
      };

    case 'retirarComanda':
      return {
        ...estado,
        comandas: estado.comandas.map((c) =>
          c.id === accion.id ? { ...c, congeladaEn: Date.now(), desenlace: accion.desenlace } : c,
        ),
      };

    case 'restaurarComanda':
      return {
        ...estado,
        comandas: estado.comandas.map((c) =>
          c.id === accion.id ? { ...c, estado: 'listo', congeladaEn: undefined, desenlace: undefined } : c,
        ),
      };

    case 'crearMesa':
      return {
        ...estado,
        mesas: [
          ...estado.mesas,
          {
            id: `m-${Date.now()}`,
            nombre: accion.datos.nombre,
            zona: accion.datos.zona,
            capacidad: accion.datos.capacidad,
            estado: 'libre',
          },
        ],
      };

    case 'editarMesa':
      return {
        ...estado,
        mesas: estado.mesas.map((m) =>
          m.id === accion.id
            ? { ...m, nombre: accion.datos.nombre, zona: accion.datos.zona, capacidad: accion.datos.capacidad }
            : m,
        ),
      };

    case 'eliminarMesa': {
      const { [accion.id]: _cuentaBorrada, ...cuentas } = estado.cuentas;
      return {
        ...estado,
        mesas: estado.mesas.filter((m) => m.id !== accion.id),
        cuentas,
      };
    }

    case 'abrirCaja':
      return { ...estado, cajaAbierta: true, fondoCaja: accion.fondo, cajero: accion.cajero, ventas: [] };

    case 'cerrarCaja':
      return { ...estado, cajaAbierta: false };

    case 'setProductos':
      return { ...estado, productos: accion.productos };

    case 'setCategorias':
      return { ...estado, categorias: accion.categorias };

    case 'setInsumos':
      return { ...estado, insumos: accion.insumos };

    case 'setClientes':
      return { ...estado, clientes: accion.clientes };

    case 'setRecompensas':
      return { ...estado, recompensas: accion.recompensas };

    case 'setConfigLealtad':
      return { ...estado, configLealtad: accion.config };

    case 'canjearRecompensa': {
      // Canje manual desde la ficha del cliente (fuera de una venta).
      const recompensa = estado.recompensas.find((r) => r.id === accion.recompensaId);
      const cliente = estado.clientes.find((c) => c.id === accion.clienteId);
      if (!recompensa || !cliente || cliente.puntos < recompensa.costoPuntos) return estado;
      return {
        ...estado,
        clientes: estado.clientes.map((c) =>
          c.id === accion.clienteId ? { ...c, puntos: c.puntos - recompensa.costoPuntos } : c,
        ),
        lealtad: [
          {
            id: `ml-${Date.now()}`,
            clienteId: accion.clienteId,
            fecha: new Date().toLocaleDateString('es-GT'),
            puntos: -recompensa.costoPuntos,
            descripcion: `Canje: ${recompensa.nombre}`,
          },
          ...estado.lealtad,
        ],
      };
    }

    default:
      return estado;
  }
}

interface OperacionApi {
  mesas: Mesa[];
  comandas: Comanda[];
  cuentas: Record<string, CuentaMesa>;
  ventas: MovimientoCaja[];
  cajaAbierta: boolean;
  fondoCaja: number;
  cajero: string;
  productos: Producto[];
  categorias: Categoria[];
  insumos: Insumo[];
  clientes: Cliente[];
  lealtad: MovimientoLealtad[];
  recompensas: Recompensa[];
  configLealtad: ConfigLealtad;
  setProductos: (productos: Producto[]) => void;
  setCategorias: (categorias: Categoria[]) => void;
  setInsumos: (insumos: Insumo[]) => void;
  setClientes: (clientes: Cliente[]) => void;
  setRecompensas: (recompensas: Recompensa[]) => void;
  setConfigLealtad: (config: ConfigLealtad) => void;
  canjearRecompensa: (clienteId: string, recompensaId: string) => void;
  abrirCaja: (fondo: number, cajero: string) => void;
  cerrarCaja: () => void;
  abrirMesa: (mesaId: string, mesero: string) => void;
  enviarComanda: (origen: string, lineas: LineaTicket[], mesaId?: string) => string;
  pedirCuenta: (mesaId: string) => void;
  cobrar: (args: {
    mesaId?: string;
    tipoVenta: TipoVenta;
    metodo: MetodoPago;
    total: number;
    clienteId?: string;
    recompensaId?: string;
  }) => string;
  moverComanda: (id: string, estado: Comanda['estado']) => void;
  retirarComanda: (id: string, desenlace: 'entregada' | 'descartada') => void;
  restaurarComanda: (id: string) => void;
  crearMesa: (datos: MesaInput) => void;
  editarMesa: (id: string, datos: MesaInput) => void;
  eliminarMesa: (id: string) => void;
}

const OperacionContext = createContext<OperacionApi | null>(null);

/* ---- Seeds de fidelización ---- */
const CLIENTES_SEED: Cliente[] = [
  { id: 'c-1', nombre: 'Consumidor Final', nit: 'CF', telefono: '', email: '', visitas: 0, puntos: 0 },
  { id: 'c-2', nombre: 'María Fernández', nit: '2456781-0', telefono: '+502 5544 1122', email: 'maria.f@mail.gt', visitas: 18, puntos: 240 },
  { id: 'c-3', nombre: 'Restaurante El Buen Sabor', nit: '789123-4', telefono: '+502 2233 4455', email: 'compras@buensabor.gt', visitas: 42, puntos: 615 },
  { id: 'c-4', nombre: 'José Morales', nit: '5566778-9', telefono: '+502 5566 7788', email: 'jose.morales@mail.gt', visitas: 7, puntos: 80 },
];

const RECOMPENSAS_SEED: Recompensa[] = [
  { id: 'rw-1', nombre: 'Papas fritas gratis', tipo: 'producto', costoPuntos: 100, productoId: 'p-papas', activa: true },
  { id: 'rw-2', nombre: 'Refresco gratis', tipo: 'producto', costoPuntos: 60, productoId: 'p-refresco', activa: true },
  { id: 'rw-3', nombre: 'Q20 de descuento', tipo: 'descuento_monto', costoPuntos: 150, valor: 20, activa: true },
  { id: 'rw-4', nombre: '15% de descuento', tipo: 'descuento_pct', costoPuntos: 200, valor: 15, activa: true },
];

const estadoInicial: Estado = {
  mesas: mesasSeed.map((m) => ({ ...m })),
  comandas: comandasSeed.map((c) => ({ ...c })),
  cuentas: {},
  ventas: [],
  folioSeq: 1,
  cajaAbierta: true,
  fondoCaja: 500,
  cajero: 'Ana Rodríguez',
  productos: productosSeed.map((p) => ({ ...p })),
  categorias: categoriasSeed.map((c) => ({ ...c })),
  insumos: insumosSeed.map((i) => ({ ...i })),
  clientes: CLIENTES_SEED.map((c) => ({ ...c })),
  lealtad: [],
  recompensas: RECOMPENSAS_SEED.map((r) => ({ ...r })),
  configLealtad: { quetzalesPorPunto: 10 },
};

export function OperacionProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial);

  const api = useMemo<OperacionApi>(
    () => ({
      mesas: estado.mesas,
      comandas: estado.comandas,
      cuentas: estado.cuentas,
      ventas: estado.ventas,
      cajaAbierta: estado.cajaAbierta,
      fondoCaja: estado.fondoCaja,
      cajero: estado.cajero,
      productos: estado.productos,
      categorias: estado.categorias,
      insumos: estado.insumos,
      clientes: estado.clientes,
      lealtad: estado.lealtad,
      recompensas: estado.recompensas,
      configLealtad: estado.configLealtad,
      setProductos: (productos) => dispatch({ tipo: 'setProductos', productos }),
      setCategorias: (categorias) => dispatch({ tipo: 'setCategorias', categorias }),
      setInsumos: (insumos) => dispatch({ tipo: 'setInsumos', insumos }),
      setClientes: (clientes) => dispatch({ tipo: 'setClientes', clientes }),
      setRecompensas: (recompensas) => dispatch({ tipo: 'setRecompensas', recompensas }),
      setConfigLealtad: (config) => dispatch({ tipo: 'setConfigLealtad', config }),
      canjearRecompensa: (clienteId, recompensaId) => dispatch({ tipo: 'canjearRecompensa', clienteId, recompensaId }),
      abrirCaja: (fondo, cajero) => dispatch({ tipo: 'abrirCaja', fondo, cajero }),
      cerrarCaja: () => dispatch({ tipo: 'cerrarCaja' }),
      abrirMesa: (mesaId, mesero) => dispatch({ tipo: 'abrirMesa', mesaId, mesero }),
      enviarComanda: (origen, lineas, mesaId) => {
        const folio = siguienteFolio(estado.folioSeq);
        dispatch({ tipo: 'enviarComanda', origen, lineas, mesaId });
        return folio;
      },
      pedirCuenta: (mesaId) => dispatch({ tipo: 'pedirCuenta', mesaId }),
      cobrar: ({ mesaId, tipoVenta, metodo, total, clienteId, recompensaId }) => {
        const folio = siguienteFolio(estado.folioSeq);
        dispatch({ tipo: 'cobrar', mesaId, tipoVenta, metodo, total, folio, clienteId, recompensaId });
        return folio;
      },
      moverComanda: (id, estadoComanda) => dispatch({ tipo: 'moverComanda', id, estado: estadoComanda }),
      retirarComanda: (id, desenlace) => dispatch({ tipo: 'retirarComanda', id, desenlace }),
      restaurarComanda: (id) => dispatch({ tipo: 'restaurarComanda', id }),
      crearMesa: (datos) => dispatch({ tipo: 'crearMesa', datos }),
      editarMesa: (id, datos) => dispatch({ tipo: 'editarMesa', id, datos }),
      eliminarMesa: (id) => dispatch({ tipo: 'eliminarMesa', id }),
    }),
    [estado],
  );

  return <OperacionContext.Provider value={api}>{children}</OperacionContext.Provider>;
}

export function useOperacion(): OperacionApi {
  const ctx = useContext(OperacionContext);
  if (!ctx) throw new Error('useOperacion debe usarse dentro de <OperacionProvider>.');
  return ctx;
}
