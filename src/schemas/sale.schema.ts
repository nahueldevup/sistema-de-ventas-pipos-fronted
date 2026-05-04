import { z } from 'zod';
import { BaseSyncSchema, SaleStatusEnum, SalePaymentStatusEnum } from './base.schema';
// ─────────────────────────────────────────
// DETALLE DE VENTA (SaleItem)
// ─────────────────────────────────────────
export const SaleItemSchema = BaseSyncSchema.extend({
  saleId: z.string().cuid().optional(), // Se asigna al guardar la venta
  productId: z.string().cuid('El ID del producto es obligatorio'),
  
  // Snapshots históricos: se guardan para que si el producto cambia mañana, el ticket siga igual
  productName: z.string(),
  productBarcode: z.string().nullable().optional(),
  
  unitPrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0.001, 'La cantidad debe ser mayor a 0'), // Permite 0.250kg
  discountAmount: z.coerce.number().min(0).default(0),
  subtotal: z.coerce.number().min(0),
});

export type SaleItem = z.infer<typeof SaleItemSchema>;

// ─────────────────────────────────────────
// CABECERA DE VENTA (Sale)
// ─────────────────────────────────────────
export const SaleSchema = BaseSyncSchema.extend({
  storeId: z.string().cuid(),
  cashRegisterId: z.string().cuid('La venta debe pertenecer a una caja abierta'),
  userId: z.string().cuid('Se requiere el ID del cajero'),
  customerId: z.string().cuid().nullable().optional(), // Nullable porque puede ser "Consumidor Final"
  
  status: SaleStatusEnum.default('COMPLETED'),
  paymentStatus: SalePaymentStatusEnum.default('PAID'),
  
  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
  totalPaid: z.coerce.number().min(0),
  change: z.coerce.number().min(0).default(0),
  pendingAmount: z.coerce.number().min(0).default(0), // Para el cálculo de fiados
  
  note: z.string().max(255).nullable().optional(),
  
  // Array de items que componen la venta
  items: z.array(SaleItemSchema).min(1, 'La venta debe tener al menos un producto'),
}).refine((data) => {
  // Validación estricta: Si el estado de pago es PAID, el total pagado debe ser mayor o igual al total
  if (data.paymentStatus === 'PAID') {
    return data.totalPaid >= data.total;
  }
  return true;
}, {
  message: "El monto pagado no cubre el total de la venta",
  path: ["totalPaid"],
});

export type Sale = z.infer<typeof SaleSchema>;