/**
 * Datos de prueba (mock) para la demo visual.
 * Cuando se apruebe el proyecto, esta capa se reemplaza por hooks de TanStack
 * Query contra la API real; las pantallas no deberían necesitar cambios grandes.
 */

export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
}

export interface Producto {
  id: string;
  categoriaId: string;
  nombre: string;
  precio: number;
  emoji: string;
  /** Foto del producto. Placeholder de Unsplash mientras no haya fotos reales. */
  imagen?: string;
  destacado?: boolean;
}

/** Arma una URL de Unsplash optimizada para las tarjetas del POS (placeholder). */
const img = (id: string) => `https://images.unsplash.com/${id}?w=400&q=60&fit=crop`;

export const categorias: Categoria[] = [
  { id: 'cat-burgers', nombre: 'Hamburguesas', emoji: '🍔' },
  { id: 'cat-fritos', nombre: 'Papas y fritos', emoji: '🍟' },
  { id: 'cat-antojitos', nombre: 'Antojitos', emoji: '🌭' },
  { id: 'cat-frios', nombre: 'Fríos', emoji: '🧊' },
];

export const productos: Producto[] = [
  /* ---- Hamburguesas ---- */
  { id: 'p-hamburguesa', categoriaId: 'cat-burgers', nombre: 'Hamburguesa clásica', precio: 38, emoji: '🍔', imagen: img('photo-1568901346375-23c9450c58cd'), destacado: true },
  { id: 'p-cheeseburger', categoriaId: 'cat-burgers', nombre: 'Cheeseburger', precio: 42, emoji: '🍔', imagen: img('photo-1571091718767-18b5b1457add') },
  { id: 'p-doble', categoriaId: 'cat-burgers', nombre: 'Doble carne', precio: 55, emoji: '🍔', imagen: img('photo-1586190848861-99aa4a171e90'), destacado: true },
  { id: 'p-bacon', categoriaId: 'cat-burgers', nombre: 'Burger con tocino', precio: 52, emoji: '🥓', imagen: img('photo-1594007654729-407eedc4be65') },
  { id: 'p-combo-burger', categoriaId: 'cat-burgers', nombre: 'Combo burger + papas', precio: 65, emoji: '🍔', imagen: img('photo-1550547660-d9450f859349'), destacado: true },

  /* ---- Papas y fritos ---- */
  { id: 'p-papas', categoriaId: 'cat-fritos', nombre: 'Papas fritas', precio: 22, emoji: '🍟', imagen: img('photo-1630384060421-cb20d0e0649d'), destacado: true },
  { id: 'p-papas-grandes', categoriaId: 'cat-fritos', nombre: 'Papas grandes', precio: 30, emoji: '🍟', imagen: img('photo-1573080496219-bb080dd4f877') },
  { id: 'p-onion-rings', categoriaId: 'cat-fritos', nombre: 'Aros de cebolla', precio: 28, emoji: '🧅', imagen: img('photo-1541544741938-0af808871cc0') },
  { id: 'p-nuggets', categoriaId: 'cat-fritos', nombre: 'Nuggets de pollo', precio: 34, emoji: '🍗', imagen: img('photo-1626645738196-c2a7c87a8f58') },

  /* ---- Antojitos ---- */
  { id: 'p-salchipapa', categoriaId: 'cat-antojitos', nombre: 'Salchipapas', precio: 35, emoji: '🌭', imagen: img('photo-1626700051175-6818013e1d4f'), destacado: true },
  { id: 'p-hotdog', categoriaId: 'cat-antojitos', nombre: 'Hot dog', precio: 30, emoji: '🌭', imagen: img('photo-1612392062631-94dd858cba88') },
  { id: 'p-alitas', categoriaId: 'cat-antojitos', nombre: 'Alitas BBQ', precio: 48, emoji: '🍗', imagen: img('photo-1608039755401-742074f0548d'), destacado: true },
  { id: 'p-boneless', categoriaId: 'cat-antojitos', nombre: 'Boneless', precio: 46, emoji: '🍗', imagen: img('photo-1561758033-d89a9ad46330') },
  { id: 'p-nachos', categoriaId: 'cat-antojitos', nombre: 'Nachos con queso', precio: 40, emoji: '🧀', imagen: img('photo-1613514785940-daed07799d9b') },
  { id: 'p-quesadilla', categoriaId: 'cat-antojitos', nombre: 'Quesadilla', precio: 32, emoji: '🫓', imagen: img('photo-1582169296194-e4d644c48063') },
  { id: 'p-pollo-frito', categoriaId: 'cat-antojitos', nombre: 'Pollo frito', precio: 50, emoji: '🍗', imagen: img('photo-1562967914-608f82629710') },

  /* ---- Fríos ---- */
  { id: 'p-malteada', categoriaId: 'cat-frios', nombre: 'Malteada', precio: 30, emoji: '🥤', imagen: img('photo-1585238342024-78d387f4a707'), destacado: true },
  { id: 'p-refresco', categoriaId: 'cat-frios', nombre: 'Refresco', precio: 15, emoji: '🥤', imagen: img('photo-1600271886742-f049cd451bba') },
];

