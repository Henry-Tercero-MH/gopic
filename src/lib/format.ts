/** Formateadores de presentación para la demo (moneda GTQ por defecto). */

const currencyFmt = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFmt.format(value);
}

const timeFmt = new Intl.DateTimeFormat('es-GT', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatTime(date: Date): string {
  return timeFmt.format(date);
}

/** Minutos transcurridos desde una fecha, para semáforos de KDS. */
export function minutesSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60000);
}
