import { memo } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CarritoItem } from '../hooks/useCarrito';
import { formatearPesos } from '@/lib/ventaUtils';

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
      flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-b-0
      transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-slate-800/30
      ${superaStock ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}
    `}>
      {/* Info del producto */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight"
          title={item.productName}
        >
          {item.productName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[12px] text-slate-400 dark:text-slate-500">
            {formatearPesos(item.unitPrice)} c/u
          </span>
          {superaStock && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
              Supera stock
            </span>
          )}
        </div>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (item.quantity <= 1) {
              onQuitar(item.productId);
            } else {
              onActualizarCantidad(item.productId, item.quantity - 1);
            }
          }}
          className={`
            w-7 h-7 flex items-center justify-center rounded-lg
            border transition-all duration-150 cursor-pointer
            ${item.quantity <= 1
              ? 'border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'border-border text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
            }
          `}
          title={item.quantity <= 1 ? 'Eliminar del carrito' : 'Disminuir cantidad'}
        >
          {item.quantity <= 1 ? (
            <Trash2 className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
        </button>

        <input
          type="number"
          value={item.quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 0) {
              onActualizarCantidad(item.productId, val);
            }
          }}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="
            w-10 h-7 text-center text-[13px] font-bold
            bg-transparent text-slate-800 dark:text-white
            outline-none
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          "
          min={0}
        />

        <button
          type="button"
          onClick={() => onActualizarCantidad(item.productId, item.quantity + 1)}
          className="
            w-7 h-7 flex items-center justify-center rounded-lg
            border border-border text-slate-500
            hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300
            transition-all duration-150 cursor-pointer
          "
          title="Aumentar cantidad"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtotal */}
      <span className="text-[14px] font-bold text-slate-800 dark:text-white w-[85px] text-right shrink-0">
        {formatearPesos(subtotal)}
      </span>
    </div>
  );
});
