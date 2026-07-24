import { Card } from '@/components/ui/Card';

export function PlaceholderPage({ titulo }: { titulo: string }) {
  return (
    <div className="p-6">
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="text-4xl" aria-hidden>🚧</div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">{titulo}</h1>
        <p className="mt-2 text-sm text-text-muted">
          Módulo incluido en el alcance del sistema. En esta demo visual se muestran primero
          las pantallas de mayor impacto: Dashboard, Punto de venta, Mesas y Cocina/Barra.
        </p>
        <p className="mt-4 text-sm text-text-muted">
          Al aprobar el proyecto, este módulo se construye completo con datos reales.
        </p>
      </Card>
    </div>
  );
}
