import { z } from 'zod';
import { BaseSyncSchema, ExpenseCategoryEnum, PaymentMethodEnum } from './base.schema';

// ─────────────────────────────────────────
// GASTO (Expense)
// Solo definición de schema — lógica para Fase 7
// ─────────────────────────────────────────
export const ExpenseSchema = BaseSyncSchema.extend({
  storeId: z.string().min(1),
  cashRegisterId: z.string().min(1),
  userId: z.string().min(1),

  description: z.string().min(1, 'La descripción es obligatoria').max(255),
  category: ExpenseCategoryEnum,
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  paymentMethod: PaymentMethodEnum,

  note: z.string().max(255).nullable().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// ─────────────────────────────────────────
// PAGO A PROVEEDOR (SupplierPayment)
// Solo definición de schema — lógica para Fase 7
// ─────────────────────────────────────────
export const SupplierPaymentSchema = BaseSyncSchema.extend({
  storeId: z.string().min(1),
  cashRegisterId: z.string().min(1),
  userId: z.string().min(1),
  supplierId: z.string().min(1),

  amount: z.coerce.number().min(0.01),
  paymentMethod: PaymentMethodEnum,

  note: z.string().max(255).nullable().optional(),
});

export type SupplierPayment = z.infer<typeof SupplierPaymentSchema>;
