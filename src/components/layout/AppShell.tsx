import { NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Wallet,
  Utensils,
  ChefHat,
  Users,
  Gift,
  Contact,
  Package,
  Library,
  BookOpen,
  ShoppingCart,
  Tag,
  TrendingDown,
  BarChart3,
  Settings,
  Bird,
  Sun,
  Moon,
  PanelLeftClose,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { RUTAS } from '@/lib/rutas';
import { useCatalogo } from '@/lib/catalogo';
import { useAuth } from '@/lib/auth';
import { useOperacion } from '@/lib/operacion';
import { aplicarTema, leerTema } from '@/lib/theme';
import { formatCurrency } from '@/lib/format';
import { Drawer } from '@/components/ui/Drawer';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  soon?: boolean;
  /** Solo visible para administradores (finanzas / sistema). */
  soloAdmin?: boolean;
}

interface NavGroup {
  titulo: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    titulo: 'Operación',
    items: [
      { to: RUTAS.dashboard, label: 'Dashboard', icon: LayoutDashboard },
      { to: RUTAS.pos, label: 'Punto de venta', icon: ReceiptText },
      { to: RUTAS.caja, label: 'Caja', icon: Wallet },
      { to: RUTAS.mesas, label: 'Mesas', icon: Utensils },
      { to: RUTAS.kds, label: 'Cocina / Barra', icon: ChefHat },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      { to: RUTAS.personal, label: 'Personal', icon: Contact },
      { to: RUTAS.clientes, label: 'Clientes', icon: Users },
      { to: RUTAS.lealtad, label: 'Fidelización', icon: Gift },
      { to: RUTAS.inventario, label: 'Inventario', icon: Package },
      { to: RUTAS.catalogos, label: 'Catálogos', icon: Library },
      { to: RUTAS.recetario, label: 'Recetario', icon: BookOpen },
      { to: RUTAS.compras, label: 'Compras', icon: ShoppingCart, soloAdmin: true },
      { to: RUTAS.gastos, label: 'Gastos', icon: TrendingDown, soloAdmin: true },
      { to: RUTAS.promociones, label: 'Promociones', icon: Tag },
    ],
  },
  {
    titulo: 'Análisis y sistema',
    items: [
      { to: RUTAS.reportes, label: 'Reportes', icon: BarChart3, soloAdmin: true },
      { to: RUTAS.config, label: 'Configuración', icon: Settings, soloAdmin: true },
    ],
  },
];

const COLLAPSE_KEY = 'gopic.sidebar-collapsed';

export function AppShell() {
  const { user, logout } = useAuth();
  const { cajaAbierta, fondoCaja, setProductos, setCategorias } = useOperacion();
  const navigate = useNavigate();

  // Carga el catálogo real (backend) y lo vuelca al store para todas las vistas.
  const catalogo = useCatalogo();
  useEffect(() => {
    if (catalogo.data) {
      setProductos(catalogo.data.productos);
      setCategorias(catalogo.data.categorias);
    }
    // solo al llegar/cambiar los datos; los setters se toman por cierre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo.data]);

  // Menú según el perfil: el colaborador no ve secciones de finanzas / sistema.
  const esAdmin = user?.perfil === 'admin';
  const grupos = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => esAdmin || !i.soloAdmin) }))
    .filter((g) => g.items.length > 0);

  const [dark, setDark] = useState(() => leerTema() === 'dark');
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    aplicarTema(dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  function cerrarSesion() {
    logout();
    navigate(RUTAS.login, { replace: true });
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Marca + colapsar */}
        <div className={cn('flex h-16 items-center px-3', collapsed && 'justify-center px-0')}>
          {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              title="Expandir menú"
              aria-label="Expandir menú"
              className="grid h-9 w-9 place-items-center rounded-full bg-metal-red text-text-invert shadow-card"
            >
              <Bird size={20} />
            </button>
          ) : (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-metal-red text-text-invert shadow-card">
                <Bird size={20} />
              </span>
              <div className="ml-2 min-w-0 leading-tight">
                <div className="font-display text-lg font-semibold text-brand-700">GOPIC</div>
                <div className="truncate text-xs text-text-muted">Preparaciones con sabor</div>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                title="Colapsar menú"
                aria-label="Colapsar menú"
                className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text"
              >
                <PanelLeftClose size={16} />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto scroll-thin px-2 py-2">
          {grupos.map((grupo, gi) => (
            <div key={grupo.titulo} className={cn(gi > 0 && (collapsed ? 'mt-2 border-t border-border pt-2' : 'mt-4'))}>
              {!collapsed && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {grupo.titulo}
                </p>
              )}
              <div className="space-y-1">
                {grupo.items.map((item) =>
                  item.soon ? (
                    <div
                      key={item.to}
                      title={collapsed ? `${item.label} (pronto)` : undefined}
                      className={cn(
                        'flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-muted/60',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {!collapsed && (
                        <span className="rounded-full bg-surface-sunk px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
                          pronto
                        </span>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === RUTAS.dashboard}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          collapsed && 'justify-center px-0',
                          isActive
                            ? 'bg-action-50 text-action-700'
                            : 'text-text-muted hover:bg-surface-sunk hover:text-text',
                        )
                      }
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                    </NavLink>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-border p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user?.iniciales ?? '—'}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-medium text-text">{user?.nombre ?? 'Invitado'}</div>
                <div className="truncate text-xs text-text-muted">{user?.rol ?? ''}</div>
              </div>
            )}
          </div>

          <button
            onClick={cerrarSesion}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10',
              collapsed && 'justify-center px-0',
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 sm:px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-text-muted hover:bg-surface-sunk md:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={18} />
            </button>
            <Bird size={20} className="text-brand-500 md:hidden" />
            {cajaAbierta ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-[11px] font-semibold text-success sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-success" /> Caja abierta · fondo {formatCurrency(fondoCaja)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-surface-sunk px-3 py-1 text-[11px] font-semibold text-text-muted sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-text-muted" /> Caja cerrada
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-text-muted sm:inline">
              Sucursal Central · {new Date().toLocaleDateString('es-GT')}
            </span>
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface hover:bg-surface-sunk"
              aria-label="Cambiar tema"
            >
              {dark ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto scroll-thin">
          <Outlet />
        </main>
        <ScrollRestoration />
      </div>

      <Drawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side="left" ariaLabel="Menú principal" className="w-[86vw] max-w-xs">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-metal-red text-text-invert shadow-card">
              <Bird size={20} />
            </span>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold text-brand-700">GOPIC</div>
              <div className="text-xs text-text-muted">Menú principal</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {grupos.map((grupo, gi) => (
            <div key={grupo.titulo} className={cn('mb-3', gi > 0 && 'mt-2')}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {grupo.titulo}
              </p>
              <div className="space-y-1">
                {grupo.items.map((item) =>
                  item.soon ? (
                    <div
                      key={item.to}
                      className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-muted/60"
                    >
                      <item.icon size={18} className="shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      <span className="rounded-full bg-surface-sunk px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
                        pronto
                      </span>
                    </div>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === RUTAS.dashboard}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-action-50 text-action-700'
                            : 'text-text-muted hover:bg-surface-sunk hover:text-text',
                        )
                      }
                    >
                      <item.icon size={18} className="shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </NavLink>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-3 rounded-md bg-surface-sunk p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user?.iniciales ?? '—'}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-medium text-text">{user?.nombre ?? 'Invitado'}</div>
              <div className="truncate text-xs text-text-muted">{user?.rol ?? ''}</div>
            </div>
          </div>

          <button
            onClick={cerrarSesion}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut size={18} className="shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </Drawer>
    </div>
  );
}
