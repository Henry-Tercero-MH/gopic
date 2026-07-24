import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider, RequireAuth } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PosPage } from '@/features/pos/PosPage';
import { CajaPage } from '@/features/caja/CajaPage';
import { MesasPage } from '@/features/mesas/MesasPage';
import { ClientesPage } from '@/features/clientes/ClientesPage';
import { KdsPage } from '@/features/kds/KdsPage';
import { InventarioPage } from '@/features/inventario/InventarioPage';
import { CatalogosPage } from '@/features/catalogos/CatalogosPage';
import { RecetarioPage } from '@/features/recetario/RecetarioPage';
import { ReportesPage } from '@/features/reportes/ReportesPage';
import { ConfigPage } from '@/features/config/ConfigPage';
import '@/styles/globals.css';

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
      { path: 'inventario', element: <InventarioPage /> },
      { path: 'catalogos', element: <CatalogosPage /> },
      { path: 'recetario', element: <RecetarioPage /> },
      { path: 'reportes', element: <ReportesPage /> },
      { path: 'config', element: <ConfigPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
