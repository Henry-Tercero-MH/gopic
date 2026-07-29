import { useQuery } from '@tanstack/react-query';
import { getProductos, getCategorias } from './api';
import { registrarIconosCategoria } from './iconosCategoria';
import type { Producto, Categoria } from '@/mock/data';

/**
 * Trae productos y categorías del backend, los mapea a los tipos que usa la UI
 * y registra los iconos de categoría. React Query gestiona carga/error/caché.
 */
async function cargarCatalogo(): Promise<{ productos: Producto[]; categorias: Categoria[] }> {
  const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);

  registrarIconosCategoria(cats);

  const productos: Producto[] = prods.map((p) => ({
    id: p.id,
    categoriaId: p.categoriaId,
    nombre: p.nombre,
    precio: Number(p.precio),
    emoji: '🍽️', // el backend aún no maneja emoji por producto; se usa la imagen si existe
    imagen: p.imagenUrl ?? undefined,
    destacado: p.destacado,
    // `modificadores` no viene en el listado; se resolverá con el detalle del producto
  }));

  const categorias: Categoria[] = cats.map((c) => ({ id: c.id, nombre: c.nombre, emoji: '' }));

  return { productos, categorias };
}

export function useCatalogo() {
  return useQuery({
    queryKey: ['catalogo'],
    queryFn: cargarCatalogo,
    staleTime: 5 * 60 * 1000, // 5 min: el catálogo cambia poco
  });
}
