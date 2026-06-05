import { z } from 'zod';
import { BaseSyncSchema, ReturnReasonEnum, ReturnRefundMethodEnum } from './base.schema';

// ─────────────────────────────────────────
// DEVOLUCIÓN DE VENTA (SaleReturn)
// Solo definición de schema — lógica para Fase 6
// ─────────────────────────────────────────
export const SaleReturnSchema = BaseSyncSchema.extend({
  storeId: z.string().min(1),
  saleId: z.string().min(1),
  cashRegisterId: z.string().min(1),
  userId: z.string().min(1),

  reason: ReturnReasonEnum,
  refundMethod: ReturnRefundMethodEnum,
  totalRefunded: z.coerce.number().min(0),

  note: z.string().max(255).nullable().optional(),

  items: z.array(z.lazy(() => SaleReturnItemSchema)).min(1, 'Debe seleccionar al menos un producto'),
});

export type SaleReturn = z.infer<typeof SaleReturnSchema>;

// ─────────────────────────────────────────
// ITEM DE DEVOLUCIÓN (SaleReturnItem)
// Solo definición de schema — lógica para Fase 6
// ─────────────────────────────────────────
export const SaleReturnItemSchema = BaseSyncSchema.extend({
  saleReturnId: z.string().optional(),
  saleItemId: z.string().min(1),
  productId: z.string().min(1),

  // Snapshots para el ticket de devolución
  productName: z.string(),
  unitPrice: z.coerce.number().min(0),

  quantityReturned: z.coerce.number().min(0.001),
  subtotalRefunded: z.coerce.number().min(0),

  returnsToStock: z.boolean().default(true), // ¿Vuelve al inventario?
});

export type SaleReturnItem = z.infer<typeof SaleReturnItemSchema>;
