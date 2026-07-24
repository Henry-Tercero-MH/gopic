import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState, type ComponentType } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Utensils,
  ChefHat,
  Package,
  BookOpen,
  BarChart3,
  Settings,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  soon?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'Punto de venta', icon: ReceiptText },
  { to: '/mesas', label: 'Mesas', icon: Utensils },
  { to: '/kds', label: 'Cocina / Barra', icon: ChefHat },
  { to: '/inventario', label: 'Inventario', icon: Package },
  { to: '/recetario', label: 'Recetario', icon: BookOpen },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/config', label: 'Configuración', icon: Settings },
];

export function AppShell() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center gap-2 px-4">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-500 text-text-invert">
            <Coffee size={20} />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold text-brand-700">Café Aurora</div>
            <div className="text-xs text-text-muted">Punto de venta</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
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
              {item.soon && (
                <span className="rounded-full bg-surface-sunk px-1.5 py-0.5 text-[10px] font-semibold text-text-muted">
                  pronto
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-700 font-semibold">
              AR
            </span>
            <div className="flex-1 leading-tight">
              <div className="text-sm font-medium text-text">Ana Rodríguez</div>
              <div className="text-xs text-text-muted">Cajera · Turno mañana</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
          <div className="flex items-center gap-3">
            <Coffee size={20} className="text-brand-500 md:hidden" />
            <span className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success">
              <span className="h-2 w-2 rounded-full bg-success" /> Caja abierta · fondo Q500
            </span>
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
      </div>
    </div>
  );
}
