import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PosPage } from '@/features/pos/PosPage';
import { MesasPage } from '@/features/mesas/MesasPage';
import { KdsPage } from '@/features/kds/KdsPage';
import { InventarioPage } from '@/features/inventario/InventarioPage';
import { RecetarioPage } from '@/features/recetario/RecetarioPage';
import { ReportesPage } from '@/features/reportes/ReportesPage';
import { ConfigPage } from '@/features/config/ConfigPage';
import '@/styles/globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pos', element: <PosPage /> },
      { path: 'mesas', element: <MesasPage /> },
      { path: 'kds', element: <KdsPage /> },
      { path: 'inventario', element: <InventarioPage /> },
      { path: 'recetario', element: <RecetarioPage /> },
      { path: 'reportes', element: <ReportesPage /> },
      { path: 'config', element: <ConfigPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
