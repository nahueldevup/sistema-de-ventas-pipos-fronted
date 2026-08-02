import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Banknote, ArrowRightLeft, Smartphone, X, Split, CreditCard, QrCode } from 'lucide-react';
import { formatearPesos } from '@/utils/venta.utils';
import { cn } from '@/lib/utils';

// ── Tipos públicos ──────────────────────────────────────────────────
export interface PagoData {
  method: string;
  amount: number;
  reference?: string | null;
}

interface ModalPagoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirmar: (pagos: PagoData[]) => void;
  confirmando: boolean;
}

// ── Métodos de pago (escalable: agregar nuevos acá) ─────────────────
const METODOS_PAGO = [
  { id: 'CASH', label: 'Efectivo', icon: Banknote },
  { id: 'CREDIT_CARD', label: 'Tarjeta Crédito', icon: CreditCard },
  { id: 'DEBIT_CARD', label: 'Tarjeta Débito', icon: CreditCard },
  { id: 'TRANSFER', label: 'Transferencia', icon: ArrowRightLeft },
  { id: 'MERCADO_PAGO', label: 'Mercado Pago', icon: Smartphone },
  { id: 'QR', label: 'QR', icon: QrCode },
] as const;

type MetodoId = (typeof METODOS_PAGO)[number]['id'];

