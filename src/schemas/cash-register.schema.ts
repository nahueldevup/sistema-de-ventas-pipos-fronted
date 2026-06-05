import { z } from 'zod';
import { BaseSyncSchema, CashRegisterStatusEnum, CashMovementTypeEnum, PaymentMethodEnum } from './base.schema';

// ─────────────────────────────────────────
// CAJA REGISTRADORA (CashRegister)
// ─────────────────────────────────────────
export const CashRegisterSchema = BaseSyncSchema.extend({
  storeId: z.string().min(1),
  userId: z.string().min(1, 'Se requiere el ID del cajero'),

  status: CashRegisterStatusEnum.default('OPEN'),

  openedAt: z.date(),
  closedAt: z.date().nullable().optional(),

  initialAmount: z.coerce.number().min(0).default(0), // Fondo inicial
  expectedAmount: z.coerce.number().min(0).default(0), // Calculado por el sistema
  countedAmount: z.coerce.number().nullable().optional(), // Lo que contó el cajero
  difference: z.coerce.number().nullable().optional(), // Diferencia (contado - esperado)

  noteOpen: z.string().max(255).nullable().optional(),
  noteClose: z.string().max(255).nullable().optional(),
});

export type CashRegister = z.infer<typeof CashRegisterSchema>;

// ─────────────────────────────────────────
// MOVIMIENTO DE CAJA (CashMovement)
// ─────────────────────────────────────────
export const CashMovementSchema = BaseSyncSchema.extend({
  cashRegisterId: z.string().min(1),
  userId: z.string().min(1),

  type: CashMovementTypeEnum,
  amount: z.coerce.number(), // Puede ser negativo (salidas)
  paymentMethod: PaymentMethodEnum.nullable().optional(),

  // Referencia a la entidad que originó el movimiento
  referenceId: z.string().nullable().optional(), // saleId, expenseId, etc.
  referenceType: z.string().nullable().optional(), // 'sale', 'expense', 'return', etc.

  note: z.string().max(255).nullable().optional(),
});

export type CashMovement = z.infer<typeof CashMovementSchema>;
