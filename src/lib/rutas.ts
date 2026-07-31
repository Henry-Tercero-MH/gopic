/**
 * Fuente única de las rutas de la app. Evita strings mágicos repetidos en el
 * router, los `<Link>` y las navegaciones programáticas.
 */
export const RUTAS = {
  // Públicas
  login: '/login',
  registro: '/registro',
  recuperar: '/recuperar',
  restablecer: '/restablecer',
  carta: '/carta',
  // Privadas (bajo AppShell)
  dashboard: '/',
  pos: '/pos',
  caja: '/caja',
  mesas: '/mesas',
  kds: '/kds',
  clientes: '/clientes',
  lealtad: '/lealtad',
  personal: '/personal',
  inventario: '/inventario',
  catalogos: '/catalogos',
  recetario: '/recetario',
  compras: '/compras',
  gastos: '/gastos',
  promociones: '/promociones',
  reportes: '/reportes',
  config: '/config',
} as const;

export type Ruta = (typeof RUTAS)[keyof typeof RUTAS];
