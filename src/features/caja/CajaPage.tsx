import { useState, type ReactNode } from 'react';
import {
  Wallet,
  Banknote,
  CreditCard,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Plus,
  X,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { useOperacion } from '@/lib/operacion';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

type TipoMov = 'Apertura' | 'Venta' | 'Ingreso' | 'Retiro';
type Metodo = 'Efectivo' | 'Tarjeta';

interface Movimiento {
  id: string;
  hora: string;
  tipo: TipoMov;
  concepto: string;
  metodo?: Metodo;
  monto: number;
}

// Movimientos manuales de ejemplo del turno (la apertura y las ventas vienen del store).
const MOVS_MANUALES_SEED: Movimiento[] = [
  { id: 'mv-5', hora: '10:50', tipo: 'Retiro', concepto: 'Compra de servilletas', monto: 40 },
];

const tipoTone: Record<TipoMov, 'brand' | 'success' | 'info' | 'warning'> = {
  Apertura: 'brand',
  Venta: 'success',
  Ingreso: 'info',
  Retiro: 'warning',
};

const horaActual = () =>
  new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

export function CajaPage() {
  const [movsManuales, setMovsManuales] = useState<Movimiento[]>(MOVS_MANUALES_SEED);
  const [modalMov, setModalMov] = useState(false);
  const [modalCorte, setModalCorte] = useState(false);
  const [modalApertura, setModalApertura] = useState(false);
  const toast = useToast();
  const { ventas, cajaAbierta, fondoCaja, cajero, abrirCaja, cerrarCaja } = useOperacion();

  // El fondo de apertura viene del store (definido al abrir la caja).
  const aperturaMov: Movimiento = {
    id: 'apertura', hora: '08:00', tipo: 'Apertura', concepto: 'Fondo de caja', monto: fondoCaja,
  };

  // Las ventas cobradas en el POS entran a la caja como movimientos "Venta".
  const ventasComoMov: Movimiento[] = ventas.map((v) => ({
    id: v.id,
    hora: v.hora,
    tipo: 'Venta',
    concepto: `Ticket ${v.folio}${v.tipoVenta === 'mesa' ? '' : v.tipoVenta === 'llevar' ? ' · Para llevar' : ' · Mostrador'}`,
    metodo: v.metodo === 'efectivo' ? 'Efectivo' : 'Tarjeta',
    monto: v.total,
  }));

  // Movimientos del turno: apertura + manuales + ventas del POS, ordenados por hora.
  const movs = cajaAbierta
    ? [aperturaMov, ...movsManuales, ...ventasComoMov].sort((a, b) => a.hora.localeCompare(b.hora))
    : [];

  const fondo = fondoCaja;
  const ventasEfectivo = movs.filter((m) => m.tipo === 'Venta' && m.metodo === 'Efectivo').reduce((s, m) => s + m.monto, 0);
  const ventasTarjeta = movs.filter((m) => m.tipo === 'Venta' && m.metodo === 'Tarjeta').reduce((s, m) => s + m.monto, 0);
  const ingresos = movs.filter((m) => m.tipo === 'Ingreso').reduce((s, m) => s + m.monto, 0);
  const retiros = movs.filter((m) => m.tipo === 'Retiro').reduce((s, m) => s + m.monto, 0);
  const totalVentas = ventasEfectivo + ventasTarjeta;
  const efectivoEsperado = fondo + ventasEfectivo + ingresos - retiros;

  function agregarMov(tipo: 'Ingreso' | 'Retiro', concepto: string, monto: number) {
    setMovsManuales((prev) => [...prev, { id: `mv-${Date.now()}`, hora: horaActual(), tipo, concepto, monto }]);
    setModalMov(false);
    toast.exito(`${tipo} de ${formatCurrency(monto)} registrado.`);
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Caja"
        subtitle="Apertura, movimientos y corte del turno"
        actions={
          cajaAbierta ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setModalMov(true)}>
                <Plus size={18} /> Movimiento
              </Button>
              <Button onClick={() => setModalCorte(true)}>
                <Lock size={18} /> Cerrar caja
              </Button>
            </div>
          ) : (
            <Button onClick={() => setModalApertura(true)}>
              <Wallet size={18} /> Abrir caja
            </Button>
          )
        }
      />

      {/* Estado de la caja */}
      <div className={cn('flex items-center gap-3 rounded-lg border p-4', cajaAbierta ? 'border-success/30 bg-success/5' : 'border-border bg-surface-alt')}>
        <span className={cn('grid h-10 w-10 place-items-center rounded-full', cajaAbierta ? 'bg-success/15 text-success' : 'bg-surface-sunk text-text-muted')}>
          <Wallet size={20} />
        </span>
        <div className="flex-1">
          <p className="font-medium text-text">{cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}</p>
          <p className="text-sm text-text-muted">
            {cajaAbierta ? `Cajero: ${cajero} · Fondo inicial ${formatCurrency(fondo)}` : 'Abre la caja para iniciar el turno.'}
          </p>
        </div>
        {cajaAbierta && <Badge tone="success">En turno</Badge>}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={TrendingUp} label="Ventas del turno" valor={formatCurrency(totalVentas)} tono="brand" />
        <Kpi icon={Banknote} label="Ventas en efectivo" valor={formatCurrency(ventasEfectivo)} tono="success" />
        <Kpi icon={CreditCard} label="Ventas con tarjeta" valor={formatCurrency(ventasTarjeta)} tono="info" />
        <Kpi icon={Wallet} label="Efectivo esperado en caja" valor={formatCurrency(efectivoEsperado)} tono="accent" />
      </div>

      {/* Movimientos */}
      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold text-text">Movimientos del turno</h2>
          <p className="text-sm text-text-muted">{movs.length} movimientos</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-2.5 font-semibold">Hora</th>
                <th className="px-4 py-2.5 font-semibold">Tipo</th>
                <th className="px-4 py-2.5 font-semibold">Concepto</th>
                <th className="px-4 py-2.5 font-semibold">Método</th>
                <th className="px-4 py-2.5 text-right font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody>
              {movs.map((m) => {
                const negativo = m.tipo === 'Retiro';
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                    <td className="num px-4 py-3 text-text-muted">{m.hora}</td>
                    <td className="px-4 py-3"><Badge tone={tipoTone[m.tipo]}>{m.tipo}</Badge></td>
                    <td className="px-4 py-3 text-text">{m.concepto}</td>
                    <td className="px-4 py-3 text-text-muted">{m.metodo ?? '—'}</td>
                    <td className={cn('num px-4 py-3 text-right font-semibold', negativo ? 'text-danger' : 'text-text')}>
                      {negativo ? '−' : ''}{formatCurrency(m.monto)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {modalMov && <MovimientoModal onCerrar={() => setModalMov(false)} onAgregar={agregarMov} />}
      {modalCorte && (
        <CorteModal
          fondo={fondo}
          ventasEfectivo={ventasEfectivo}
          ventasTarjeta={ventasTarjeta}
          ingresos={ingresos}
          retiros={retiros}
          efectivoEsperado={efectivoEsperado}
          onCerrar={() => setModalCorte(false)}
          onConfirmar={() => {
            cerrarCaja();
            setMovsManuales([]);
            setModalCorte(false);
            toast.exito('Corte de caja realizado. Turno cerrado.');
          }}
        />
      )}
      {modalApertura && (
        <AperturaModal
          cajeroSugerido={cajero}
          onCerrar={() => setModalApertura(false)}
          onAbrir={(fondoInicial, nombreCajero) => {
            abrirCaja(fondoInicial, nombreCajero);
            setMovsManuales([]);
            setModalApertura(false);
            toast.exito(`Caja abierta con fondo de ${formatCurrency(fondoInicial)}.`);
          }}
        />
      )}
    </div>
  );
}

function AperturaModal({
  cajeroSugerido,
  onCerrar,
  onAbrir,
}: {
  cajeroSugerido: string;
  onCerrar: () => void;
  onAbrir: (fondo: number, cajero: string) => void;
}) {
  const [fondo, setFondo] = useState('500');
  const [cajero, setCajero] = useState(cajeroSugerido);
  const fondoNum = parseFloat(fondo) || 0;
  const valido = fondoNum >= 0 && cajero.trim() !== '';

  return (
    <ModalShell titulo="Abrir caja" onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <p className="text-sm text-text-muted">
          Indica el efectivo con el que inicia el turno. Este fondo se usará como base para el arqueo al cerrar.
        </p>
        <label className="block">
          <span className="text-sm font-medium text-text">Cajero responsable</span>
          <input value={cajero} onChange={(e) => setCajero(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Fondo de apertura (Q)</span>
          <input type="number" min={0} step="0.01" value={fondo} onChange={(e) => setFondo(e.target.value)} autoFocus className={cn(inputCls, 'num')} />
        </label>
        <div className="flex flex-wrap gap-2">
          {[300, 500, 1000].map((m) => (
            <button
              key={m}
              onClick={() => setFondo(String(m))}
              className="num rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-sunk"
            >
              {formatCurrency(m)}
            </button>
          ))}
        </div>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={() => onAbrir(fondoNum, cajero.trim())}>
          <Wallet size={18} /> Abrir caja
        </Button>
      </footer>
    </ModalShell>
  );
}

function Kpi({ icon: Icon, label, valor, tono }: { icon: LucideIcon; label: string; valor: string; tono: 'brand' | 'success' | 'info' | 'accent' }) {
  const tonos: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-success/15 text-success',
    info: 'bg-info/12 text-info',
    accent: 'bg-accent-400/25 text-accent-600',
  };
  return (
    <Card className="p-4">
      <span className={cn('grid h-9 w-9 place-items-center rounded-md', tonos[tono])}>
        <Icon size={18} />
      </span>
      <p className="mt-3 text-sm text-text-muted">{label}</p>
      <p className="num mt-0.5 text-2xl font-semibold text-text">{valor}</p>
    </Card>
  );
}

function MovimientoModal({ onCerrar, onAgregar }: { onCerrar: () => void; onAgregar: (t: 'Ingreso' | 'Retiro', c: string, m: number) => void }) {
  const [tipo, setTipo] = useState<'Ingreso' | 'Retiro'>('Retiro');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const valido = concepto.trim() !== '' && parseFloat(monto) > 0;

  return (
    <ModalShell titulo="Registrar movimiento" onCerrar={onCerrar}>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <TipoBtn activo={tipo === 'Ingreso'} icon={ArrowDownCircle} label="Ingreso" onClick={() => setTipo('Ingreso')} />
          <TipoBtn activo={tipo === 'Retiro'} icon={ArrowUpCircle} label="Retiro" onClick={() => setTipo('Retiro')} />
        </div>
        <label className="block">
          <span className="text-sm font-medium text-text">Concepto</span>
          <input value={concepto} onChange={(e) => setConcepto(e.target.value)} autoFocus className={inputCls} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text">Monto (Q)</span>
          <input type="number" min={0} step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} className={cn(inputCls, 'num')} />
        </label>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={() => onAgregar(tipo, concepto.trim(), parseFloat(monto))}>
          <Check size={18} /> Registrar
        </Button>
      </footer>
    </ModalShell>
  );
}

function CorteModal({
  fondo,
  ventasEfectivo,
  ventasTarjeta,
  ingresos,
  retiros,
  efectivoEsperado,
  onCerrar,
  onConfirmar,
}: {
  fondo: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ingresos: number;
  retiros: number;
  efectivoEsperado: number;
  onCerrar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <ModalShell titulo="Corte de caja" onCerrar={onCerrar}>
      <div className="space-y-1.5 p-4 text-sm">
        <Linea label="Fondo inicial" valor={fondo} />
        <Linea label="Ventas en efectivo" valor={ventasEfectivo} />
        <Linea label="Otros ingresos" valor={ingresos} />
        <Linea label="Retiros" valor={-retiros} />
        <div className="my-2 border-t border-border" />
        <Linea label="Efectivo esperado en caja" valor={efectivoEsperado} fuerte />
        <Linea label="Ventas con tarjeta" valor={ventasTarjeta} />
      </div>
      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button onClick={onConfirmar}>
          <Lock size={18} /> Confirmar corte
        </Button>
      </footer>
    </ModalShell>
  );
}

function Linea({ label, valor, fuerte }: { label: string; valor: number; fuerte?: boolean }) {
  return (
    <div className={cn('flex justify-between', fuerte ? 'text-base font-semibold text-text' : 'text-text-muted')}>
      <span>{label}</span>
      <span className="num">{valor < 0 ? '−' : ''}{formatCurrency(Math.abs(valor))}</span>
    </div>
  );
}

function TipoBtn({ activo, icon: Icon, label, onClick }: { activo: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-semibold transition-colors',
        activo ? 'border-action-500 bg-action-50 text-action-700' : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
      )}
    >
      <Icon size={22} />
      {label}
    </button>
  );
}

const inputCls =
  'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

function ModalShell({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  return (
    <Modal onClose={onCerrar} ariaLabel={titulo} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{titulo}</h3>
        <button onClick={onCerrar} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk">
          <X size={18} />
        </button>
      </header>
      {children}
    </Modal>
  );
}