/* ---- Mesas ---- */
export type EstadoMesa = 'libre' | 'ocupada' | 'cuenta' | 'reservada';

export interface Mesa {
  id: string;
  nombre: string;
  zona: string;
  capacidad: number;
  estado: EstadoMesa;
  totalActual?: number;
  mesero?: string;
  minutos?: number;
}

export const mesas: Mesa[] = [
  { id: 'm-1', nombre: 'Mesa 1', zona: 'Salón', capacidad: 2, estado: 'ocupada', totalActual: 68, mesero: 'Ana', minutos: 22 },
  { id: 'm-2', nombre: 'Mesa 2', zona: 'Salón', capacidad: 2, estado: 'libre' },
  { id: 'm-3', nombre: 'Mesa 3', zona: 'Salón', capacidad: 4, estado: 'cuenta', totalActual: 214, mesero: 'Luis', minutos: 54 },
  { id: 'm-4', nombre: 'Mesa 4', zona: 'Salón', capacidad: 4, estado: 'ocupada', totalActual: 96, mesero: 'Ana', minutos: 12 },
  { id: 'm-5', nombre: 'Mesa 5', zona: 'Terraza', capacidad: 6, estado: 'reservada' },
  { id: 'm-6', nombre: 'Mesa 6', zona: 'Terraza', capacidad: 2, estado: 'libre' },
  { id: 'm-7', nombre: 'Mesa 7', zona: 'Terraza', capacidad: 4, estado: 'ocupada', totalActual: 132, mesero: 'Luis', minutos: 8 },
  { id: 'm-8', nombre: 'Barra 1', zona: 'Barra', capacidad: 1, estado: 'ocupada', totalActual: 24, mesero: 'Ana', minutos: 5 },
  { id: 'm-9', nombre: 'Barra 2', zona: 'Barra', capacidad: 1, estado: 'libre' },
];

/* ---- Comandas para KDS ---- */
export type EstadoComanda = 'pendiente' | 'preparacion' | 'listo';
export type Estacion = 'Barra' | 'Cocina';

export interface ComandaItem {
  nombre: string;
  cantidad: number;
  nota?: string;
}

/** Cómo salió una comanda del tablero: se entregó al cliente o se descartó (merma). */
export type Desenlace = 'entregada' | 'descartada';

export interface Comanda {
  id: string;
  folio: string;
  origen: string;
  estacion: Estacion;
  estado: EstadoComanda;
  creada: Date;
  items: ComandaItem[];
  /** Momento de entrega (ms). Al fijarse, el contador de tiempo queda congelado. */
  congeladaEn?: number;
  /** Desenlace al salir del tablero; solo presente en el historial. */
  desenlace?: Desenlace;
}

const now = Date.now();
const minAgo = (m: number) => new Date(now - m * 60000);

