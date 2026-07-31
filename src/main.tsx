import { StrictMode, lazy, Suspense, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, RequireAuth, RequireAdmin } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { OperacionProvider } from '@/lib/operacion';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { PantallaCarga } from '@/components/ui/PantallaCarga';
import { aplicarTema, leerTema } from '@/lib/theme';
import { bloquearZoom } from '@/lib/bloquearZoom';
import { RUTAS } from '@/lib/rutas';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorPage } from '@/features/misc/ErrorPage';
import '@/styles/globals.css';

// Aplica el tema guardado antes del primer render (afecta también al Login).
aplicarTema(leerTema());

// Deshabilita el zoom (pellizco / doble toque) en móviles y tablets.
bloquearZoom();

/** Carga diferida de una página por su export nombrado, con fallback de Suspense. */
function pagina(cargar: () => Promise<Record<string, ComponentType>>, nombre: string) {
  const Comp = lazy(() => cargar().then((m) => ({ default: m[nombre] })));
  return (
    <Suspense fallback={<PantallaCarga />}>
      <Comp />
    </Suspense>
  );
}

const router = createBrowserRouter([
  { path: RUTAS.login, element: pagina(() => import('@/features/auth/LoginPage'), 'LoginPage') },
  { path: RUTAS.registro, element: pagina(() => import('@/features/auth/RegistroPage'), 'RegistroPage') },
  { path: RUTAS.recuperar, element: pagina(() => import('@/features/auth/RecuperarPage'), 'RecuperarPage') },
  { path: RUTAS.restablecer, element: pagina(() => import('@/features/auth/RestablecerPage'), 'RestablecerPage') },
  { path: RUTAS.carta, element: pagina(() => import('@/features/menu-digital/CartaPage'), 'CartaPage') },
  {
    path: RUTAS.dashboard,
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: pagina(() => import('@/features/dashboard/DashboardPage'), 'DashboardPage') },
      { path: 'pos', element: pagina(() => import('@/features/pos/PosPage'), 'PosPage') },
      { path: 'caja', element: pagina(() => import('@/features/caja/CajaPage'), 'CajaPage') },
      { path: 'mesas', element: pagina(() => import('@/features/mesas/MesasPage'), 'MesasPage') },
      { path: 'kds', element: pagina(() => import('@/features/kds/KdsPage'), 'KdsPage') },
      { path: 'clientes', element: pagina(() => import('@/features/clientes/ClientesPage'), 'ClientesPage') },
      { path: 'lealtad', element: pagina(() => import('@/features/lealtad/LealtadPage'), 'LealtadPage') },
      { path: 'personal', element: pagina(() => import('@/features/personal/PersonalPage'), 'PersonalPage') },
      { path: 'inventario', element: pagina(() => import('@/features/inventario/InventarioPage'), 'InventarioPage') },
      { path: 'catalogos', element: pagina(() => import('@/features/catalogos/CatalogosPage'), 'CatalogosPage') },
      { path: 'recetario', element: pagina(() => import('@/features/recetario/RecetarioPage'), 'RecetarioPage') },
      { path: 'promociones', element: pagina(() => import('@/features/promociones/PromocionesPage'), 'PromocionesPage') },
      // Rutas solo-admin agrupadas bajo un único guard (Outlet), sin repetir el wrapper.
      {
        element: (
          <RequireAdmin>
            <Outlet />
          </RequireAdmin>
        ),
        children: [
          { path: 'compras', element: pagina(() => import('@/features/compras/ComprasPage'), 'ComprasPage') },
          { path: 'gastos', element: pagina(() => import('@/features/gastos/GastosPage'), 'GastosPage') },
          { path: 'reportes', element: pagina(() => import('@/features/reportes/ReportesPage'), 'ReportesPage') },
          { path: 'config', element: pagina(() => import('@/features/config/ConfigPage'), 'ConfigPage') },
        ],
      },
    ],
  },
  { path: '*', element: pagina(() => import('@/features/misc/NotFoundPage'), 'NotFoundPage') },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <OperacionProvider>
              <RouterProvider router={router} />
            </OperacionProvider>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
