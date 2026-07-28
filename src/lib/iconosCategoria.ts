import { Beef, Utensils, Drumstick, IceCreamCone, type LucideIcon } from 'lucide-react';

/**
 * Icono (lucide-react) por categoría del menú. Fuente única para que la carta,
 * el POS y demás vistas muestren el mismo icono de librería en vez de emoji.
 * Indexado por `categoriaId`; con respaldo genérico para categorías nuevas.
 */
const iconoPorCategoria: Record<string, LucideIcon> = {
  'cat-burgers': Beef,
  'cat-fritos': Utensils,
  'cat-antojitos': Drumstick,
  'cat-frios': IceCreamCone,
};

export function iconoCategoria(categoriaId: string): LucideIcon {
  return iconoPorCategoria[categoriaId] ?? Utensils;
}
