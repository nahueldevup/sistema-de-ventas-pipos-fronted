import { useState, useMemo } from 'react';
import { Banknote, CreditCard, ArrowRightLeft, QrCode, Smartphone } from 'lucide-react';
import { formatearPesos } from '@/lib/ventaUtils';

interface SeccionCobroProps {
  subtotal: number;
  descuentoGlobal: number;
  total: number;
  cantidadItems: number;
  onConfirmar: (montoPagado: number, metodoPago: string) => void;
  confirmando: boolean;
}

// Métodos de pago disponibles
const METODOS_PAGO = [
  { id: 'CASH', label: 'Efectivo', icon: Banknote, habilitado: true },
  { id: 'TRANSFER', label: 'Transferencia', icon: ArrowRightLeft, habilitado: false },
  { id: 'MERCADO_PAGO', label: 'Mercado Pago', icon: Smartphone, habilitado: false },
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
  confirmando,
}: SeccionCobroProps) {
  const [metodoPago, setMetodoPago] = useState('CASH');
  const [montoRecibido, setMontoRecibido] = useState('');

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

  return (
    <div className="border-t border-border bg-card">
      {/* Totales */}
      <div className="px-4 pt-4 pb-3 space-y-1.5">
        <div className="flex justify-between text-[13px] text-slate-500 dark:text-slate-400">
          <span>Subtotal ({cantidadItems} {cantidadItems === 1 ? 'artículo' : 'artículos'})</span>
          <span className="font-medium">{formatearPesos(subtotal)}</span>
        </div>

        {descuentoGlobal > 0 && (
          <div className="flex justify-between text-[13px] text-red-500 dark:text-red-400">
            <span>Descuento</span>
            <span className="font-medium">-{formatearPesos(descuentoGlobal)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-border/60">
          <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Total</span>
          <span className="text-[22px] font-extrabold text-brand-700 dark:text-brand-400">
            {formatearPesos(total)}
          </span>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="px-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {METODOS_PAGO.map((mp) => (
            <button
              key={mp.id}
              type="button"
              onClick={() => mp.habilitado && setMetodoPago(mp.id)}
              disabled={!mp.habilitado}
              title={!mp.habilitado ? 'Próximamente' : mp.label}
              className={`
                shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-[12px] font-semibold border transition-all duration-150
                ${!mp.habilitado
                  ? 'opacity-40 cursor-not-allowed border-border text-slate-400'
                  : metodoPago === mp.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm cursor-pointer'
                    : 'bg-card text-slate-600 dark:text-slate-300 border-border hover:border-brand-400 cursor-pointer'
                }
              `}
            >
              <mp.icon className="w-3.5 h-3.5" />
              {mp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input de monto y vuelto */}
      <div className="px-4 pb-3 space-y-2">
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
              w-full h-11 pl-7 pr-4 rounded-xl
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
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleConfirmar}
          disabled={!puedeConfirmar}
          className={`
            w-full h-12 rounded-xl text-[15px] font-bold
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
