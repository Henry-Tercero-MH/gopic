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
  /** Ids de grupos de modificadores aplicables (ver `gruposModificadores`). */
  modificadores?: string[];
}

/* ---- Modificadores de producto ---- */
export interface OpcionModificador {
  id: string;
  nombre: string;
  /** Ajuste al precio del producto (0 = sin costo, positivo = extra). */
  precio: number;
}

export interface GrupoModificador {
  id: string;
  nombre: string;
  /** true = obligatorio elegir una opción; false = opcional. */
  requerido: boolean;
  /** true = varias opciones (extras); false = una sola (tamaño). */
  multiple: boolean;
  opciones: OpcionModificador[];
}

export const gruposModificadores: GrupoModificador[] = [
  {
    id: 'mod-tamano', nombre: 'Tamaño', requerido: true, multiple: false,
    opciones: [
      { id: 'tam-ch', nombre: 'Chico', precio: 0 },
      { id: 'tam-md', nombre: 'Mediano', precio: 5 },
      { id: 'tam-gd', nombre: 'Grande', precio: 9 },
    ],
  },
  {
    id: 'mod-leche', nombre: 'Tipo de leche', requerido: true, multiple: false,
    opciones: [
      { id: 'leche-entera', nombre: 'Entera', precio: 0 },
      { id: 'leche-deslac', nombre: 'Deslactosada', precio: 3 },
      { id: 'leche-almendra', nombre: 'De almendra', precio: 6 },
      { id: 'leche-avena', nombre: 'De avena', precio: 6 },
    ],
  },
  {
    id: 'mod-extras', nombre: 'Extras', requerido: false, multiple: true,
    opciones: [
      { id: 'ex-shot', nombre: 'Shot extra de espresso', precio: 6 },
      { id: 'ex-vainilla', nombre: 'Jarabe de vainilla', precio: 4 },
      { id: 'ex-caramelo', nombre: 'Jarabe de caramelo', precio: 4 },
      { id: 'ex-crema', nombre: 'Crema batida', precio: 5 },
    ],
  },
  {
    id: 'mod-termino', nombre: 'Término', requerido: true, multiple: false,
    opciones: [
      { id: 'term-13', nombre: 'Término medio', precio: 0 },
      { id: 'term-34', nombre: 'Tres cuartos', precio: 0 },
      { id: 'term-bien', nombre: 'Bien cocido', precio: 0 },
    ],
  },
  {
    id: 'mod-extras-comida', nombre: 'Extras', requerido: false, multiple: true,
    opciones: [
      { id: 'exc-queso', nombre: 'Queso extra', precio: 6 },
      { id: 'exc-tocino', nombre: 'Tocino', precio: 8 },
      { id: 'exc-jalapeno', nombre: 'Jalapeños', precio: 3 },
      { id: 'exc-aguacate', nombre: 'Aguacate', precio: 7 },
    ],
  },
  {
    id: 'mod-sin', nombre: 'Sin ingredientes', requerido: false, multiple: true,
    opciones: [
      { id: 'sin-cebolla', nombre: 'Sin cebolla', precio: 0 },
      { id: 'sin-tomate', nombre: 'Sin tomate', precio: 0 },
      { id: 'sin-lechuga', nombre: 'Sin lechuga', precio: 0 },
      { id: 'sin-salsa', nombre: 'Sin salsa', precio: 0 },
    ],
  },
];

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
  { id: 'p-hamburguesa', categoriaId: 'cat-burgers', nombre: 'Hamburguesa clásica', precio: 38, emoji: '🍔', imagen: img('photo-1568901346375-23c9450c58cd'), destacado: true, modificadores: ['mod-termino', 'mod-extras-comida', 'mod-sin'] },
  { id: 'p-cheeseburger', categoriaId: 'cat-burgers', nombre: 'Cheeseburger', precio: 42, emoji: '🍔', imagen: img('photo-1571091718767-18b5b1457add'), modificadores: ['mod-termino', 'mod-extras-comida', 'mod-sin'] },
  { id: 'p-doble', categoriaId: 'cat-burgers', nombre: 'Doble carne', precio: 55, emoji: '🍔', imagen: img('photo-1586190848861-99aa4a171e90'), destacado: true, modificadores: ['mod-termino', 'mod-extras-comida', 'mod-sin'] },
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
  { id: 'p-malteada', categoriaId: 'cat-frios', nombre: 'Malteada', precio: 30, emoji: '🥤', imagen: img('photo-1585238342024-78d387f4a707'), destacado: true, modificadores: ['mod-tamano'] },
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
  { nombre: 'Hamburguesa clásica', unidades: 42, ingreso: 1596 },
  { nombre: 'Papas fritas', unidades: 58, ingreso: 1276 },
  { nombre: 'Alitas BBQ', unidades: 31, ingreso: 1488 },
  { nombre: 'Salchipapas', unidades: 27, ingreso: 945 },
  { nombre: 'Malteada', unidades: 24, ingreso: 720 },
];

