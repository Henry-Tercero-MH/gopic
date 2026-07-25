/**
 * Exportación de datos a archivos descargables (CSV) para los reportes.
 * Genera el archivo en el navegador y dispara la descarga; sin dependencias.
 */

/** Escapa un valor para CSV (comillas y separadores). */
function celda(valor: string | number): string {
  const s = String(valor);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Descarga una tabla como CSV.
 * @param nombreArchivo sin extensión (se añade .csv)
 * @param columnas encabezados
 * @param filas matriz de valores en el mismo orden que las columnas
 */
export function exportarCSV(
  nombreArchivo: string,
  columnas: string[],
  filas: (string | number)[][],
): void {
  const lineas = [columnas, ...filas].map((fila) => fila.map(celda).join(';'));
  // BOM para que Excel abra los acentos correctamente.
  const contenido = '﻿' + lineas.join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombreArchivo}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
