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
