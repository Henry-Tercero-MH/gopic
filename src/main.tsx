import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PosPage } from '@/features/pos/PosPage';
import { MesasPage } from '@/features/mesas/MesasPage';
import { KdsPage } from '@/features/kds/KdsPage';
import { PlaceholderPage } from '@/features/placeholder/PlaceholderPage';
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
      { path: 'inventario', element: <PlaceholderPage titulo="Inventario" /> },
      { path: 'recetario', element: <PlaceholderPage titulo="Recetario" /> },
      { path: 'reportes', element: <PlaceholderPage titulo="Reportes" /> },
      { path: 'config', element: <PlaceholderPage titulo="Configuración" /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