// ── Componente ──────────────────────────────────────────────────────
export default function ModalPago({
  open,
  onOpenChange,
  total,
  onConfirmar,
  confirmando,
}: ModalPagoProps) {
  // Modo: simple (un solo método) o mixto (varios métodos)
  const [esMixto, setEsMixto] = useState(false);

  // Modo simple: método seleccionado + monto ingresado
  const [metodoSimple, setMetodoSimple] = useState<MetodoId>('CASH');
  const [montoSimple, setMontoSimple] = useState('');

  // Modo mixto: montos por método
  const [montosMixtos, setMontosMixtos] = useState<Record<string, string>>({});

  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputSimpleRef = useRef<HTMLInputElement>(null);
  const primerInputMixtoRef = useRef<HTMLInputElement>(null);

  // ── Cálculos modo simple ────────────────────────────────────────
  const montoSimpleNumerico = useMemo(() => {
    const parsed = parseFloat(montoSimple);
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [montoSimple]);

  const diferenciaSimple = montoSimpleNumerico - total;

  // ── Cálculos modo mixto ─────────────────────────────────────────
  const montosNumericosMixtos = useMemo(() => {
    const result: Record<string, number> = {};
    METODOS_PAGO.forEach((m) => {
      const parsed = parseFloat(montosMixtos[m.id] || '');
      result[m.id] = isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    });
    return result;
  }, [montosMixtos]);

  const totalPagadoMixto = useMemo(
    () => Object.values(montosNumericosMixtos).reduce((a, b) => a + b, 0),
    [montosNumericosMixtos],
  );

  const diferenciaMixta = totalPagadoMixto - total;

  // ── Puede confirmar ─────────────────────────────────────────────
  const puedeConfirmar = esMixto
    ? totalPagadoMixto >= total && !confirmando
    : montoSimpleNumerico >= total && !confirmando;

  // ── Reset al abrir ──────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setEsMixto(false);
      setMetodoSimple('CASH');
      setMontoSimple(total.toFixed(2));
      setMontosMixtos({});
      setError(null);
      setTimeout(() => inputSimpleRef.current?.focus(), 100);
    }
  }, [open, total]);

  // ── Cerrar con click fuera ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onOpenChange]);

  // ── Cerrar con Escape ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  // ── Toggle modo mixto ───────────────────────────────────────────
  const handleToggleMixto = useCallback(() => {
    setError(null);
    setEsMixto((prev) => {
      if (!prev) {
        // Al activar mixto: pre-llenar el método simple actual con el total
        setMontosMixtos({ [metodoSimple]: total.toFixed(2) });
        setTimeout(() => primerInputMixtoRef.current?.focus(), 100);
      } else {
        // Al volver a simple: reset
        setMontoSimple(total.toFixed(2));
        setMontosMixtos({});
        setTimeout(() => inputSimpleRef.current?.focus(), 100);
      }
      return !prev;
    });
  }, [metodoSimple, total]);

  // ── Cambio de monto en modo mixto (con auto-cálculo) ────────────
  const handleMontoMixtoChange = useCallback(
    (methodId: string, valor: string) => {
      setError(null);
      const sanitized = valor.replace(/[^0-9.]/g, '');

      setMontosMixtos((prev) => {
        const next = { ...prev, [methodId]: sanitized };

        // Sumar todo excepto el método actual que se está editando
        let sumaOtros = 0;
        METODOS_PAGO.forEach((m) => {
          if (m.id !== methodId) {
            const parsed = parseFloat(next[m.id] || '');
            sumaOtros += isNaN(parsed) || parsed <= 0 ? 0 : parsed;
          }
        });

        const ingresado = parseFloat(sanitized);
        const ingresadoFinal = isNaN(ingresado) || ingresado <= 0 ? 0 : ingresado;

        // Auto-rellenar: buscar el primer método vacío que no sea el actual
        const metodosRestantes = METODOS_PAGO.filter((m) => m.id !== methodId);
        const metodoVacio = metodosRestantes.find(
          (m) => !next[m.id] || (parseFloat(next[m.id]) || 0) === 0,
        );

        if (metodoVacio && ingresadoFinal > 0 && total > 0) {
          const necesario = Math.max(0, total - sumaOtros - ingresadoFinal);
          if (necesario > 0) {
            next[metodoVacio.id] = necesario.toFixed(2);
          }
        }

        return next;
      });
    },
    [total],
  );

  // ── Confirmar ───────────────────────────────────────────────────
  const handleConfirmar = useCallback(() => {
    if (!puedeConfirmar) return;

    let pagos: PagoData[];

    if (esMixto) {
      pagos = METODOS_PAGO
        .map((m) => ({
          method: m.id,
          amount: montosNumericosMixtos[m.id],
          reference: null,
        }))
        .filter((p) => p.amount > 0);
    } else {
      pagos = [{
        method: metodoSimple,
        amount: montoSimpleNumerico,
        reference: null,
      }];
    }

    if (pagos.length === 0) {
      setError('Ingresá al menos un monto para continuar');
      return;
    }

    onConfirmar(pagos);
  }, [puedeConfirmar, esMixto, metodoSimple, montoSimpleNumerico, montosNumericosMixtos, onConfirmar]);

  // ── No renderizar si no está abierto ────────────────────────────
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        ref={containerRef}
        className="
          relative z-[61] w-[400px] max-w-[calc(100vw-2rem)]
          bg-card border border-border
          rounded-xl shadow-float
          p-5 space-y-4
          animate-in fade-in slide-in-from-bottom-2 duration-200
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Confirmar pago
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total a pagar */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-elevated border border-border">
          <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
            Total a pagar
          </span>
          <span className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">
            {formatearPesos(total)}
          </span>
        </div>

        {/* ── Modo simple: selector de método + input ─────────────── */}
        {!esMixto && (
          <div className="space-y-3">
            {/* Selector de método de pago */}
            <div className="grid grid-cols-3 gap-1.5">
              {METODOS_PAGO.map((mp) => {
                const isActive = metodoSimple === mp.id;
                return (
                  <button
                    key={mp.id}
                    type="button"
                    onClick={() => {
                      setMetodoSimple(mp.id);
                      setError(null);
                      setTimeout(() => inputSimpleRef.current?.focus(), 50);
                    }}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg',
                      'text-[11px] font-semibold transition-all duration-150 cursor-pointer',
                      'border',
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-400 shadow-sm'
                        : 'border-border text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                    )}
                  >
                    <mp.icon className={cn('w-4 h-4', isActive && 'text-brand-600 dark:text-brand-400')} />
                    {mp.label}
                  </button>
                );
              })}
            </div>

            {/* Input de monto */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-bold text-slate-400">
                $
              </span>
              <input
                ref={inputSimpleRef}
                type="number"
                value={montoSimple}
                onChange={(e) => {
                  setError(null);
                  setMontoSimple(e.target.value.replace(/[^0-9.]/g, ''));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmar();
                  e.stopPropagation();
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                placeholder="0,00"
                className="
                  w-full h-12 pl-8 pr-4 rounded-lg
                  bg-slate-50 dark:bg-dark-elevated border border-border
                  text-[18px] font-bold text-slate-800 dark:text-white
                  placeholder:text-slate-300 dark:placeholder:text-slate-600
                  outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                  transition-all duration-200
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                "
              />
            </div>

            {/* Vuelto (solo efectivo y si sobra) */}
            {diferenciaSimple > 0 && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                  Vuelto
                </span>
                <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
                  {formatearPesos(diferenciaSimple)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Modo mixto: inputs por método ──────────────────────── */}
        {esMixto && (
          <div className="space-y-2">
            {METODOS_PAGO.map((mp, idx) => (
              <div key={mp.id} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 w-[115px] shrink-0">
                  <mp.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                    {mp.label}
                  </span>
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400">
                    $
                  </span>
                  <input
                    ref={idx === 0 ? primerInputMixtoRef : undefined}
                    type="number"
                    value={montosMixtos[mp.id] || ''}
                    onChange={(e) => handleMontoMixtoChange(mp.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmar();
                      e.stopPropagation();
                    }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    placeholder="0,00"
                    className="
                      w-full h-9 pl-7 pr-3 rounded-lg
                      bg-slate-50 dark:bg-dark-elevated border border-border
                      text-[14px] font-bold text-slate-800 dark:text-white
                      placeholder:text-slate-300 dark:placeholder:text-slate-600
                      outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                      transition-all duration-200
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    "
                  />
                </div>
              </div>
            ))}

            {/* Resumen mixto */}
            <div className="flex items-center justify-between px-1 pt-1.5 border-t border-border/60">
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                Total pagado
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'text-[14px] font-bold',
                    diferenciaMixta >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-500 dark:text-red-400',
                  )}
                >
                  {formatearPesos(totalPagadoMixto)}
                </span>
                {diferenciaMixta > 0 && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    (Vuelto: {formatearPesos(diferenciaMixta)})
                  </span>
                )}
                {diferenciaMixta < 0 && (
                  <span className="text-[11px] text-red-500 dark:text-red-400 font-medium">
                    Falta: {formatearPesos(Math.abs(diferenciaMixta))}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toggle pago mixto */}
        <button
          type="button"
          onClick={handleToggleMixto}
          className={cn(
            'flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg',
            'text-[11px] font-semibold transition-colors cursor-pointer',
            esMixto
              ? 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
          )}
        >
          <Split className="w-3.5 h-3.5" />
          {esMixto ? 'Usar un solo método de pago' : 'Dividir en varios métodos'}
        </button>

        {/* Error */}
        {error && (
          <p className="text-[11px] text-red-500 font-medium">{error}</p>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!puedeConfirmar}
            className={cn(
              'flex-1 h-9 rounded-lg text-[13px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2',
              puedeConfirmar
                ? 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed',
            )}
          >
            {confirmando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Confirmar</>
            )}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 rounded-lg text-[13px] font-semibold text-slate-500 border border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}