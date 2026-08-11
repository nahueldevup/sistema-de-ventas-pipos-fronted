import { memo } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CarritoItem } from '../hooks/useCarrito';
import { formatearPesos } from '@/utils/venta.utils';

interface ItemCarritoProps {
  item: CarritoItem;
  onActualizarCantidad: (productId: string, cantidad: number) => void;
  onQuitar: (productId: string) => void;
}

export default memo(function ItemCarrito({ item, onActualizarCantidad, onQuitar }: ItemCarritoProps) {
  const subtotal = item.unitPrice * item.quantity - item.discountAmount;
  const superaStock = item.quantity > item.maxStock;

  return (
    <div className={`
      flex flex-col gap-1.5 px-3 py-2.5 border-b border-border last:border-b-0
      transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-slate-800/30
      ${superaStock ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}
    `}>
      {/* Fila superior: Nombre y Subtotal */}
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[14px] font-semibold text-[#111827] dark:text-slate-50 leading-tight uppercase truncate flex-1"
          title={item.productName}
        >
          {item.productName}
        </p>
        <span className="text-[14px] font-bold text-[#111827] dark:text-slate-50 shrink-0 text-right">
          {formatearPesos(subtotal)}
        </span>
      </div>

      {/* Fila inferior: Precio unitario y Controles */}
      <div className="flex items-center justify-between gap-2">
        {/* Lado izquierdo: precio unitario */}
        <div className="flex items-center gap-2">
          {/* c/u: #6B7280 — legible en LED de 19" a 1.5m */}
          <span className="text-[12px] font-normal text-[#6B7280] dark:text-slate-400">
            {formatearPesos(item.unitPrice)} c/u
          </span>
          {superaStock && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              ¡Supera stock!
            </span>
          )}
        </div>

        {/* Lado derecho: Controles. gap-4 (16px) entre tacho y stepper para evitar borrados accidentales */}
        <div className="flex items-center gap-4">
          {/* Botón de Eliminar directo: 32x32px, border 1.5px — alineado con el stepper */}
          <button
            type="button"
            onClick={() => onQuitar(item.productId)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-[1.5px] border-red-200 dark:border-red-900/40 text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
            title="Eliminar del carrito"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Stepper: botones 32x32px (radius 8px, fondo #F3F4F6, borde #D1D5DB) e input central (radius 4px, fondo #FFFFFF, borde 1px #9CA3AF, focus ring azul #3B82F6) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onActualizarCantidad(item.productId, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border-[1.5px] border-[#D1D5DB] bg-[#F3F4F6] dark:bg-slate-800 dark:border-slate-600 text-[#111827] dark:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Disminuir"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1) {
                  onActualizarCantidad(item.productId, val);
                }
              }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-8 h-8 text-center text-[14px] font-bold rounded-[4px] border-[1px] border-[#9CA3AF] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-white outline-none focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
              min={1}
            />
            <button
              type="button"
              onClick={() => onActualizarCantidad(item.productId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border-[1.5px] border-[#D1D5DB] bg-[#F3F4F6] dark:bg-slate-800 dark:border-slate-600 text-[#111827] dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Aumentar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