export const comandas: Comanda[] = [
  {
    id: 'c-1', folio: '#1042', origen: 'Mesa 4', estacion: 'Cocina', estado: 'pendiente', creada: minAgo(2),
    items: [
      { nombre: 'Hamburguesa clásica', cantidad: 2, nota: 'Una sin cebolla' },
      { nombre: 'Papas fritas', cantidad: 1 },
    ],
  },
  {
    id: 'c-2', folio: '#1041', origen: 'Para llevar', estacion: 'Cocina', estado: 'preparacion', creada: minAgo(6),
    items: [
      { nombre: 'Salchipapas', cantidad: 1, nota: 'Extra queso' },
      { nombre: 'Refresco', cantidad: 1 },
    ],
  },
  {
    id: 'c-3', folio: '#1040', origen: 'Mesa 7', estacion: 'Cocina', estado: 'preparacion', creada: minAgo(11),
    items: [
      { nombre: 'Alitas BBQ', cantidad: 2 },
      { nombre: 'Boneless', cantidad: 1 },
    ],
  },
  {
    id: 'c-4', folio: '#1039', origen: 'Mesa 1', estacion: 'Cocina', estado: 'listo', creada: minAgo(9),
    items: [{ nombre: 'Cheeseburger', cantidad: 1 }, { nombre: 'Nuggets de pollo', cantidad: 1 }],
  },
  {
    id: 'c-5', folio: '#1038', origen: 'Barra 1', estacion: 'Barra', estado: 'pendiente', creada: minAgo(1),
    items: [{ nombre: 'Malteada', cantidad: 2, nota: 'Una de fresa' }],
  },
];

/* ---- Recetas de preparación para el KDS ---- */
export interface PreparacionReceta {
  ingredientes: string[];
  pasos: string[];
  tiempoMin: number;
}

/**
 * Instrucciones de preparación por nombre de producto.
 * En el sistema real vendrían del módulo de Recetario enlazado al producto.
 */
export const preparaciones: Record<string, PreparacionReceta> = {
  'Hamburguesa clásica': {
    tiempoMin: 8,
    ingredientes: ['Pan de hamburguesa', 'Carne de res 150 g', 'Lechuga', 'Tomate', 'Cebolla', 'Salsas'],
    pasos: [
      'Sellar la carne en la plancha 3-4 min por lado.',
      'Tostar el pan en la plancha.',
      'Armar con lechuga, tomate y cebolla (omitir lo que indique la nota).',
      'Agregar salsas y cerrar.',
    ],
  },
  Cheeseburger: {
    tiempoMin: 8,
    ingredientes: ['Pan de hamburguesa', 'Carne de res 150 g', 'Queso amarillo', 'Vegetales', 'Salsas'],
    pasos: [
      'Sellar la carne en la plancha.',
      'Fundir el queso sobre la carne al final.',
      'Tostar el pan y armar con vegetales y salsas.',
      'Cerrar y emplatar.',
    ],
  },
  'Papas fritas': {
    tiempoMin: 5,
    ingredientes: ['Papas cortadas', 'Aceite', 'Sal'],
    pasos: [
      'Freír a 175 °C durante 3-4 min hasta dorar.',
      'Escurrir bien el exceso de aceite.',
      'Salar de inmediato y servir.',
    ],
  },
  'Nuggets de pollo': {
    tiempoMin: 6,
    ingredientes: ['Nuggets de pollo', 'Aceite', 'Salsa a elección'],
    pasos: ['Freír a 175 °C durante 4-5 min.', 'Escurrir el aceite.', 'Servir con la salsa.'],
  },
  Salchipapas: {
    tiempoMin: 7,
    ingredientes: ['Papas fritas', 'Salchicha en rodajas', 'Salsas', 'Queso (opcional)'],
    pasos: [
      'Freír las papas hasta dorar.',
      'Dorar las rodajas de salchicha en la plancha.',
      'Mezclar papas y salchicha en el envase.',
      'Coronar con salsas y queso si la nota lo indica.',
    ],
  },
  'Alitas BBQ': {
    tiempoMin: 10,
    ingredientes: ['Alitas de pollo', 'Salsa BBQ', 'Aceite'],
    pasos: [
      'Freír las alitas a 175 °C durante 8-9 min.',
      'Escurrir el exceso de aceite.',
      'Bañar en salsa BBQ y mezclar.',
      'Servir con aderezo ranch.',
    ],
  },
  Boneless: {
    tiempoMin: 9,
    ingredientes: ['Trozos de pechuga empanizados', 'Salsa a elección', 'Aceite'],
    pasos: [
      'Freír los boneless 6-7 min hasta dorar.',
      'Escurrir el aceite.',
      'Bañar en la salsa elegida.',
      'Servir con aderezo.',
    ],
  },
  Malteada: {
    tiempoMin: 4,
    ingredientes: ['Helado de vainilla', 'Leche', 'Jarabe de sabor', 'Crema batida'],
    pasos: [
      'Licuar helado, leche y jarabe hasta textura cremosa.',
      'Servir en vaso alto.',
      'Coronar con crema batida.',
    ],
  },
};

