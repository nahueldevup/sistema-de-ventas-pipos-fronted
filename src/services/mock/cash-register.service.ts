import type { CashRegister, CashMovement } from '../../schemas/cash-register.schema';
import { MOCK_STORE_ID, MOCK_USER_ID } from '../../config/mock.config';
import { generateId } from '../../lib/utils';

// ─────────────────────────────────────────
// Resumen de caja para el cierre
// ─────────────────────────────────────────
export interface ResumenCaja {
  fondoInicial: number;
  totalVendido: number;
  totalEfectivo: number;
  totalTransferencia: number;
  totalMercadoPago: number;
  totalDebito: number;
  totalCredito: number;
  totalOtros: number;
  totalVueltos: number;
  cantidadVentas: number;
  efectivoEsperado: number; // fondoInicial + totalEfectivo - totalVueltos
}

export class CashRegisterService {
  private static REGISTER_KEY = 'pipos_mock_cash_registers';
  private static MOVEMENT_KEY = 'pipos_mock_cash_movements';

  private static delay<T>(data: T, ms = 200): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms));
  }

  // ── Storage helpers ──────────────────────────────────
  private static getRegisters(): CashRegister[] {
    try {
      const data = localStorage.getItem(this.REGISTER_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static setRegisters(data: CashRegister[]): void {
    localStorage.setItem(this.REGISTER_KEY, JSON.stringify(data));
  }

  private static getMovements(): CashMovement[] {
    try {
      const data = localStorage.getItem(this.MOVEMENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static setMovements(data: CashMovement[]): void {
    localStorage.setItem(this.MOVEMENT_KEY, JSON.stringify(data));
  }

  // ── Queries ──────────────────────────────────────────

  /**
   * Limpia cajas que quedaron abiertas de sesiones anteriores.
   * En un backend real no hace falta, pero en localStorage puede pasar
   * que el usuario cierre el navegador sin cerrar caja.
   */
  private static cleanStaleRegisters(): void {
    const registers = this.getRegisters();
    const now = Date.now();
    const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 horas
    let changed = false;

    for (let i = 0; i < registers.length; i++) {
      if (registers[i].status === 'OPEN' && !registers[i].isDeleted) {
        const openedAt = new Date(registers[i].openedAt).getTime();
        if (now - openedAt > MAX_AGE_MS) {
          registers[i] = {
            ...registers[i],
            status: 'CLOSED',
            closedAt: new Date(),
            noteClose: 'Cerrada automáticamente (sesión expirada)',
            updatedAt: new Date(),
          };
          changed = true;
        }
      }
    }

    if (changed) this.setRegisters(registers);
  }

  /** Obtener la caja abierta actual (o null si no hay) */
  static async getOpen(): Promise<CashRegister | null> {
    this.cleanStaleRegisters();
    const registers = this.getRegisters();
    const open = registers.find((r) => r.status === 'OPEN' && !r.isDeleted);
    return await this.delay(open || null);
  }

  /** Obtener movimientos de una caja */
  static async getMovementsByCaja(cashRegisterId: string): Promise<CashMovement[]> {
    const movements = this.getMovements();
    return await this.delay(
      movements.filter((m) => m.cashRegisterId === cashRegisterId && !m.isDeleted)
    );
  }

  /** Calcular resumen de la caja para el cierre */
  static async getSummary(cashRegisterId: string): Promise<ResumenCaja> {
    const movements = this.getMovements().filter(
      (m) => m.cashRegisterId === cashRegisterId && !m.isDeleted
    );
    const register = this.getRegisters().find((r) => r.id === cashRegisterId);

    const fondoInicial = register?.initialAmount || 0;

    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalMercadoPago = 0;
    let totalDebito = 0;
    let totalCredito = 0;
    let totalOtros = 0;
    let totalVueltos = 0;
    let cantidadVentas = 0;

    for (const m of movements) {
      switch (m.type) {
        case 'SALE_CASH':
          totalEfectivo += m.amount;
          cantidadVentas++;
          break;
        case 'SALE_TRANSFER':
          totalTransferencia += m.amount;
          cantidadVentas++;
          break;
        case 'SALE_MERCADO_PAGO':
          totalMercadoPago += m.amount;
          cantidadVentas++;
          break;
        case 'SALE_DEBIT':
          totalDebito += m.amount;
          cantidadVentas++;
          break;
        case 'SALE_CREDIT':
          totalCredito += m.amount;
          cantidadVentas++;
          break;
        case 'CHANGE':
          totalVueltos += Math.abs(m.amount);
          break;
        default:
          // OPENING, CLOSING, etc. no suman al desglose de ventas
          break;
      }
    }

    // Métodos que no son efectivo ni los principales
    // (por ahora no hay, pero queda preparado)

    const totalVendido = totalEfectivo + totalTransferencia + totalMercadoPago + totalDebito + totalCredito + totalOtros;
    const efectivoEsperado = fondoInicial + totalEfectivo - totalVueltos;

    return await this.delay({
      fondoInicial,
      totalVendido,
      totalEfectivo,
      totalTransferencia,
      totalMercadoPago,
      totalDebito,
      totalCredito,
      totalOtros,
      totalVueltos,
      cantidadVentas,
      efectivoEsperado,
    });
  }

  // ── Mutations ────────────────────────────────────────

  /** Abrir una caja nueva */
  static async open(initialAmount: number, note?: string): Promise<CashRegister> {
    // Limpiar cajas stale que pudieron quedar de sesiones anteriores
    this.cleanStaleRegisters();

    // Verificar que no haya otra caja abierta
    const existing = this.getRegisters().find((r) => r.status === 'OPEN' && !r.isDeleted);
    if (existing) {
      throw new Error('Ya existe una caja abierta. Cerrala antes de abrir una nueva.');
    }

    const newRegister: CashRegister = {
      id: generateId(),
      storeId: MOCK_STORE_ID,
      userId: MOCK_USER_ID,
      status: 'OPEN',
      openedAt: new Date(),
      initialAmount,
      expectedAmount: initialAmount,
      noteOpen: note || null,
      isDeleted: false,
    };

    const registers = this.getRegisters();
    registers.push(newRegister);
    this.setRegisters(registers);

    // Registrar movimiento de apertura
    await this.addMovement({
      cashRegisterId: newRegister.id!,
      userId: MOCK_USER_ID,
      type: 'OPENING',
      amount: initialAmount,
      note: note || null,
      isDeleted: false,
    });

    return await this.delay(newRegister);
  }

  /** Cerrar la caja actual */
  static async close(
    cashRegisterId: string,
    countedAmount: number,
    note?: string
  ): Promise<CashRegister> {
    const registers = this.getRegisters();
    const index = registers.findIndex((r) => r.id === cashRegisterId);

    if (index === -1) {
      throw new Error('Caja no encontrada.');
    }

    if (registers[index].status === 'CLOSED') {
      throw new Error('Esta caja ya fue cerrada.');
    }

    // Calcular resumen para obtener efectivo esperado
    const resumen = await this.getSummary(cashRegisterId);

    const difference = countedAmount - resumen.efectivoEsperado;

    registers[index] = {
      ...registers[index],
      status: 'CLOSED',
      closedAt: new Date(),
      expectedAmount: resumen.efectivoEsperado,
      countedAmount,
      difference,
      noteClose: note || null,
      updatedAt: new Date(),
    };

    this.setRegisters(registers);

    // Registrar movimiento de cierre
    await this.addMovement({
      cashRegisterId,
      userId: MOCK_USER_ID,
      type: 'CLOSING',
      amount: countedAmount,
      note: note || null,
      isDeleted: false,
    });

    return await this.delay(registers[index]);
  }

  /** Registrar un movimiento de caja */
  static async addMovement(
    data: Omit<CashMovement, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>
  ): Promise<CashMovement> {
    const movement: CashMovement = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const movements = this.getMovements();
    movements.push(movement);
    this.setMovements(movements);

    return movement; // Sin delay para movimientos internos
  }
}
