/**
 * Representa un ítem dentro del carrito de ventas.
 * Se construye a partir de un Product al momento de agregarlo al carrito.
 */
export interface CarritoItem {
  productId: string;
  productName: string;
  productBarcode: string | null;
  productImage: string | null;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discountAmount: number;
  /** Para validación visual de stock disponible */
  maxStock: number;
  /** true = este ítem va a cuenta corriente del cliente (fiado) */
  fiado: boolean;
}

/** Estado completo del carrito */
export interface CarritoState {
  items: CarritoItem[];
  descuentoGlobal: number;
  nota: string;
}
