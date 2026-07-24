import type { ReactNode } from 'react';
import { Store, Receipt, Printer, Users, Save, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        defaultValue={value}
        className="mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
    </label>
  );
}

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-700">
          <Icon size={20} />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-text">{title}</h2>
          <p className="text-sm text-text-muted">{desc}</p>
        </div>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </Card>
  );
}

export function ConfigPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Configuración"
        subtitle="Datos del negocio, fiscales e impresión"
        actions={
          <Button>
            <Save size={18} /> Guardar cambios
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={Store} title="Datos del negocio" desc="Información general de la sucursal">
          <Field label="Nombre comercial" value="GOPIC — Preparaciones con sabor" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Teléfono" value="+502 5555 1234" />
            <Field label="Moneda" value="GTQ (Q)" />
          </div>
          <Field label="Dirección" value="Zona 10, Ciudad de Guatemala" />
        </SectionCard>

        <SectionCard icon={Receipt} title="Fiscal (FEL)" desc="Facturación electrónica en línea">
          <div className="grid grid-cols-2 gap-3">
            <Field label="NIT" value="1234567-8" />
            <Field label="IVA aplicado" value="12%" hint="Guatemala" />
          </div>
          <Field label="Serie de folios" value="A · consecutivo con bloqueo" />
        </SectionCard>

        <SectionCard icon={Printer} title="Impresoras" desc="Ticket y comandas por estación">
          <Field label="Impresora de tickets" value="Epson TM-T20 (mostrador)" />
          <Field label="Impresora de cocina" value="Star TSP143 (cocina)" />
          <Field label="Impresora de barra" value="Epson TM-T20 (barra)" />
        </SectionCard>

        <SectionCard icon={Users} title="Roles y personal" desc="Perfiles con permisos granulares">
          <div className="space-y-2">
            {[
              { rol: 'Administrador', permisos: 'Todos los permisos' },
              { rol: 'Cajero', permisos: 'Cobrar, abrir/cerrar caja' },
              { rol: 'Mesero', permisos: 'Comandas, mesas, dividir cuenta' },
              { rol: 'Barista', permisos: 'KDS: ver y marcar preparado' },
              { rol: 'Almacenista', permisos: 'Inventario, mermas, conteos' },
            ].map((r) => (
              <div key={r.rol} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2">
                <span className="text-sm font-medium text-text">{r.rol}</span>
                <span className="text-xs text-text-muted">{r.permisos}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
