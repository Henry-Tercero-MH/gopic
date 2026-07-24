# Café Aurora — Demo visual del POS

Demo **solo de interfaz** (datos de prueba, sin backend) para mostrar al cliente cómo se
vería el sistema de facturación de la cafetería. Si se aprueba, se continúa con backend,
base de datos, autenticación y el resto de los módulos.

## Cómo verla

```bash
npm install
npm run dev
```

Abrir http://localhost:5173

## Qué incluye esta demo

| Pantalla | Qué muestra |
|---|---|
| **Dashboard** | Ventas del día vs. ayer, ticket promedio, gráfico por hora, top de productos, alertas de stock |
| **Punto de venta** | Grid de productos por categoría, buscador, ticket lateral en vivo con cantidades, subtotal/IVA/total y cobro |
| **Mesas** | Mapa por zonas con estados (libre, ocupada, pidió cuenta, reservada) y total por mesa |
| **Cocina / Barra (KDS)** | Comandas en columnas por estado con semáforo de tiempo y notas |

Los módulos restantes (Inventario, Recetario, Reportes, Configuración) aparecen como
marcadores "pronto" para dar contexto del alcance total.

## Notas técnicas

- React 18 + Vite + TypeScript (`strict`), Tailwind sobre variables CSS.
- Todo el diseño vive en [`src/styles/tokens.css`](src/styles/tokens.css): cambiar un token
  reestiliza la app entera. Prueba el botón de tema (☀️/🌙) en la barra superior.
- Los datos son mock en [`src/mock/data.ts`](src/mock/data.ts); esa capa se reemplazará por
  la API real sin rehacer las pantallas.
- `npm run typecheck` pasa sin errores y sin `any`.
