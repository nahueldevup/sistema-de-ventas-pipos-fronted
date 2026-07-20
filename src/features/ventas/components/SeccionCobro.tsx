import { useState, useMemo, useCallback } from 'react';
import { Banknote, ArrowRightLeft, Smartphone, QrCode, CreditCard, ChevronDown, Percent, DollarSign } from 'lucide-react';
import { formatearPesos } from '@/lib/ventaUtils';
import { cn } from '@/lib/utils';

interface SeccionCobroProps {
  subtotal: number;
  descuentoGlobal: number;
  total: number;
  cantidadItems: number;
  onConfirmar: (montoPagado: number, metodoPago: string) => void;
  onSetDescuentoGlobal: (descuento: number) => void;
  confirmando: boolean;
}

// Métodos de pago disponibles
const METODOS_PAGO = [
  { id: 'CASH', label: 'Efectivo', icon: Banknote, habilitado: true },
  { id: 'TRANSFER', label: 'Transferencia', icon: ArrowRightLeft, habilitado: true },
  { id: 'MERCADO_PAGO', label: 'Mercado Pago', icon: Smartphone, habilitado: true },
  { id: 'QR', label: 'QR', icon: QrCode, habilitado: false },
  { id: 'DEBIT', label: 'Débito', icon: CreditCard, habilitado: false },
  { id: 'CREDIT', label: 'Crédito', icon: CreditCard, habilitado: false },
] as const;

export default function SeccionCobro({
  subtotal,
  descuentoGlobal,
  total,
  cantidadItems,
  onConfirmar,
  onSetDescuentoGlobal,
  confirmando,
}: SeccionCobroProps) {
  const [metodoPago, setMetodoPago] = useState('CASH');
  const [montoRecibido, setMontoRecibido] = useState('');

  // Estado del descuento colapsable
  const [descuentoAbierto, setDescuentoAbierto] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState<'fijo' | 'porcentaje'>('fijo');
  const [inputDescuento, setInputDescuento] = useState('');

  const montoNumerico = useMemo(() => {
    const parsed = parseFloat(montoRecibido);
    return isNaN(parsed) ? 0 : parsed;
  }, [montoRecibido]);

  const vuelto = useMemo(() => Math.max(0, montoNumerico - total), [montoNumerico, total]);
  const cubreTotal = montoNumerico >= total;
  const puedeConfirmar = cantidadItems > 0 && cubreTotal && !confirmando;

  const handleConfirmar = () => {
    if (!puedeConfirmar) return;
    onConfirmar(montoNumerico, metodoPago);
    setMontoRecibido('');
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

  // Separar métodos habilitados y deshabilitados
  const metodosHabilitados = METODOS_PAGO.filter((m) => m.habilitado);
  const metodosDeshabilitados = METODOS_PAGO.filter((m) => !m.habilitado);

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
                      placeholder:text-slate-300 dark:placeholder:text-slate-600
                      outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                      transition-all duration-200
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

        {/* Total con tipografía reforzada */}
        <div className="flex justify-between items-center pt-2 border-t border-border/60">
          <span className="text-base font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
            Total
          </span>
          <span className="text-3xl font-extrabold text-brand-700 dark:text-brand-400">
            {formatearPesos(total)}
          </span>
        </div>
      </div>

      {/* Métodos de pago — grid de botones grandes */}
      <div className="px-3 pb-2 space-y-1.5">
        {/* Métodos habilitados */}
        <div className="grid grid-cols-3 gap-2">
          {metodosHabilitados.map((mp) => (
            <button
              key={mp.id}
              type="button"
              onClick={() => setMetodoPago(mp.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl',
                'text-[11px] font-semibold border transition-all duration-150 cursor-pointer',
                metodoPago === mp.id
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-card text-slate-600 dark:text-slate-300 border-border hover:border-brand-400',
              )}
            >
              <mp.icon className="w-4 h-4" />
              <span className="leading-tight text-center">{mp.label}</span>
            </button>
          ))}
        </div>

        {/* Métodos deshabilitados — fila compacta */}
        {metodosDeshabilitados.length > 0 && (
          <div className="flex gap-1.5">
            {metodosDeshabilitados.map((mp) => (
              <button
                key={mp.id}
                type="button"
                disabled
                title="Próximamente"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-medium border border-border text-slate-400 opacity-40 cursor-not-allowed"
              >
                <mp.icon className="w-3 h-3" />
                {mp.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input de monto y vuelto */}
      <div className="px-3 pb-2 space-y-1.5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-400">$</span>
          <input
            type="number"
            value={montoRecibido}
            onChange={(e) => setMontoRecibido(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && puedeConfirmar) handleConfirmar();
            }}
            placeholder={total.toLocaleString('es-AR')}
            className="
              w-full h-10 pl-7 pr-4 rounded-xl
              bg-slate-50 dark:bg-dark-elevated border border-border
              text-[16px] font-bold text-slate-800 dark:text-white
              placeholder:text-slate-300 dark:placeholder:text-slate-600
              outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
              transition-all duration-200
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            "
          />
        </div>

        {montoNumerico > 0 && (
          <div className={`flex justify-between text-[14px] font-bold px-1 ${cubreTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            <span>{cubreTotal ? 'Vuelto' : 'Falta'}</span>
            <span>{cubreTotal ? formatearPesos(vuelto) : formatearPesos(total - montoNumerico)}</span>
          </div>
        )}
      </div>

      {/* Botón confirmar */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={handleConfirmar}
          disabled={!puedeConfirmar}
          className={`
            w-full h-10 rounded-xl text-[14px] font-bold
            transition-all duration-200 cursor-pointer
            flex items-center justify-center gap-2
            ${puedeConfirmar
              ? 'bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white shadow-sm'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }
          `}
        >
          {confirmando ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Confirmar venta — {formatearPesos(total)}</>
          )}
        </button>
      </div>
    </div>
  );
}