export const alertasStock = [
  { insumo: 'Carne de res (molida)', restante: '3 kg', minimo: '8 kg', nivel: 'critico' as const },
  { insumo: 'Papa', restante: '6 kg', minimo: '15 kg', nivel: 'critico' as const },
  { insumo: 'Pan de hamburguesa', restante: '40 pz', minimo: '100 pz', nivel: 'bajo' as const },
  { insumo: 'Vasos 16 oz', restante: '85 pz', minimo: '150 pz', nivel: 'bajo' as const },
];

/* Serie de ventas por hora para el mini-gráfico del dashboard */
export const ventasPorHora = [
  { hora: '7', monto: 180 }, { hora: '8', monto: 420 }, { hora: '9', monto: 560 },
  { hora: '10', monto: 640 }, { hora: '11', monto: 520 }, { hora: '12', monto: 780 },
  { hora: '13', monto: 710 }, { hora: '14', monto: 490 }, { hora: '15', monto: 520 },
];

/* ---- Inventario ---- */
export type NivelStock = 'ok' | 'bajo' | 'critico';

/** Etapa del insumo en la cadena de producción. */
export type TipoInsumo = 'materia_prima' | 'elaborado' | 'terminado';

export interface Insumo {
  id: string;
  nombre: string;
  categoria: string;
  existencia: number;
  unidad: string;
  minimo: number;
  costoUnitario: number;
  nivel: NivelStock;
  /** Etapa de producción. Si falta, se asume materia prima. */
  tipo?: TipoInsumo;
}

