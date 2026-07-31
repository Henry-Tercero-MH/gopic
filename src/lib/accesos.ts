import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getCatalogoPermisos,
  crearRol,
  editarRol,
  eliminarRol,
  getUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  type RolInput,
  type UsuarioCrearInput,
  type UsuarioEditarInput,
} from './api';

/** Roles de la sucursal con sus permisos. */
export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: getRoles });
}

/** Catálogo de permisos disponibles, agrupados por módulo. */
export function useCatalogoPermisos() {
  return useQuery({ queryKey: ['permisos-catalogo'], queryFn: getCatalogoPermisos, staleTime: 10 * 60 * 1000 });
}

/** Mutaciones de roles; invalidan la lista al terminar. */
export function useRolMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['roles'] });
  return {
    crear: useMutation({ mutationFn: (data: RolInput) => crearRol(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<RolInput> }) => editarRol(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarRol(id), onSuccess: invalidar }),
  };
}

/** Cuentas de acceso de la sucursal. */
export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: getUsuarios });
}

/** Mutaciones de usuarios; invalidan la lista (y roles, por los conteos). */
export function useUsuarioMutations() {
  const qc = useQueryClient();
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['usuarios'] });
    qc.invalidateQueries({ queryKey: ['roles'] });
  };
  return {
    crear: useMutation({ mutationFn: (data: UsuarioCrearInput) => crearUsuario(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UsuarioEditarInput }) => editarUsuario(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarUsuario(id), onSuccess: invalidar }),
  };
}
