import { z } from 'zod';
import {
  BaseSyncSchema,
  SaleStatusEnum,
  SalePaymentStatusEnum,
  SaleItemStatusEnum,
  PaymentMethodEnum,
} from './base.schema';

// ─────────────────────────────────────────
// DETALLE DE VENTA (SaleItem)
// ─────────────────────────────────────────
export const SaleItemSchema = BaseSyncSchema.extend({
  saleId: z.string().optional(), // Se asigna al guardar la venta
  productId: z.string().min(1, 'El ID del producto es obligatorio'),

  // Snapshots históricos: se guardan para que si el producto cambia mañana, el ticket siga igual
  productName: z.string(),
  productBarcode: z.string().nullable().optional(),
  productImage: z.string().nullable().optional(),

  unitPrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0.001, 'La cantidad debe ser mayor a 0'), // Permite 0.250kg
  quantityReturned: z.coerce.number().min(0).default(0), // Cantidad ya devuelta
  discountAmount: z.coerce.number().min(0).default(0),
  subtotal: z.coerce.number().min(0),

  status: SaleItemStatusEnum.default('SOLD'),
  isCredited: z.boolean().default(false), // Fiado por producto específico
});

export type SaleItem = z.infer<typeof SaleItemSchema>;

// ─────────────────────────────────────────
// PAGO DE VENTA (SalePayment)
// ─────────────────────────────────────────
// Permite pagos combinados (parte efectivo, parte transferencia, etc.)
export const SalePaymentSchema = BaseSyncSchema.extend({
  saleId: z.string().optional(),
  method: PaymentMethodEnum,
  amount: z.coerce.number().min(0),
  reference: z.string().nullable().optional(), // Referencia de transferencia, nro de operación, etc.
});

export type SalePayment = z.infer<typeof SalePaymentSchema>;

// ─────────────────────────────────────────
// CABECERA DE VENTA (Sale)
// ─────────────────────────────────────────
export const SaleSchema = BaseSyncSchema.extend({
  storeId: z.string().min(1),
  cashRegisterId: z.string().min(1, 'La venta debe pertenecer a una caja abierta'),
  userId: z.string().min(1, 'Se requiere el ID del cajero'),
  customerId: z.string().nullable().optional(), // Nullable porque puede ser "Consumidor Final"

  saleNumber: z.number().int().positive().optional(), // Número secuencial de venta

  status: SaleStatusEnum.default('COMPLETED'),
  paymentStatus: SalePaymentStatusEnum.default('PAID'),

  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
  totalPaid: z.coerce.number().min(0),
  change: z.coerce.number().min(0).default(0),
  pendingAmount: z.coerce.number().min(0).default(0), // Para el cálculo de fiados

  note: z.string().max(255).nullable().optional(),

  // Motivo de anulación (obligatorio si status === 'CANCELLED')
  cancellationReason: z.string().nullable().optional(),
  cancelledBy: z.string().nullable().optional(),
  cancelledAt: z.date().nullable().optional(),

  // Array de items que componen la venta
  items: z.array(SaleItemSchema).min(1, 'La venta debe tener al menos un producto'),

  // Array de pagos (soporta pagos combinados)
  payments: z.array(SalePaymentSchema).min(1, 'La venta debe tener al menos un pago'),
}).refine((data) => {
  // Validación: Si el estado de pago es PAID, el total pagado debe cubrir el total
  if (data.paymentStatus === 'PAID') {
    return data.totalPaid >= data.total;
  }
  return true;
}, {
  message: "El monto pagado no cubre el total de la venta",
  path: ["totalPaid"],
});

export type Sale = z.infer<typeof SaleSchema>;