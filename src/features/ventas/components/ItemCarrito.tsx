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
          <span className="text-[12px] font-normal text-[#374151] dark:text-slate-400">
            {formatearPesos(item.unitPrice)} c/u
          </span>
          {superaStock && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              ¡Supera stock!
            </span>
          )}
        </div>

        {/* Lado derecho: Controles (Tacho + Stepper) */}
        <div className="flex items-center gap-2">
          {/* Botón de Eliminar directo */}
          <button
            type="button"
            onClick={() => onQuitar(item.productId)}
            className="h-7 w-7 flex items-center justify-center rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            title="Eliminar del carrito"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Stepper de cantidad */}
          <div className="flex items-center border border-border dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/40 h-7">
            <button
              type="button"
              onClick={() => onActualizarCantidad(item.productId, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="w-7 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Disminuir"
            >
              <Minus className="w-3 h-3" />
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
              className="w-8 h-full text-center text-[12px] font-bold bg-transparent border-x border-border/60 dark:border-slate-700 outline-none text-slate-800 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
            />
            <button
              type="button"
              onClick={() => onActualizarCantidad(item.productId, item.quantity + 1)}
              className="w-7 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              title="Aumentar"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
