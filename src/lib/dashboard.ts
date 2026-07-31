import { useQuery } from '@tanstack/react-query';
import { getDashboard } from './api';

/** KPIs del día, últimas ventas y más vendidos (backend). Se refresca cada 30s. */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    refetchInterval: 30_000,
  });
}
