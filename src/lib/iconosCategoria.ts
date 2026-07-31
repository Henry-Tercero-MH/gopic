import {
  Beef,
  Utensils,
  Drumstick,
  IceCreamCone,
  Coffee,
  CupSoda,
  Pizza,
  Sandwich,
  Cookie,
  Soup,
  Salad,
  type LucideIcon,
} from 'lucide-react';

/** Iconos (lucide) disponibles por nombre — así el backend puede guardar 'Beef', etc. */
const porNombre: Record<string, LucideIcon> = {
  Beef,
  Utensils,
  Drumstick,
  IceCreamCone,
  Coffee,
  CupSoda,
  Pizza,
  Sandwich,
  Cookie,
  Soup,
  Salad,
};

/** Mapa por id de categoría del mock (datos de demostración sin backend). */
const iconoPorCategoria: Record<string, LucideIcon> = {
  'cat-burgers': Beef,
  'cat-fritos': Utensils,
  'cat-antojitos': Drumstick,
  'cat-frios': IceCreamCone,
};

/** Registro dinámico: categoriaId → icono, poblado desde el backend. */
const registro: Record<string, LucideIcon> = {};

/** Registra los iconos de las categorías traídas de la API (por su campo `icono`). */
export function registrarIconosCategoria(cats: { id: string; icono?: string | null }[]): void {
  for (const c of cats) {
    const comp = c.icono ? porNombre[c.icono] : undefined;
    if (comp) registro[c.id] = comp;
  }
}

/** Icono de una categoría: primero el registrado (backend), luego el mock, luego genérico. */
export function iconoCategoria(categoriaId: string): LucideIcon {
  return registro[categoriaId] ?? iconoPorCategoria[categoriaId] ?? Utensils;
}

/** Nombres de icono que la UI ofrece al crear/editar categorías. */
export const ICONOS_DISPONIBLES = Object.keys(porNombre);

/** Componente lucide para un nombre de icono; genérico si no existe. */
export function componenteIcono(nombre: string | undefined): LucideIcon {
  return (nombre && porNombre[nombre]) || Utensils;
}
