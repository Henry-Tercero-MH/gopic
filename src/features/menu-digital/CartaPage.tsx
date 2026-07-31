import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Sparkles, Settings2, Clock, LayoutGrid, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { iconoCategoria as iconoDe, registrarIconosCategoria } from '@/lib/iconosCategoria';
import { getCarta } from '@/lib/api';

/**
 * Carta digital pública (solo lectura), pensada para abrirse por QR desde la mesa.
 * No requiere sesión. Responsiva: una columna en móvil, grid que llena el ancho
 * en pantallas grandes.
 */
export function CartaPage() {
  const [catActiva, setCatActiva] = useState<string>('all');
  const { data, isLoading } = useQuery({ queryKey: ['carta'], queryFn: getCarta, staleTime: 60_000 });

  const categorias = data?.categorias ?? [];
  const productos = data?.productos ?? [];
  const promosActivas = data?.promociones ?? [];

  // Registra los iconos (lucide) de las categorías traídas del backend.
  useEffect(() => {
    if (data?.categorias) registrarIconosCategoria(data.categorias);
  }, [data]);

  const categoriasVisibles = catActiva === 'all' ? categorias : categorias.filter((c) => c.id === catActiva);

  // Productos agrupados por categoría visible.
  const secciones = useMemo(
    () =>
      categoriasVisibles.map((cat) => ({
        cat,
        items: productos.filter((p) => p.categoriaId === cat.id),
      })),
    [categoriasVisibles, productos],
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Encabezado de marca */}
      <header className="flex flex-col items-center gap-2 px-4 pb-5 pt-8 text-center">
        <img src="/img/logo.png" alt="GOPIC" className="h-20 w-20 rounded-full object-cover shadow-card" />
        <h1 className="font-display text-2xl font-semibold text-brand-700 sm:text-3xl">{data?.negocio.nombre ?? 'GOPIC'}</h1>
        <p className="text-sm text-text-muted">{isLoading ? 'Cargando carta…' : 'Nuestra carta'}</p>
      </header>

      {/* Filtro de categorías (sticky, ancho completo) */}
      <nav className="sticky top-0 z-10 border-y border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto scroll-thin px-4 py-3 sm:px-6 lg:px-8">
          <Chip label="Todos" icon={LayoutGrid} activo={catActiva === 'all'} onClick={() => setCatActiva('all')} />
          {categorias.map((c) => (
            <Chip
              key={c.id}
              label={c.nombre}
              icon={iconoDe(c.id)}
              activo={catActiva === c.id}
              onClick={() => setCatActiva(c.id)}
            />
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Promociones activas */}
        {promosActivas.length > 0 && (
          <section className="pt-5">
            <div className="flex items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wide text-accent-600">
              <Sparkles size={14} /> Promociones
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {promosActivas.map((promo) => (
                <div key={promo.id} className="rounded-xl border border-accent-400/40 bg-accent-400/10 p-3">
                  <div className="font-display text-base font-semibold text-text">{promo.nombre}</div>
                  <div className="mt-0.5 text-sm text-text-muted">{promo.aplicaEn}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-600">
                    <Clock size={12} /> {promo.vigencia}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Secciones de la carta */}
        {secciones.map(({ cat, items }) => (
          <section key={cat.id} className="pt-8">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-text">
              {(() => {
                const Icono = iconoDe(cat.id);
                return <Icono size={22} className="text-brand-500" />;
              })()}
              {cat.nombre}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <article
                  key={p.id}
                  className="flex gap-3 rounded-xl border border-border bg-surface p-3 shadow-card transition-shadow hover:shadow-modal"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                    {p.imagen ? (
                      <img src={p.imagen} alt={p.nombre} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      (() => {
                        const Icono = iconoDe(p.categoriaId);
                        return (
                          <span className="grid h-full w-full place-items-center text-text-muted">
                            <Icono size={28} />
                          </span>
                        );
                      })()
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-text">{p.nombre}</span>
                      <span className="num shrink-0 font-semibold text-brand-700">{formatCurrency(p.precio)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {p.destacado && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-600">
                          <Star size={10} /> Popular
                        </span>
                      )}
                      {p.personalizable && (
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          <Settings2 size={12} /> Personalizable
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <footer className="pt-10 text-center text-xs text-text-muted">
          Los precios pueden variar. Consulta con tu mesero por disponibilidad.
          <div className="mt-1">GOPIC · Preparaciones con sabor</div>
        </footer>
      </main>
    </div>
  );
}

function Chip({
  label,
  icon: Icon,
  activo,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
        activo
          ? 'border-action-500 bg-action-50 text-action-700'
          : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
      )}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
