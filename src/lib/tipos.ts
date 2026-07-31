/**
 * Tipos de dominio que la UI comparte (catálogo, inventario…).
 * Son la "forma" de los datos que vienen del backend; viven aquí (y no en el
 * mock) para que las pantallas y la capa de datos no dependan de datos de prueba.
 */

export interface Categoria {
  id: string;
  nombre: string;
  emoji: string;
  /** Nombre del icono lucide (p. ej. 'Beef'); lo persiste el backend en `icono`. */
  icono?: string;
}

export interface Producto {
  id: string;
  categoriaId: string;
  nombre: string;
  precio: number;
  emoji: string;
  /** Estación que prepara el producto; enruta la comanda al KDS correcto. */
  estacion?: 'Barra' | 'Cocina';
  /** Foto del producto. */
  imagen?: string;
  destacado?: boolean;
  /** Ids de grupos de modificadores aplicables. */
  modificadores?: string[];
}

/** Nivel de existencia de un insumo respecto a su mínimo. */
export type NivelStock = 'ok' | 'bajo' | 'critico';
