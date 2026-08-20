import { memo } from 'react';
import { Minus, Plus, Trash2, Check } from 'lucide-react';
import type { CarritoItem } from '../hooks/useCarrito';
import { formatearPesos } from '@/utils/venta.utils';
import { cn } from '@/lib/utils';

interface ItemCarritoProps {
  item: CarritoItem;
  onActualizarCantidad: (productId: string, cantidad: number) => void;
  onQuitar: (productId: string) => void;
  onToggleFiado: (productId: string) => void;
  faltaClienteParaFiar?: boolean;
  mostrarToast?: (tipo: 'exito' | 'error', mensaje: string) => void;
}

export default memo(function ItemCarrito({ item, onActualizarCantidad, onQuitar, onToggleFiado, faltaClienteParaFiar }: ItemCarritoProps) {
  const subtotal = item.unitPrice * item.quantity - item.discountAmount;
  const superaStock = item.quantity > item.maxStock;

  return (
    <div className={`
      flex flex-col gap-1.5 px-3 py-2.5 border-b border-border last:border-b-0
      transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-slate-800/30
      ${superaStock ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}
    `}>
      {/* Fila superior: Nombre + tag fiado + Subtotal */}
      <div className="flex items-start justify-between gap-3">
        {/* Nombre */}
        <p
          className="text-[14px] font-semibold text-[#111827] dark:text-slate-50 leading-tight uppercase truncate flex-1"
          title={item.productName}
        >
          {item.productName}
        </p>

        {/* Subtotal */}
        <span className={cn(
          'text-[14px] font-bold shrink-0 text-right',
          item.fiado
            ? 'text-slate-400 dark:text-slate-500 line-through'
            : 'text-[#111827] dark:text-slate-50',
        )}>
          {formatearPesos(subtotal)}
        </span>
      </div>

      {/* Fila inferior: Precio unitario + Controles (Fiar → Eliminar → Cantidad) */}
      <div className="flex items-center justify-between gap-2">
        {/* Lado izquierdo: precio unitario */}
        <div className="flex items-center gap-2">
          {/* c/u: #6B7280 — legible en LED de 19" a 1.5m */}
          <span className="text-[12px] font-normal text-[#6B7280] dark:text-slate-400">
            {formatearPesos(item.unitPrice)} c/u
          </span>
          {superaStock && (
            <span
              role="alert"
              aria-live="polite"
              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider"
            >
              ¡Supera stock!
            </span>
          )}
        </div>

        {/* Lado derecho: Fiar → Eliminar → Cantidad */}
        <div className="flex items-center gap-3">
          {/* Botón Fiar / Fiado — siempre toggleable */}
          <button
            type="button"
            onClick={() => onToggleFiado(item.productId)}
            title={item.fiado ? 'Quitar de fiado' : 'Marcar como fiado'}
            aria-pressed={item.fiado}
            className={cn(
              'h-8 px-2.5 flex items-center justify-center gap-1.5 rounded-lg',
              'text-[11px] transition-[background-color,border-color,color] duration-150 cursor-pointer border-[1.5px]',
              item.fiado && faltaClienteParaFiar
                ? 'bg-amber-500 dark:bg-amber-500 border-amber-500 text-white font-bold shadow-xs'
                : item.fiado
                  ? 'bg-blue-600 dark:bg-blue-600 border-blue-600 dark:border-blue-500 text-white font-bold shadow-xs'
                  : 'border-[#D1D5DB] bg-[#F3F4F6] dark:bg-slate-800 dark:border-slate-600 text-[#111827] dark:text-slate-100 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700',
            )}
          >
            {item.fiado && <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0 text-white" />}
            {item.fiado ? 'FIADO' : 'FIAR'}
          </button>

          {/* Botón de Eliminar directo: 32x32px, border 1.5px */}
          <button
            type="button"
            onClick={() => onQuitar(item.productId)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-[1.5px] border-red-200 dark:border-red-900/40 text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-[border-color,background-color] cursor-pointer"
            title="Eliminar del carrito"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Stepper de cantidad */}
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
              aria-label={`Cantidad de ${item.productName}`}
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onActualizarCantidad(item.productId, isNaN(val) || val < 1 ? 1 : val);
              }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-8 h-8 text-center text-[14px] font-bold rounded-[4px] border-[1px] border-[#9CA3AF] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#111827] dark:text-white outline-none focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-[border-color,box-shadow] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
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
