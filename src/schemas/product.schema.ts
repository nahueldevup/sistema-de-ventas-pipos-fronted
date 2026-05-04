import { z } from 'zod';
import { BaseSyncSchema, ProductUnitEnum } from './base.schema';

// ─────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────

export const ProductSchema = BaseSyncSchema.extend({
  storeId: z.string().cuid('El ID de la sucursal es obligatorio'),
  catalogProductId: z.string().cuid().nullable().optional(),
  
  barcode: z.string().max(50, 'El código de barras es muy largo').nullable().optional(),
  sku: z.string().max(50).nullable().optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  image: z.string().url('Debe ser una URL válida').nullable().optional(),
  categoryId: z.string().nullable().optional(), // Relajado a string. Restaurar .cuid() al integrar backend.
  supplierId: z.string().nullable().optional(), // Relajado a string. Restaurar .cuid() al integrar backend.
  
  // Uso de coerce para formularios: convierte "1500.50" (string) a 1500.50 (number)
  costPrice: z.coerce.number().min(0, 'El costo no puede ser negativo'),
  salePrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  profitMargin: z.coerce.number().min(0),
  
  unit: ProductUnitEnum.default('UNIT'),
  allowDecimalQuantity: z.boolean().default(false),
  
  stock: z.coerce.number().default(0),
  minStock: z.coerce.number().min(0).default(5),
}).refine((data) => data.salePrice >= data.costPrice, {
  message: "El precio de venta debe ser mayor o igual al precio de costo",
  path: ["salePrice"], // El error se mostrará en el input de salePrice
});

// Inferir el tipo de TypeScript a partir del esquema Zod
export type Product = z.infer<typeof ProductSchema>;

/** Producto persistido con id garantizado (viene del servicio, no del formulario) */
export type PersistedProduct = Product & { id: string };