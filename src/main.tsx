import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { OperacionProvider } from '@/lib/operacion';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { aplicarTema, leerTema } from '@/lib/theme';
import { bloquearZoom } from '@/lib/bloquearZoom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PosPage } from '@/features/pos/PosPage';
import { CajaPage } from '@/features/caja/CajaPage';
import { MesasPage } from '@/features/mesas/MesasPage';
import { ClientesPage } from '@/features/clientes/ClientesPage';
import { PersonalPage } from '@/features/personal/PersonalPage';
import { KdsPage } from '@/features/kds/KdsPage';
import { InventarioPage } from '@/features/inventario/InventarioPage';
import { CatalogosPage } from '@/features/catalogos/CatalogosPage';
import { ComprasPage } from '@/features/compras/ComprasPage';
import { GastosPage } from '@/features/gastos/GastosPage';
import { PromocionesPage } from '@/features/promociones/PromocionesPage';
import { RecetarioPage } from '@/features/recetario/RecetarioPage';
import { ReportesPage } from '@/features/reportes/ReportesPage';
import { ConfigPage } from '@/features/config/ConfigPage';
import '@/styles/globals.css';

// Aplica el tema guardado antes del primer render (afecta también al Login).
aplicarTema(leerTema());

// Deshabilita el zoom (pellizco / doble toque) en móviles y tablets.
bloquearZoom();

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pos', element: <PosPage /> },
      { path: 'caja', element: <CajaPage /> },
      { path: 'mesas', element: <MesasPage /> },
      { path: 'kds', element: <KdsPage /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'personal', element: <PersonalPage /> },
      { path: 'inventario', element: <InventarioPage /> },
      { path: 'catalogos', element: <CatalogosPage /> },
      { path: 'recetario', element: <RecetarioPage /> },
      { path: 'compras', element: <ComprasPage /> },
      { path: 'gastos', element: <GastosPage /> },
      { path: 'promociones', element: <PromocionesPage /> },
      { path: 'reportes', element: <ReportesPage /> },
      { path: 'config', element: <ConfigPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <OperacionProvider>
            <RouterProvider router={router} />
          </OperacionProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