/** Devuelve la preparación de un producto, o una genérica si no está definida. */
export function getPreparacion(nombre: string): PreparacionReceta {
  return (
    preparaciones[nombre] ?? {
      tiempoMin: 3,
      ingredientes: ['Consultar ficha del producto en Recetario.'],
      pasos: ['Preparar según receta estándar del producto.'],
    }
  );
}

/* ---- Dashboard ---- */
export const kpis = {
  ventasHoy: 4820,
  ventasAyer: 4130,
  ticketPromedio: 41.5,
  transacciones: 116,
  mesasOcupadas: 5,
  mesasTotales: 9,
  cajaAbierta: true,
};

export const topProductos = [
  { nombre: 'Latte', unidades: 48, ingreso: 1152 },
  { nombre: 'Capuchino', unidades: 39, ingreso: 858 },
  { nombre: 'Frappé de café', unidades: 27, ingreso: 864 },
  { nombre: 'Croissant', unidades: 33, ingreso: 594 },
  { nombre: 'Cheesecake', unidades: 18, ingreso: 630 },
];

export const alertasStock = [
  { insumo: 'Leche entera', restante: '4 L', minimo: '10 L', nivel: 'critico' as const },
  { insumo: 'Granos arábica', restante: '2.1 kg', minimo: '5 kg', nivel: 'critico' as const },
  { insumo: 'Vasos 16 oz', restante: '85 pz', minimo: '150 pz', nivel: 'bajo' as const },
  { insumo: 'Jarabe de vainilla', restante: '1 bot', minimo: '3 bot', nivel: 'bajo' as const },
];

/* Serie de ventas por hora para el mini-gráfico del dashboard */
export const ventasPorHora = [
  { hora: '7', monto: 180 }, { hora: '8', monto: 420 }, { hora: '9', monto: 560 },
  { hora: '10', monto: 640 }, { hora: '11', monto: 520 }, { hora: '12', monto: 780 },
  { hora: '13', monto: 710 }, { hora: '14', monto: 490 }, { hora: '15', monto: 520 },
];

/* ---- Inventario ---- */
export type NivelStock = 'ok' | 'bajo' | 'critico';

export interface Insumo {
  id: string;
  nombre: string;
  categoria: string;
  existencia: number;
  unidad: string;
  minimo: number;
  costoUnitario: number;
  nivel: NivelStock;
}

export const insumos: Insumo[] = [
  { id: 'i-1', nombre: 'Granos arábica', categoria: 'Café', existencia: 2.1, unidad: 'kg', minimo: 5, costoUnitario: 95, nivel: 'critico' },
  { id: 'i-2', nombre: 'Leche entera', categoria: 'Lácteos', existencia: 4, unidad: 'L', minimo: 10, costoUnitario: 8.5, nivel: 'critico' },
  { id: 'i-3', nombre: 'Leche deslactosada', categoria: 'Lácteos', existencia: 12, unidad: 'L', minimo: 6, costoUnitario: 11, nivel: 'ok' },
  { id: 'i-4', nombre: 'Jarabe de vainilla', categoria: 'Jarabes', existencia: 1, unidad: 'bot', minimo: 3, costoUnitario: 42, nivel: 'bajo' },
  { id: 'i-5', nombre: 'Jarabe de caramelo', categoria: 'Jarabes', existencia: 5, unidad: 'bot', minimo: 3, costoUnitario: 42, nivel: 'ok' },
  { id: 'i-6', nombre: 'Vasos 16 oz', categoria: 'Desechables', existencia: 85, unidad: 'pz', minimo: 150, costoUnitario: 0.9, nivel: 'bajo' },
  { id: 'i-7', nombre: 'Harina', categoria: 'Panadería', existencia: 22, unidad: 'kg', minimo: 8, costoUnitario: 7.2, nivel: 'ok' },
  { id: 'i-8', nombre: 'Mantequilla', categoria: 'Panadería', existencia: 6.5, unidad: 'kg', minimo: 4, costoUnitario: 58, nivel: 'ok' },
  { id: 'i-9', nombre: 'Azúcar', categoria: 'Abarrotes', existencia: 14, unidad: 'kg', minimo: 5, costoUnitario: 6.5, nivel: 'ok' },
  { id: 'i-10', nombre: 'Chocolate en polvo', categoria: 'Abarrotes', existencia: 3.2, unidad: 'kg', minimo: 2, costoUnitario: 48, nivel: 'ok' },
];

