import { z } from 'zod';

// ─────────────────────────────────────────
// ENUMS — PRODUCTOS
// ─────────────────────────────────────────
export const ProductUnitEnum = z.enum(['UNIT', 'KG', 'GRAM', 'LITER', 'METER', 'OTHER']);
export const CatalogSourceEnum = z.enum(['USER', 'OPEN_FOOD', 'COSMOS', 'PIPOS']);

// ─────────────────────────────────────────
// ENUMS — VENTAS
// ─────────────────────────────────────────
export const SaleStatusEnum = z.enum([
  'DRAFT',                // Borrador (carrito sin confirmar)
  'COMPLETED',            // Venta cobrada correctamente
  'PENDING_PAYMENT',      // Falta cobrar una parte
  'CREDITED',             // Fiado — quedó deuda asociada a cliente
  'PARTIALLY_RETURNED',   // Se devolvió parte de la venta
  'FULLY_RETURNED',       // Se devolvió toda la venta
  'CANCELLED',            // Venta cancelada por error
]);

export const SalePaymentStatusEnum = z.enum(['PAID', 'PARTIALLY_PAID', 'UNPAID']);

export const SaleItemStatusEnum = z.enum([
  'SOLD',                 // Vendido normalmente
  'PARTIALLY_RETURNED',   // Devuelto parcialmente
  'FULLY_RETURNED',       // Devuelto completamente
  'CANCELLED',            // Anulado
]);

// ─────────────────────────────────────────
// ENUMS — MÉTODOS DE PAGO
// ─────────────────────────────────────────
export const PaymentMethodEnum = z.enum([
  'CASH',           // Efectivo
  'TRANSFER',       // Transferencia bancaria
  'MERCADO_PAGO',   // Mercado Pago
  'QR',             // QR genérico
  'DEBIT',          // Tarjeta de débito
  'CREDIT',         // Tarjeta de crédito
  'OTHER',          // Otro
]);

// ─────────────────────────────────────────
// ENUMS — CAJA REGISTRADORA
// ─────────────────────────────────────────
export const CashRegisterStatusEnum = z.enum(['OPEN', 'CLOSED']);

export const CashMovementTypeEnum = z.enum([
  'OPENING',                  // Apertura de caja
  'SALE_CASH',                // Venta en efectivo
  'SALE_TRANSFER',            // Venta por transferencia
  'SALE_MERCADO_PAGO',        // Venta por Mercado Pago
  'SALE_DEBIT',               // Venta por débito
  'SALE_CREDIT',              // Venta por crédito
  'CHANGE',                   // Vuelto entregado
  'EXPENSE',                  // Gasto
  'SUPPLIER_PAYMENT',         // Pago a proveedor
  'RETURN_CASH',              // Devolución en efectivo
  'RETURN_TRANSFER',          // Devolución por transferencia
  'MANUAL_ADJUSTMENT',        // Ajuste manual
  'CLOSING',                  // Cierre de caja
]);

// ─────────────────────────────────────────
// ENUMS — DEVOLUCIONES
// ─────────────────────────────────────────
export const ReturnReasonEnum = z.enum([
  'DEFECTIVE',          // Producto fallado
  'WRONG_ENTRY',        // Error de carga
  'CUSTOMER_REGRET',    // Cliente se arrepintió
  'PRODUCT_EXCHANGE',   // Cambio de producto
  'EXPIRED',            // Producto vencido
  'OTHER',              // Otro
]);

export const ReturnRefundMethodEnum = z.enum([
  'CASH',               // Efectivo
  'TRANSFER',           // Transferencia
  'MERCADO_PAGO',       // Mercado Pago
  'BALANCE_CREDIT',     // Saldo a favor del cliente
  'NO_REFUND',          // No devolver dinero
]);

// ─────────────────────────────────────────
// ENUMS — GASTOS
// ─────────────────────────────────────────
export const ExpenseCategoryEnum = z.enum([
  'SUPPLIES',       // Insumos
  'SERVICES',       // Servicios
  'CLEANING',       // Limpieza
  'TRANSPORT',      // Transporte
  'OTHER',          // Otro
]);

// ─────────────────────────────────────────
// ESQUEMA BASE DE SINCRONIZACIÓN OFFLINE
// ─────────────────────────────────────────
// Toda entidad que viaje entre Tauri/Móvil y NestJS debe cumplir esto.
export const BaseSyncSchema = z.object({
  id: z.string().optional(), // Relajado a string simple para mock. Restaurar .cuid() al integrar backend.
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),

  // Campos críticos para la arquitectura Offline-First
  lastSyncedAt: z.date().nullable().optional(),
  isDeleted: z.boolean().default(false), // Reemplaza el 'active' por un isDeleted claro para sync
});