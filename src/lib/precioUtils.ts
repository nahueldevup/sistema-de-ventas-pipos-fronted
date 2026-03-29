/**
 * Calcula el precio de venta sugerido basado en un precio de compra y un margen de ganancia.
 * Opcionalmente aplica redondeo comercial hacia arriba al múltiplo especificado.
 * 
 * @param compra - El precio de compra del producto.
 * @param porcentajeGanancia - El porcentaje de utilidad deseado (ej. 40).
 * @param redondeoActivo - Si se debe aplicar redondeo (default: true).
 * @param redondeoMultiplo - El múltiplo al que redondear (default: 10).
 * @returns El precio de venta, opcionalmente redondeado.
 */
export function calcularPrecioVenta(
  compra: number | string,
  porcentajeGanancia: number | string,
  redondeoActivo: boolean = true,
  redondeoMultiplo: number = 10
): number {
  const c = typeof compra === 'string' ? parseFloat(compra) : compra;
  const p = typeof porcentajeGanancia === 'string' ? parseFloat(porcentajeGanancia) : porcentajeGanancia;

  if (isNaN(c) || isNaN(p) || c <= 0) return 0;

  // Fórmula: Venta = Compra * (1 + Ganancia / 100)
  const precioSugerido = c * (1 + p / 100);

  // Redondeo comercial: hacia arriba al múltiplo especificado
  if (redondeoActivo && redondeoMultiplo > 0) {
    return Math.ceil(precioSugerido / redondeoMultiplo) * redondeoMultiplo;
  }

  // Sin redondeo: devolver con 2 decimales
  return Math.round(precioSugerido * 100) / 100;
}

/**
 * Calcula la utilidad neta en pesos.
 */
export function calcularUtilidad(venta: number | string, compra: number | string): number {
  const v = typeof venta === 'string' ? parseFloat(venta) : venta;
  const c = typeof compra === 'string' ? parseFloat(compra) : compra;

  if (isNaN(v) || isNaN(c)) return 0;
  return v - c;
}