export interface MovimientoKardex {
  fecha: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Merma';
  documento: string;
  cantidad: number;
  saldo: number;
}

export const kardexEjemplo: MovimientoKardex[] = [
  { fecha: '23/07 08:12', tipo: 'Entrada', documento: 'OC-0087', cantidad: 10, saldo: 10 },
  { fecha: '23/07 10:40', tipo: 'Salida', documento: 'Venta #1039', cantidad: -3.2, saldo: 6.8 },
  { fecha: '23/07 12:15', tipo: 'Salida', documento: 'Venta #1044', cantidad: -1.8, saldo: 5 },
  { fecha: '23/07 14:02', tipo: 'Merma', documento: 'Derrame', cantidad: -0.9, saldo: 4.1 },
  { fecha: '23/07 15:30', tipo: 'Salida', documento: 'Venta #1051', cantidad: -2, saldo: 2.1 },
];

/* ---- Recetario ---- */
export interface RecetaResumen {
  id: string;
  producto: string;
  emoji: string;
  precioVenta: number;
  costo: number;
  insumos: number;
}

export const recetas: RecetaResumen[] = [
  { id: 'r-1', producto: 'Latte', emoji: '☕', precioVenta: 24, costo: 6.4, insumos: 3 },
  { id: 'r-2', producto: 'Capuchino', emoji: '☕', precioVenta: 22, costo: 5.9, insumos: 3 },
  { id: 'r-3', producto: 'Frappé de café', emoji: '🥤', precioVenta: 32, costo: 10.2, insumos: 5 },
  { id: 'r-4', producto: 'Mocha', emoji: '☕', precioVenta: 27, costo: 8.1, insumos: 4 },
  { id: 'r-5', producto: 'Croissant', emoji: '🥐', precioVenta: 18, costo: 4.3, insumos: 4 },
  { id: 'r-6', producto: 'Cheesecake', emoji: '🍰', precioVenta: 35, costo: 12.8, insumos: 6 },
];

export interface RecetaDetalleItem {
  insumo: string;
  cantidad: string;
  merma: string;
  costo: number;
}

export const recetaLatte: RecetaDetalleItem[] = [
  { insumo: 'Base de espresso (sub-receta)', cantidad: '30 ml', merma: '0%', costo: 2.9 },
  { insumo: 'Leche entera', cantidad: '180 ml', merma: '2%', costo: 1.6 },
  { insumo: 'Vaso 16 oz', cantidad: '1 pz', merma: '0%', costo: 0.9 },
];

/* ---- Reportes ---- */
export const ventasPorDia = [
  { dia: 'Lun', monto: 3820 }, { dia: 'Mar', monto: 4210 }, { dia: 'Mié', monto: 3990 },
  { dia: 'Jue', monto: 4680 }, { dia: 'Vie', monto: 5940 }, { dia: 'Sáb', monto: 7120 },
  { dia: 'Dom', monto: 6380 },
];

export const ventasPorCategoria = [
  { categoria: 'Café', monto: 12400, pct: 38 },
  { categoria: 'Fríos', monto: 8200, pct: 25 },
  { categoria: 'Panadería', monto: 5600, pct: 17 },
  { categoria: 'Postres', monto: 4100, pct: 13 },
  { categoria: 'Salados', monto: 2300, pct: 7 },
];

export const rentabilidadProductos = [
  { producto: 'Latte', vendidos: 312, ingreso: 7488, costo: 1997, margen: 73 },
  { producto: 'Capuchino', vendidos: 268, ingreso: 5896, costo: 1581, margen: 73 },
  { producto: 'Frappé de café', vendidos: 154, ingreso: 4928, costo: 1571, margen: 68 },
  { producto: 'Cheesecake', vendidos: 96, ingreso: 3360, costo: 1229, margen: 63 },
  { producto: 'Croissant', vendidos: 210, ingreso: 3780, costo: 903, margen: 76 },
];
