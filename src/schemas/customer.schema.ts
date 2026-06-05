import { z } from 'zod';
import { BaseSyncSchema } from './base.schema';

// ─────────────────────────────────────────
// CLIENTE (Customer) — Schema mínimo para Fase 1
// ─────────────────────────────────────────
export const CustomerSchema = BaseSyncSchema.extend({
  storeId: z.string().min(1),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  phone: z.string().max(20).nullable().optional(),
  dni: z.string().max(15).nullable().optional(),
  email: z.string().email().nullable().optional(),

  // Saldo financiero
  currentDebt: z.coerce.number().min(0).default(0),     // Deuda pendiente
  balanceInFavor: z.coerce.number().min(0).default(0),   // Saldo a favor

  // Límite de crédito (fiado máximo permitido)
  creditLimit: z.coerce.number().min(0).nullable().optional(),

  note: z.string().max(255).nullable().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