export const insumos: Insumo[] = [
  { id: 'i-1', nombre: 'Carne de res (molida)', categoria: 'Cárnicos', existencia: 3, unidad: 'kg', minimo: 8, costoUnitario: 62, nivel: 'critico', tipo: 'materia_prima' },
  { id: 'i-2', nombre: 'Papa', categoria: 'Verduras', existencia: 6, unidad: 'kg', minimo: 15, costoUnitario: 7, nivel: 'critico', tipo: 'materia_prima' },
  { id: 'i-3', nombre: 'Pan de hamburguesa', categoria: 'Panadería', existencia: 40, unidad: 'pz', minimo: 100, costoUnitario: 2.5, nivel: 'bajo', tipo: 'materia_prima' },
  { id: 'i-4', nombre: 'Queso amarillo', categoria: 'Lácteos', existencia: 4.5, unidad: 'kg', minimo: 3, costoUnitario: 55, nivel: 'ok', tipo: 'materia_prima' },
  { id: 'i-5', nombre: 'Alitas de pollo', categoria: 'Cárnicos', existencia: 9, unidad: 'kg', minimo: 5, costoUnitario: 38, nivel: 'ok', tipo: 'materia_prima' },
  { id: 'i-6', nombre: 'Vasos 16 oz', categoria: 'Desechables', existencia: 85, unidad: 'pz', minimo: 150, costoUnitario: 0.9, nivel: 'bajo', tipo: 'materia_prima' },
  { id: 'i-7', nombre: 'Salchicha', categoria: 'Cárnicos', existencia: 7, unidad: 'kg', minimo: 4, costoUnitario: 34, nivel: 'ok', tipo: 'materia_prima' },
  { id: 'i-8', nombre: 'Aceite para freír', categoria: 'Abarrotes', existencia: 18, unidad: 'L', minimo: 8, costoUnitario: 22, nivel: 'ok', tipo: 'materia_prima' },
  { id: 'i-9', nombre: 'Salsa BBQ', categoria: 'Salsas', existencia: 6, unidad: 'L', minimo: 3, costoUnitario: 28, nivel: 'ok', tipo: 'materia_prima' },
  { id: 'i-10', nombre: 'Helado de vainilla', categoria: 'Lácteos', existencia: 5, unidad: 'L', minimo: 3, costoUnitario: 30, nivel: 'ok', tipo: 'materia_prima' },
  /* ---- Materia prima que se reprocesa ---- */
  { id: 'i-11', nombre: 'Fruta de temporada (granel)', categoria: 'Frutas', existencia: 24, unidad: 'kg', minimo: 10, costoUnitario: 12, nivel: 'ok', tipo: 'materia_prima' },
  { id: 'i-12', nombre: 'Gomitas enchiladas (granel)', categoria: 'Dulces', existencia: 8, unidad: 'kg', minimo: 3, costoUnitario: 45, nivel: 'ok', tipo: 'materia_prima' },
  /* ---- Producto elaborado (derivado por reproceso) ---- */
  { id: 'i-13', nombre: 'Fruta congelada (bolsa 250g)', categoria: 'Frutas', existencia: 6, unidad: 'bolsa', minimo: 20, costoUnitario: 4, nivel: 'critico', tipo: 'elaborado' },
  { id: 'i-14', nombre: 'Aderezo de la casa', categoria: 'Salsas', existencia: 3, unidad: 'L', minimo: 2, costoUnitario: 18, nivel: 'ok', tipo: 'elaborado' },
  /* ---- Producto terminado (listo para vender) ---- */
  { id: 'i-15', nombre: 'Gomitas enchiladas (bolsita 80g)', categoria: 'Dulces', existencia: 14, unidad: 'bolsita', minimo: 30, costoUnitario: 6, nivel: 'bajo', tipo: 'terminado' },
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
export interface RecetaDetalleItem {
  insumo: string;
  cantidad: string;
  merma: string;
  costo: number;
}

export interface RecetaResumen {
  id: string;
  producto: string;
  emoji: string;
  precioVenta: number;
  costo: number;
  /** Ingredientes de la receta; su longitud es el número de insumos. */
  detalle: RecetaDetalleItem[];
}

export const recetas: RecetaResumen[] = [
  {
    id: 'r-1', producto: 'Hamburguesa clásica', emoji: '🍔', precioVenta: 38, costo: 12.4,
    detalle: [
      { insumo: 'Carne de res (molida)', cantidad: '150 g', merma: '5%', costo: 9.3 },
      { insumo: 'Pan de hamburguesa', cantidad: '1 pz', merma: '0%', costo: 2.5 },
      { insumo: 'Lechuga y tomate', cantidad: '40 g', merma: '3%', costo: 0.6 },
    ],
  },
  {
    id: 'r-2', producto: 'Cheeseburger', emoji: '🍔', precioVenta: 42, costo: 15.9,
    detalle: [
      { insumo: 'Carne de res (molida)', cantidad: '150 g', merma: '5%', costo: 9.3 },
      { insumo: 'Pan de hamburguesa', cantidad: '1 pz', merma: '0%', costo: 2.5 },
      { insumo: 'Queso amarillo', cantidad: '60 g', merma: '0%', costo: 3.3 },
      { insumo: 'Lechuga y tomate', cantidad: '40 g', merma: '3%', costo: 0.8 },
    ],
  },
  {
    id: 'r-3', producto: 'Papas fritas', emoji: '🍟', precioVenta: 22, costo: 4.6,
    detalle: [
      { insumo: 'Papa', cantidad: '250 g', merma: '8%', costo: 1.9 },
      { insumo: 'Aceite para freír', cantidad: '50 ml', merma: '10%', costo: 1.2 },
      { insumo: 'Sal y empaque', cantidad: '1 porción', merma: '0%', costo: 1.5 },
    ],
  },
  {
    id: 'r-4', producto: 'Alitas BBQ', emoji: '🍗', precioVenta: 48, costo: 16.2,
    detalle: [
      { insumo: 'Alitas de pollo', cantidad: '350 g', merma: '6%', costo: 13.3 },
      { insumo: 'Salsa BBQ', cantidad: '60 ml', merma: '2%', costo: 1.7 },
      { insumo: 'Aceite para freír', cantidad: '50 ml', merma: '10%', costo: 1.2 },
    ],
  },
  {
    id: 'r-5', producto: 'Salchipapas', emoji: '🌭', precioVenta: 35, costo: 9.8,
    detalle: [
      { insumo: 'Papa', cantidad: '200 g', merma: '8%', costo: 1.5 },
      { insumo: 'Salchicha', cantidad: '120 g', merma: '3%', costo: 4.1 },
      { insumo: 'Queso amarillo', cantidad: '40 g', merma: '0%', costo: 2.2 },
      { insumo: 'Aceite para freír', cantidad: '50 ml', merma: '10%', costo: 2.0 },
    ],
  },
  {
    id: 'r-6', producto: 'Malteada', emoji: '🥤', precioVenta: 30, costo: 7.9,
    detalle: [
      { insumo: 'Helado de vainilla', cantidad: '200 ml', merma: '0%', costo: 6.0 },
      { insumo: 'Leche', cantidad: '100 ml', merma: '0%', costo: 1.0 },
      { insumo: 'Vaso 16 oz', cantidad: '1 pz', merma: '0%', costo: 0.9 },
    ],
  },
];

/* ---- Reportes ---- */
export const ventasPorDia = [
  { dia: 'Lun', monto: 3820 }, { dia: 'Mar', monto: 4210 }, { dia: 'Mié', monto: 3990 },
  { dia: 'Jue', monto: 4680 }, { dia: 'Vie', monto: 5940 }, { dia: 'Sáb', monto: 7120 },
  { dia: 'Dom', monto: 6380 },
];

export const ventasPorCategoria = [
  { categoria: 'Hamburguesas', monto: 13600, pct: 38 },
  { categoria: 'Papas y fritos', monto: 8900, pct: 25 },
  { categoria: 'Antojitos', monto: 6100, pct: 17 },
  { categoria: 'Fríos', monto: 4600, pct: 13 },
  { categoria: 'Otros', monto: 2500, pct: 7 },
];

export const rentabilidadProductos = [
  { producto: 'Hamburguesa clásica', vendidos: 312, ingreso: 11856, costo: 3869, margen: 67 },
  { producto: 'Papas fritas', vendidos: 428, ingreso: 9416, costo: 1968, margen: 79 },
  { producto: 'Alitas BBQ', vendidos: 168, ingreso: 8064, costo: 2722, margen: 66 },
  { producto: 'Salchipapas', vendidos: 194, ingreso: 6790, costo: 1901, margen: 72 },
  { producto: 'Malteada', vendidos: 152, ingreso: 4560, costo: 1201, margen: 74 },
];

/* ---- Personal y control de marcaje ---- */
export type Puesto = 'Cajero' | 'Mesero' | 'Barista' | 'Cocina' | 'Almacenista' | 'Administrador';

/** Estado de marcaje del empleado en el día actual. */
export type EstadoMarcaje = 'sin_marcar' | 'trabajando' | 'salio';

export interface Empleado {
  id: string;
  nombre: string;
  puesto: Puesto;
  telefono: string;
  turno: string;
  iniciales: string;
  estado: EstadoMarcaje;
  /** Hora de entrada marcada hoy (HH:MM) o null si no ha entrado. */
  entrada: string | null;
  /** Hora de salida marcada hoy (HH:MM) o null si sigue en turno. */
  salida: string | null;
}

/* ---- Gastos / Egresos ---- */
export type CategoriaGasto =
  | 'Renta'
  | 'Servicios'
  | 'Nómina'
  | 'Insumos'
  | 'Mantenimiento'
  | 'Marketing'
  | 'Impuestos'
  | 'Otros';

export type EstadoGasto = 'pagado' | 'pendiente';
export type MetodoGasto = 'Efectivo' | 'Transferencia' | 'Tarjeta';

export interface Gasto {
  id: string;
  fecha: string;
  concepto: string;
  categoria: CategoriaGasto;
  proveedor: string;
  metodo: MetodoGasto;
  estado: EstadoGasto;
  monto: number;
}

export const categoriasGasto: CategoriaGasto[] = [
  'Renta', 'Servicios', 'Nómina', 'Insumos', 'Mantenimiento', 'Marketing', 'Impuestos', 'Otros',
];

export const gastosSeed: Gasto[] = [
  { id: 'g-1', fecha: '01/07/2026', concepto: 'Renta del local', categoria: 'Renta', proveedor: 'Inmobiliaria Centro', metodo: 'Transferencia', estado: 'pagado', monto: 6500 },
  { id: 'g-2', fecha: '05/07/2026', concepto: 'Energía eléctrica', categoria: 'Servicios', proveedor: 'EEGSA', metodo: 'Transferencia', estado: 'pagado', monto: 1850 },
  { id: 'g-3', fecha: '05/07/2026', concepto: 'Agua potable', categoria: 'Servicios', proveedor: 'EMPAGUA', metodo: 'Transferencia', estado: 'pagado', monto: 420 },
  { id: 'g-4', fecha: '10/07/2026', concepto: 'Internet y teléfono', categoria: 'Servicios', proveedor: 'Claro', metodo: 'Tarjeta', estado: 'pagado', monto: 550 },
  { id: 'g-5', fecha: '15/07/2026', concepto: 'Quincena de personal', categoria: 'Nómina', proveedor: 'Planilla', metodo: 'Transferencia', estado: 'pagado', monto: 12400 },
  { id: 'g-6', fecha: '18/07/2026', concepto: 'Reparación de refrigerador', categoria: 'Mantenimiento', proveedor: 'FríoTécnico', metodo: 'Efectivo', estado: 'pagado', monto: 780 },
  { id: 'g-7', fecha: '20/07/2026', concepto: 'Publicidad en redes', categoria: 'Marketing', proveedor: 'Agencia Pixel', metodo: 'Tarjeta', estado: 'pendiente', monto: 1200 },
  { id: 'g-8', fecha: '22/07/2026', concepto: 'IVA mensual', categoria: 'Impuestos', proveedor: 'SAT', metodo: 'Transferencia', estado: 'pendiente', monto: 3100 },
];

/* ---- Compras / Órdenes de compra ---- */
export type EstadoOrden = 'borrador' | 'enviada' | 'recibida' | 'cancelada';

export interface OrdenCompraItem {
  insumo: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
}

export interface OrdenCompra {
  id: string;
  folio: string;
  proveedor: string;
  fecha: string;
  estado: EstadoOrden;
  items: OrdenCompraItem[];
}

export const ordenesSeed: OrdenCompra[] = [
  {
    id: 'oc-1', folio: 'OC-0087', proveedor: 'Distribuidora La Carne', fecha: '24/07/2026', estado: 'recibida',
    items: [
      { insumo: 'Carne de res (molida)', cantidad: 10, unidad: 'kg', costoUnitario: 62 },
      { insumo: 'Alitas de pollo', cantidad: 8, unidad: 'kg', costoUnitario: 38 },
    ],
  },
  {
    id: 'oc-2', folio: 'OC-0088', proveedor: 'Lácteos La Pradera', fecha: '25/07/2026', estado: 'enviada',
    items: [
      { insumo: 'Leche entera', cantidad: 40, unidad: 'L', costoUnitario: 8.5 },
      { insumo: 'Leche deslactosada', cantidad: 12, unidad: 'L', costoUnitario: 11 },
      { insumo: 'Mantequilla', cantidad: 5, unidad: 'kg', costoUnitario: 58 },
    ],
  },
  {
    id: 'oc-3', folio: 'OC-0089', proveedor: 'Empaques del Sur', fecha: '25/07/2026', estado: 'borrador',
    items: [
      { insumo: 'Vasos 16 oz', cantidad: 500, unidad: 'pz', costoUnitario: 0.9 },
      { insumo: 'Servilletas', cantidad: 20, unidad: 'paq', costoUnitario: 12 },
    ],
  },
];

export const proveedoresSeed = [
  'Distribuidora El Grano',
  'Lácteos La Pradera',
  'Empaques del Sur',
  'Panadería Central',
];

/* ---- Promociones ---- */
export type TipoPromo = 'porcentaje' | 'monto' | '2x1' | 'combo';

export interface Promocion {
  id: string;
  nombre: string;
  tipo: TipoPromo;
  /** Valor: % para porcentaje, Q para monto/combo; ignorado en 2x1. */
  valor: number;
  aplicaEn: string;
  vigencia: string;
  activa: boolean;
}

export const promocionesSeed: Promocion[] = [
  { id: 'promo-1', nombre: 'Happy Hour papas', tipo: 'porcentaje', valor: 20, aplicaEn: 'Papas y fritos', vigencia: 'L–V · 15:00–17:00', activa: true },
  { id: 'promo-2', nombre: '2x1 en Malteadas', tipo: '2x1', valor: 0, aplicaEn: 'Malteada', vigencia: 'Sábados', activa: true },
  { id: 'promo-3', nombre: 'Combo del día', tipo: 'combo', valor: 55, aplicaEn: 'Hamburguesa + Papas + Refresco', vigencia: 'Todos los días · 12:00–16:00', activa: true },
  { id: 'promo-4', nombre: 'Q10 de descuento', tipo: 'monto', valor: 10, aplicaEn: 'Compras > Q100', vigencia: 'Fin de mes', activa: false },
];

export const empleadosSeed: Empleado[] = [
  { id: 'e-1', nombre: 'Ana Rodríguez', puesto: 'Cajero', telefono: '+502 5555 1010', turno: 'Mañana · 07:00–15:00', iniciales: 'AR', estado: 'trabajando', entrada: '06:58', salida: null },
  { id: 'e-2', nombre: 'Luis Gómez', puesto: 'Mesero', telefono: '+502 5555 2020', turno: 'Mañana · 07:00–15:00', iniciales: 'LG', estado: 'trabajando', entrada: '07:05', salida: null },
  { id: 'e-3', nombre: 'María Pérez', puesto: 'Cocina', telefono: '+502 5555 3030', turno: 'Mañana · 06:00–14:00', iniciales: 'MP', estado: 'trabajando', entrada: '05:56', salida: null },
  { id: 'e-4', nombre: 'Carlos Ruiz', puesto: 'Cocina', telefono: '+502 5555 4040', turno: 'Tarde · 14:00–22:00', iniciales: 'CR', estado: 'sin_marcar', entrada: null, salida: null },
  { id: 'e-5', nombre: 'Sofía Herrera', puesto: 'Almacenista', telefono: '+502 5555 5050', turno: 'Mañana · 07:00–15:00', iniciales: 'SH', estado: 'salio', entrada: '07:00', salida: '13:20' },
  { id: 'e-6', nombre: 'Diego Morales', puesto: 'Mesero', telefono: '+502 5555 6060', turno: 'Tarde · 14:00–22:00', iniciales: 'DM', estado: 'sin_marcar', entrada: null, salida: null },
  { id: 'e-7', nombre: 'Elena Castro', puesto: 'Administrador', telefono: '+502 5555 7070', turno: 'Completo · 08:00–17:00', iniciales: 'EC', estado: 'trabajando', entrada: '07:52', salida: null },
];

/* ---- Ventas por colaborador en el turno (para Reportes) ---- */
export interface VentaEmpleado {
  empleadoId: string;
  nombre: string;
  iniciales: string;
  /** Nº de tickets cerrados por esta persona en el turno. */
  tickets: number;
  /** Monto total vendido en el turno (Q). */
  monto: number;
}

export const ventasPorEmpleadoSeed: VentaEmpleado[] = [
  { empleadoId: 'e-1', nombre: 'Ana Rodríguez', iniciales: 'AR', tickets: 34, monto: 4820 },
  { empleadoId: 'e-2', nombre: 'Luis Gómez', iniciales: 'LG', tickets: 27, monto: 3610 },
  { empleadoId: 'e-6', nombre: 'Diego Morales', iniciales: 'DM', tickets: 19, monto: 2480 },
  { empleadoId: 'e-5', nombre: 'Sofía Herrera', iniciales: 'SH', tickets: 12, monto: 1290 },
];
