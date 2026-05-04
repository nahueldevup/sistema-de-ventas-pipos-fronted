import { z } from 'zod';

// ─────────────────────────────────────────
// ENUMS (Iguales a tu schema Prisma)
// ─────────────────────────────────────────
export const ProductUnitEnum = z.enum(['UNIT', 'KG', 'GRAM', 'LITER', 'METER', 'OTHER']);
export const CatalogSourceEnum = z.enum(['USER', 'OPEN_FOOD', 'COSMOS', 'PIPOS']);
export const SaleStatusEnum = z.enum(['COMPLETED', 'CANCELLED', 'RETURNED', 'PARTIALLY_RETURNED']);
export const SalePaymentStatusEnum = z.enum(['PAID', 'PARTIALLY_PAID', 'UNPAID']);

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