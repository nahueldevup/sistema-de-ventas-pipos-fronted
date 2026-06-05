import { formatearPesos } from './productoUtils';

// Re-exportar formatearPesos para que ventas no dependa directamente de productoUtils
export { formatearPesos };

/**
 * Genera un número de venta secuencial basado en las ventas del día.
 * Formato: YYYYMMDD-NNN (ej: 20260506-001)
 */
export function generarNumeroVenta(ventasHoy: number): string {
  const hoy = new Date();
  const fecha = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('');
  const secuencial = String(ventasHoy + 1).padStart(3, '0');
  return `${fecha}-${secuencial}`;
}

/**
 * Etiqueta legible para métodos de pago.
 */
const METODO_PAGO_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  MERCADO_PAGO: 'Mercado Pago',
  QR: 'QR',
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
  OTHER: 'Otro',
};

export function getMetodoPagoLabel(method: string): string {
  return METODO_PAGO_LABELS[method] || method;
}

/**
 * Etiqueta y color para estados de venta.
 */
const ESTADO_VENTA_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400' },
  COMPLETED: { label: 'Completada', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
  PENDING_PAYMENT: { label: 'Pendiente', color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
  CREDITED: { label: 'Fiado', color: 'text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' },
  PARTIALLY_RETURNED: { label: 'Dev. parcial', color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
  FULLY_RETURNED: { label: 'Devuelta', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400' },
  CANCELLED: { label: 'Anulada', color: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400' },
};

export function getEstadoVenta(status: string) {
  return ESTADO_VENTA_MAP[status] || { label: status, color: 'text-slate-500 bg-slate-100' };
}
