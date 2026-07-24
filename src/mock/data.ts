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
  destacado?: boolean;
}

export const categorias: Categoria[] = [
  { id: 'cat-cafe', nombre: 'Café', emoji: '☕' },
  { id: 'cat-frios', nombre: 'Fríos', emoji: '🧊' },
  { id: 'cat-te', nombre: 'Tés e infusiones', emoji: '🍵' },
  { id: 'cat-pan', nombre: 'Panadería', emoji: '🥐' },
  { id: 'cat-postres', nombre: 'Postres', emoji: '🍰' },
  { id: 'cat-salados', nombre: 'Salados', emoji: '🥪' },
];

export const productos: Producto[] = [
  { id: 'p-espresso', categoriaId: 'cat-cafe', nombre: 'Espresso', precio: 12, emoji: '☕', destacado: true },
  { id: 'p-americano', categoriaId: 'cat-cafe', nombre: 'Americano', precio: 15, emoji: '☕' },
  { id: 'p-capuchino', categoriaId: 'cat-cafe', nombre: 'Capuchino', precio: 22, emoji: '☕', destacado: true },
  { id: 'p-latte', categoriaId: 'cat-cafe', nombre: 'Latte', precio: 24, emoji: '☕', destacado: true },
  { id: 'p-mocha', categoriaId: 'cat-cafe', nombre: 'Mocha', precio: 27, emoji: '☕' },
  { id: 'p-flatwhite', categoriaId: 'cat-cafe', nombre: 'Flat White', precio: 25, emoji: '☕' },
  { id: 'p-cortado', categoriaId: 'cat-cafe', nombre: 'Cortado', precio: 18, emoji: '☕' },

  { id: 'p-frappe', categoriaId: 'cat-frios', nombre: 'Frappé de café', precio: 32, emoji: '🥤', destacado: true },
  { id: 'p-coldbrew', categoriaId: 'cat-frios', nombre: 'Cold Brew', precio: 28, emoji: '🧊' },
  { id: 'p-iceslatte', categoriaId: 'cat-frios', nombre: 'Latte helado', precio: 26, emoji: '🧊' },
  { id: 'p-limonada', categoriaId: 'cat-frios', nombre: 'Limonada de hierbabuena', precio: 20, emoji: '🍋' },

  { id: 'p-chai', categoriaId: 'cat-te', nombre: 'Chai latte', precio: 24, emoji: '🍵' },
  { id: 'p-verde', categoriaId: 'cat-te', nombre: 'Té verde', precio: 16, emoji: '🍵' },
  { id: 'p-manzanilla', categoriaId: 'cat-te', nombre: 'Manzanilla', precio: 14, emoji: '🌼' },

  { id: 'p-croissant', categoriaId: 'cat-pan', nombre: 'Croissant', precio: 18, emoji: '🥐', destacado: true },
  { id: 'p-concha', categoriaId: 'cat-pan', nombre: 'Concha', precio: 12, emoji: '🍞' },
  { id: 'p-muffin', categoriaId: 'cat-pan', nombre: 'Muffin de arándano', precio: 20, emoji: '🧁' },

  { id: 'p-cheesecake', categoriaId: 'cat-postres', nombre: 'Cheesecake', precio: 35, emoji: '🍰', destacado: true },
  { id: 'p-brownie', categoriaId: 'cat-postres', nombre: 'Brownie', precio: 25, emoji: '🍫' },
  { id: 'p-tres-leches', categoriaId: 'cat-postres', nombre: 'Tres leches', precio: 30, emoji: '🍰' },

  { id: 'p-sandwich', categoriaId: 'cat-salados', nombre: 'Sándwich de pollo', precio: 38, emoji: '🥪' },
  { id: 'p-panini', categoriaId: 'cat-salados', nombre: 'Panini caprese', precio: 42, emoji: '🥪', destacado: true },
  { id: 'p-quiche', categoriaId: 'cat-salados', nombre: 'Quiche de espinaca', precio: 34, emoji: '🥧' },
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

export interface Comanda {
  id: string;
  folio: string;
  origen: string;
  estacion: Estacion;
  estado: EstadoComanda;
  creada: Date;
  items: ComandaItem[];
}

const now = Date.now();
const minAgo = (m: number) => new Date(now - m * 60000);

export const comandas: Comanda[] = [
  {
    id: 'c-1', folio: '#1042', origen: 'Mesa 4', estacion: 'Barra', estado: 'pendiente', creada: minAgo(2),
    items: [
      { nombre: 'Latte', cantidad: 2, nota: 'Uno deslactosado' },
      { nombre: 'Capuchino', cantidad: 1 },
    ],
  },
  {
    id: 'c-2', folio: '#1041', origen: 'Para llevar', estacion: 'Barra', estado: 'preparacion', creada: minAgo(6),
    items: [
      { nombre: 'Frappé de café', cantidad: 1, nota: 'Sin crema' },
      { nombre: 'Cold Brew', cantidad: 1 },
    ],
  },
  {
    id: 'c-3', folio: '#1040', origen: 'Mesa 7', estacion: 'Cocina', estado: 'preparacion', creada: minAgo(11),
    items: [
      { nombre: 'Panini caprese', cantidad: 2 },
      { nombre: 'Quiche de espinaca', cantidad: 1 },
    ],
  },
  {
    id: 'c-4', folio: '#1039', origen: 'Mesa 1', estacion: 'Barra', estado: 'listo', creada: minAgo(9),
    items: [{ nombre: 'Americano', cantidad: 1 }, { nombre: 'Croissant', cantidad: 1 }],
  },
  {
    id: 'c-5', folio: '#1038', origen: 'Barra 1', estacion: 'Cocina', estado: 'pendiente', creada: minAgo(1),
    items: [{ nombre: 'Sándwich de pollo', cantidad: 1, nota: 'Sin cebolla' }],
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
  Latte: {
    tiempoMin: 3,
    ingredientes: ['30 ml de espresso (1 shot)', '180 ml de leche vaporizada', 'Vaso 16 oz'],
    pasos: [
      'Extraer 1 shot de espresso (25-30 seg).',
      'Vaporizar la leche a 60-65 °C con microespuma fina.',
      'Verter la leche sobre el espresso dejando ~1 cm de espuma.',
      'Servir de inmediato.',
    ],
  },
  Capuchino: {
    tiempoMin: 3,
    ingredientes: ['30 ml de espresso', '120 ml de leche', 'Espuma densa', 'Taza 8 oz'],
    pasos: [
      'Extraer 1 shot de espresso.',
      'Vaporizar la leche generando espuma densa y abundante.',
      'Servir en proporción 1/3 espresso, 1/3 leche, 1/3 espuma.',
      'Espolvorear cacao si el cliente lo pide.',
    ],
  },
  Americano: {
    tiempoMin: 2,
    ingredientes: ['30 ml de espresso', '150 ml de agua caliente', 'Vaso 12 oz'],
    pasos: ['Extraer 1 shot de espresso.', 'Agregar agua caliente sobre el espresso.', 'Servir.'],
  },
  'Frappé de café': {
    tiempoMin: 4,
    ingredientes: ['60 ml de espresso frío', '120 ml de leche', 'Hielo', 'Jarabe', 'Crema batida'],
    pasos: [
      'Colocar espresso frío, leche, jarabe y hielo en la licuadora.',
      'Licuar 20-30 seg hasta textura homogénea.',
      'Servir en vaso alto.',
      'Coronar con crema batida (omitir si el cliente la pide sin crema).',
    ],
  },
  'Cold Brew': {
    tiempoMin: 1,
    ingredientes: ['180 ml de concentrado de cold brew', 'Hielo', 'Vaso 16 oz'],
    pasos: ['Llenar el vaso con hielo.', 'Servir el concentrado de cold brew.', 'Remover suavemente.'],
  },
  'Panini caprese': {
    tiempoMin: 6,
    ingredientes: ['Pan ciabatta', 'Mozzarella fresca', 'Tomate', 'Albahaca', 'Aceite de oliva'],
    pasos: [
      'Abrir el pan y untar aceite de oliva.',
      'Colocar mozzarella, tomate y albahaca.',
      'Prensar en la plancha 4-5 min hasta dorar.',
      'Cortar en diagonal y emplatar.',
    ],
  },
  'Quiche de espinaca': {
    tiempoMin: 5,
    ingredientes: ['Porción de quiche', 'Guarnición de ensalada'],
    pasos: ['Calentar la porción de quiche 3-4 min.', 'Emplatar con guarnición de ensalada fresca.'],
  },
  'Sándwich de pollo': {
    tiempoMin: 6,
    ingredientes: ['Pan artesanal', 'Pollo a la plancha', 'Lechuga', 'Tomate', 'Mayonesa'],
    pasos: [
      'Calentar el pollo en la plancha.',
      'Armar el sándwich con lechuga, tomate y mayonesa.',
      'Omitir cebolla si la comanda lo indica.',
      'Cortar y emplatar.',
    ],
  },
  Croissant: {
    tiempoMin: 2,
    ingredientes: ['Croissant', 'Plato'],
    pasos: ['Calentar el croissant 1-2 min.', 'Emplatar.'],
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
