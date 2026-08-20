import { useState, useCallback } from 'react';
import { ChevronDown, Percent, DollarSign } from 'lucide-react';
import { formatearPesos } from '@/utils/venta.utils';
import { cn } from '@/lib/utils';

interface SeccionCobroProps {
  subtotal: number;
  descuentoGlobal: number;
  total: number;
  totalFiado: number;
  totalAPagar: number;
  nombreClienteFiado?: string;
  cantidadItems: number;
  onAbrirModalPago: () => void;
  onSetDescuentoGlobal: (descuento: number) => void;
  bloqueadoPorFiado?: boolean;
  faltaClienteParaFiar?: boolean;
}

export default function SeccionCobro({
  subtotal,
  descuentoGlobal,
  total,
  totalFiado,
  totalAPagar,
  nombreClienteFiado,
  cantidadItems,
  onAbrirModalPago,
  onSetDescuentoGlobal,
  faltaClienteParaFiar = false,
}: SeccionCobroProps) {

  // Estado del descuento colapsable
  const [descuentoAbierto, setDescuentoAbierto] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState<'fijo' | 'porcentaje'>('fijo');
  const [inputDescuento, setInputDescuento] = useState('');

  // El botón siempre es visible; su label y color cambian según el estado
  const sinItems = cantidadItems === 0;

  const labelBoton = sinItems
    ? 'Agregá productos al carrito'
    : faltaClienteParaFiar
      ? 'Elegí un cliente para continuar'
      : 'Confirmar venta';

  const handleAbrirModal = () => {
    // Siempre propaga: el parent decide si abrir el modal o resaltar el selector
    onAbrirModalPago();
  };

  // Aplicar descuento cuando cambia el input
  const handleDescuentoChange = useCallback(
    (valor: string) => {
      setInputDescuento(valor);
      const numerico = parseFloat(valor);
      if (isNaN(numerico) || numerico <= 0) {
        onSetDescuentoGlobal(0);
        return;
      }

      if (tipoDescuento === 'porcentaje') {
        // Limitar a 100%
        const porcentajeFinal = Math.min(numerico, 100);
        const montoFinal = subtotal * (porcentajeFinal / 100);
        onSetDescuentoGlobal(montoFinal);
      } else {
        // Limitar al subtotal
        onSetDescuentoGlobal(Math.min(numerico, subtotal));
      }
    },
    [tipoDescuento, subtotal, onSetDescuentoGlobal],
  );

  // Recalcular al cambiar el tipo de descuento
  const handleTipoDescuentoToggle = useCallback(() => {
    const nuevoTipo = tipoDescuento === 'fijo' ? 'porcentaje' : 'fijo';
    setTipoDescuento(nuevoTipo);

    // Recalcular con el valor actual del input
    const numerico = parseFloat(inputDescuento);
    if (isNaN(numerico) || numerico <= 0) return;

    if (nuevoTipo === 'porcentaje') {
      const porcentajeFinal = Math.min(numerico, 100);
      onSetDescuentoGlobal(subtotal * (porcentajeFinal / 100));
    } else {
      onSetDescuentoGlobal(Math.min(numerico, subtotal));
    }
  }, [tipoDescuento, inputDescuento, subtotal, onSetDescuentoGlobal]);

  // Limpiar descuento al cerrar
  const handleToggleDescuento = useCallback(() => {
    if (descuentoAbierto) {
      // Al cerrar, limpiar
      setInputDescuento('');
      onSetDescuentoGlobal(0);
    }
    setDescuentoAbierto((prev) => !prev);
  }, [descuentoAbierto, onSetDescuentoGlobal]);

return (
    <div className="border-t border-border bg-card">
      {/* Totales */}
      <div className="px-3 pt-3 pb-2 space-y-1">
        <div className="flex justify-between text-[13px] text-slate-500 dark:text-slate-400">
          <span>Subtotal ({cantidadItems} {cantidadItems === 1 ? 'artículo' : 'artículos'})</span>
          <span className="font-medium">{formatearPesos(subtotal)}</span>
        </div>

        {/* Descuento colapsable */}
        <div>
          <button
            type="button"
            onClick={handleToggleDescuento}
            className="flex items-center gap-1 text-[12px] text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors cursor-pointer"
          >
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-150',
                descuentoAbierto && 'rotate-180',
              )}
            />
            Aplicar descuento
          </button>

          {/* Input de descuento expandible */}
          <div
            className={cn(
              'grid transition-[grid-template-rows,opacity] duration-150',
              descuentoAbierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 pt-2">
                {/* Toggle $/% */}
                <button
                  type="button"
                  onClick={handleTipoDescuentoToggle}
                  className={cn(
                    'shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-border',
                    'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                    'transition-colors cursor-pointer text-xs font-bold',
                  )}
                  title={tipoDescuento === 'fijo' ? 'Cambiar a porcentaje' : 'Cambiar a monto fijo'}
                >
                  {tipoDescuento === 'fijo' ? (
                    <DollarSign className="w-3.5 h-3.5" />
                  ) : (
                    <Percent className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Input */}
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={inputDescuento}
                    onChange={(e) => handleDescuentoChange(e.target.value)}
                    placeholder={tipoDescuento === 'fijo' ? 'Monto' : 'Porcentaje'}
                    className="
                      w-full h-8 px-3 rounded-lg
                      bg-slate-50 dark:bg-dark-elevated border border-border
                      text-[13px] font-semibold text-slate-800 dark:text-white
                      placeholder:text-slate-500 dark:placeholder:text-slate-600
                      outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                       transition-[border-color,box-shadow] duration-200
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    "
                    min={0}
                    max={tipoDescuento === 'porcentaje' ? 100 : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {descuentoGlobal > 0 && (
          <div className="flex justify-between text-[13px] text-red-500 dark:text-red-400">
            <span>Descuento</span>
            <span className="font-medium">-{formatearPesos(descuentoGlobal)}</span>
          </div>
        )}

        {/* ── Desglose fiado (solo si hay ítems fiados) ──────────── */}
        {totalFiado > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[13px] text-slate-600 dark:text-slate-300">
              <span>A pagar ahora</span>
              <span className="font-semibold">{formatearPesos(totalAPagar)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-blue-600 dark:text-blue-400">
              <span className="truncate mr-2">
                Fiado{nombreClienteFiado ? ` — ${nombreClienteFiado}` : ''}
              </span>
              <span className="font-semibold shrink-0">{formatearPesos(totalFiado)}</span>
            </div>
          </div>
        )}

        {/* Total — 22px ExtraBold #111827 sobre fondo #F3F4F6 */}
        <div className="flex justify-between items-center pt-2 mt-1 px-3 py-2.5 rounded-xl bg-[#F3F4F6] dark:bg-slate-800/60">
          <span className="text-[14px] font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">
            Total
          </span>
          <span className="text-[22px] font-extrabold text-[#111827] dark:text-slate-50">
            {formatearPesos(total)}
          </span>
        </div>
      </div>

      {/* Botón confirmar — siempre visible */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={handleAbrirModal}
          disabled={sinItems}
          title={faltaClienteParaFiar ? 'Elegiá un cliente para poder fiar productos' : undefined}
          className={cn(
            'w-full h-11 rounded-xl text-[15px] font-bold',
            'transition-[background-color,transform] duration-200',
            'flex items-center justify-center gap-2',
            sinItems
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : faltaClienteParaFiar
                ? 'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white shadow-sm cursor-pointer'
                : 'bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white shadow-sm cursor-pointer',
          )}
        >
          {labelBoton}
        </button>
      </div>
    </div>
  );
}
