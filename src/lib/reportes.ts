import { useQuery } from '@tanstack/react-query';
import { getReportes } from './api';

/** Panel de reportes del mes en curso (datos reales del backend). */
export function useReportes() {
  return useQuery({ queryKey: ['reportes'], queryFn: getReportes });
}
