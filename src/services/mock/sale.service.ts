import type { Sale } from '../../schemas/sale.schema';
import { ProductService } from './product.service';
import { CashRegisterService } from './cash-register.service';
import { generateId } from '../../lib/utils';

// Mapeo de método de pago a tipo de movimiento de caja
const PAYMENT_TO_MOVEMENT: Record<string, string> = {
  CASH: 'SALE_CASH',
  TRANSFER: 'SALE_TRANSFER',
  MERCADO_PAGO: 'SALE_MERCADO_PAGO',
  QR: 'SALE_MERCADO_PAGO', // QR se agrupa con Mercado Pago
  DEBIT: 'SALE_DEBIT',
  CREDIT: 'SALE_CREDIT',
};

export class SaleService {
  private static STORAGE_KEY = 'pipos_mock_sales';

  private static delay<T>(data: T, ms = 300): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms));
  }

  private static getStorage(): Sale[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      this.setStorage([]);
      return [];
    } catch (error) {
      console.error('Error al leer ventas de localStorage:', error);
      return [];
    }
  }

  private static setStorage(data: Sale[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error al escribir ventas en localStorage:', error);
    }
  }

  /** Obtener el próximo número de venta del día */
  private static getNextSaleNumber(): number {
    const sales = this.getStorage();
    const today = new Date().toDateString();
    const todaySales = sales.filter(
      (s) => new Date(s.createdAt || 0).toDateString() === today && !s.isDeleted
    );
    return todaySales.length + 1;
  }

  static async getAll(): Promise<Sale[]> {
    const sales = this.getStorage();
    return await this.delay(sales.filter((s) => !s.isDeleted));
  }

  static async getById(id: string): Promise<Sale | null> {
    const sales = this.getStorage();
    return await this.delay(sales.find((s) => s.id === id) || null);
  }

  static async getTodaySales(): Promise<Sale[]> {
    const sales = this.getStorage();
    const today = new Date().toDateString();
    const todaySales = sales.filter(
      (s) => new Date(s.createdAt || 0).toDateString() === today && !s.isDeleted
    );
    return await this.delay(todaySales);
  }

  /**
   * Crea una venta, descuenta stock y registra movimientos de caja.
   */
  static async create(
    data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt' | 'saleNumber'>
  ): Promise<Sale> {
    // Validar que existe una caja abierta
    const cajaAbierta = await CashRegisterService.getOpen();
    if (!cajaAbierta) {
      throw new Error('No hay caja abierta. Abrí una caja antes de vender.');
    }
    if (cajaAbierta.id !== data.cashRegisterId) {
      throw new Error('El ID de caja no corresponde a la caja abierta actual.');
    }

    const saleNumber = this.getNextSaleNumber();

    const newSale: Sale = {
      ...data,
      id: generateId(),
      saleNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Guardar la venta
    const sales = this.getStorage();
    sales.push(newSale);
    this.setStorage(sales);

    // Descontar stock de cada producto
    for (const item of newSale.items) {
      try {
        const product = await ProductService.getById(item.productId);
        if (product) {
          await ProductService.update(item.productId, {
            stock: Math.max(0, product.stock - item.quantity),
          });
        }
      } catch (error) {
        console.error(`Error al descontar stock del producto ${item.productId}:`, error);
      }
    }

    // Registrar movimientos de caja por cada pago
    for (const payment of newSale.payments) {
      const movementType = PAYMENT_TO_MOVEMENT[payment.method] || 'SALE_CASH';
      await CashRegisterService.addMovement({
        cashRegisterId: data.cashRegisterId,
        userId: data.userId,
        type: movementType as 'SALE_CASH',
        amount: payment.amount > newSale.total ? newSale.total : payment.amount,
        paymentMethod: payment.method,
        referenceId: newSale.id,
        referenceType: 'sale',
        note: null,
        isDeleted: false,
      });
    }

    // Si hay vuelto, registrar movimiento CHANGE (solo aplica a efectivo)
    if (newSale.change > 0) {
      await CashRegisterService.addMovement({
        cashRegisterId: data.cashRegisterId,
        userId: data.userId,
        type: 'CHANGE',
        amount: -newSale.change, // Negativo porque sale de la caja
        paymentMethod: 'CASH',
        referenceId: newSale.id,
        referenceType: 'sale',
        note: null,
        isDeleted: false,
      });
    }

    return await this.delay(newSale);
  }

  /**
   * Cancela una venta y devuelve el stock.
   * Requiere motivo obligatorio.
   */
  static async cancel(id: string, reason: string, cancelledBy: string): Promise<void> {
    const sales = this.getStorage();
    const index = sales.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Venta con ID ${id} no encontrada.`);
    }

    const sale = sales[index];

    // Devolver stock de cada producto
    for (const item of sale.items) {
      try {
        const product = await ProductService.getById(item.productId);
        if (product) {
          await ProductService.update(item.productId, {
            stock: product.stock + item.quantity,
          });
        }
      } catch (error) {
        console.error(`Error al devolver stock del producto ${item.productId}:`, error);
      }
    }

    sales[index] = {
      ...sale,
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledBy,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    };

    this.setStorage(sales);
    return await this.delay(undefined);
  }
}
