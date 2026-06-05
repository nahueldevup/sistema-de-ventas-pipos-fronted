import { useState, useMemo } from 'react';
import { Lock, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { ModalFormulario } from '@/components/ui/modal-wrappers';
import { useGetResumenCaja, useCerrarCaja } from '../hooks/useCaja';
import { formatearPesos } from '@/lib/ventaUtils';

interface ModalCerrarCajaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashRegisterId: string;
}

// Denominaciones de billetes argentinos
const DENOMINACIONES = [
  { valor: 20000, label: '$20.000' },
  { valor: 10000, label: '$10.000' },
  { valor: 5000, label: '$5.000' },
  { valor: 2000, label: '$2.000' },
  { valor: 1000, label: '$1.000' },
  { valor: 500, label: '$500' },
  { valor: 200, label: '$200' },
  { valor: 100, label: '$100' },
] as const;

type Paso = 1 | 2 | 3;

export default function ModalCerrarCaja({ open, onOpenChange, cashRegisterId }: ModalCerrarCajaProps) {
  const [paso, setPaso] = useState<Paso>(1);
  const [conteo, setConteo] = useState<Record<number, string>>({});
  const [nota, setNota] = useState('');

  const { data: resumen, isLoading } = useGetResumenCaja(open ? cashRegisterId : undefined);
  const cerrarCaja = useCerrarCaja();

  // Total contado en billetes
  const totalContado = useMemo(() => {
    return DENOMINACIONES.reduce((acc, d) => {
      const cantidad = parseInt(conteo[d.valor] || '0') || 0;
      return acc + cantidad * d.valor;
    }, 0);
  }, [conteo]);

  const diferencia = resumen ? totalContado - resumen.efectivoEsperado : 0;

  const handleConteoChange = (valor: number, cantidad: string) => {
    setConteo((prev) => ({ ...prev, [valor]: cantidad }));
  };

  const handleCerrar = async () => {
    try {
      await cerrarCaja.mutateAsync({
        cashRegisterId,
        countedAmount: totalContado,
        note: nota.trim() || undefined,
      });
      // Reset
      setPaso(1);
      setConteo({});
      setNota('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error al cerrar caja:', error);
    }
  };

  const handleCancelar = () => {
    setPaso(1);
    setConteo({});
    setNota('');
    onOpenChange(false);
  };

  // Labels dinámicos del botón según el paso
  const guardarLabel = paso === 1 ? 'SIGUIENTE' : paso === 2 ? 'SIGUIENTE' : 'CERRAR CAJA';

  const handleGuardar = () => {
    if (paso === 1) setPaso(2);
    else if (paso === 2) setPaso(3);
    else handleCerrar();
  };

  return (
    <ModalFormulario
      open={open}
      onOpenChange={onOpenChange}
      title={`Cerrar caja — Paso ${paso} de 3`}
      subtitle={
        paso === 1
          ? 'Resumen del turno'
          : paso === 2
            ? 'Conteo de billetes'
            : 'Confirmar cierre'
      }
      titleIcon={<Lock className="w-5 h-5 text-red-500" />}
      onCancelar={handleCancelar}
      onGuardar={handleGuardar}
      guardarLabel={guardarLabel}
      guardarDisabled={cerrarCaja.isPending}
      className="sm:max-w-lg"
    >
      <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
        {isLoading || !resumen ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ─── PASO 1: Resumen del turno ─── */}
            {paso === 1 && (
              <div className="space-y-4">
                {/* Indicador de paso */}
                <PasoIndicador pasoActual={1} />

                {/* Resumen general */}
                <div className="space-y-2.5">
                  <FilaResumen label="Fondo inicial" valor={resumen.fondoInicial} />
                  <Separador />
                  <FilaResumen label="Ventas en efectivo" valor={resumen.totalEfectivo} destacar />
                  {resumen.totalTransferencia > 0 && (
                    <FilaResumen label="Transferencias" valor={resumen.totalTransferencia} />
                  )}
                  {resumen.totalMercadoPago > 0 && (
                    <FilaResumen label="Mercado Pago" valor={resumen.totalMercadoPago} />
                  )}
                  {resumen.totalDebito > 0 && (
                    <FilaResumen label="Débito" valor={resumen.totalDebito} />
                  )}
                  {resumen.totalCredito > 0 && (
                    <FilaResumen label="Crédito" valor={resumen.totalCredito} />
                  )}
                  <Separador />
                  <FilaResumen label="Total vendido" valor={resumen.totalVendido} destacar />
                  <FilaResumen label="Vueltos entregados" valor={-resumen.totalVueltos} negativo />
                  <FilaResumen label="Cantidad de ventas" valor={resumen.cantidadVentas} esConteo />
                  <Separador />
                  <FilaResumen
                    label="Efectivo esperado en caja"
                    valor={resumen.efectivoEsperado}
                    grande
                  />
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-2">
                  Fórmula: Fondo inicial + Ventas efectivo − Vueltos entregados
                </p>
              </div>
            )}

            {/* ─── PASO 2: Conteo de billetes ─── */}
            {paso === 2 && (
              <div className="space-y-4">
                <PasoIndicador pasoActual={2} />

                <div className="space-y-2">
                  {DENOMINACIONES.map((d) => {
                    const cantidad = parseInt(conteo[d.valor] || '0') || 0;
                    const subtotal = cantidad * d.valor;
                    return (
                      <div
                        key={d.valor}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <span className="w-[72px] text-[13px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {d.label}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">×</span>
                        <input
                          type="number"
                          value={conteo[d.valor] || ''}
                          onChange={(e) => handleConteoChange(d.valor, e.target.value)}
                          placeholder="0"
                          min={0}
                          className="
                            w-16 h-8 text-center text-[13px] font-bold rounded-lg
                            bg-white dark:bg-dark-elevated border border-border
                            text-slate-800 dark:text-white
                            outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                          "
                        />
                        <span className="text-slate-300 dark:text-slate-600">=</span>
                        <span className={`flex-1 text-right text-[13px] font-semibold ${subtotal > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                          {formatearPesos(subtotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                    Total contado
                  </span>
                  <span className="text-[18px] font-extrabold text-brand-700 dark:text-brand-400">
                    {formatearPesos(totalContado)}
                  </span>
                </div>

                {/* Botón volver */}
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Volver al resumen
                </button>
              </div>
            )}

            {/* ─── PASO 3: Confirmación ─── */}
            {paso === 3 && (
              <div className="space-y-5">
                <PasoIndicador pasoActual={3} />

                {/* Comparación */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-dark-elevated border border-border">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 dark:text-slate-400">Efectivo esperado</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {formatearPesos(resumen.efectivoEsperado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 dark:text-slate-400">Efectivo contado</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {formatearPesos(totalContado)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                        Diferencia
                      </span>
                      <span
                        className={`text-[18px] font-extrabold ${
                          diferencia > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : diferencia < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {diferencia > 0 ? '+' : ''}{formatearPesos(diferencia)}
                      </span>
                    </div>
                    {diferencia !== 0 && (
                      <p className={`text-[11px] mt-1 ${diferencia > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {diferencia > 0 ? 'Sobra dinero en la caja' : 'Falta dinero en la caja'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alerta si hay diferencia grande */}
                {Math.abs(diferencia) > 1000 && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
                      La diferencia es significativa. Verificá el conteo antes de confirmar.
                    </p>
                  </div>
                )}

                {/* Nota de cierre */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    Nota de cierre <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej: Todo OK, faltó monedas..."
                    maxLength={255}
                    className="
                      w-full h-10 px-4 rounded-xl
                      bg-white dark:bg-dark-elevated border border-border
                      text-[14px] text-slate-700 dark:text-slate-200
                      placeholder:text-slate-300 dark:placeholder:text-slate-600
                      outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                      transition-all duration-200
                    "
                  />
                </div>

                {/* Botón volver */}
                <button
                  type="button"
                  onClick={() => setPaso(2)}
                  className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Volver al conteo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ModalFormulario>
  );
}

// ─────────────────────────────────────────
// Componentes auxiliares internos
// ─────────────────────────────────────────

function PasoIndicador({ pasoActual }: { pasoActual: Paso }) {
  const pasos = [
    { num: 1, label: 'Resumen' },
    { num: 2, label: 'Conteo' },
    { num: 3, label: 'Confirmar' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 pb-3">
      {pasos.map((p, i) => (
        <div key={p.num} className="flex items-center gap-2">
          <div
            className={`
              w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold
              transition-colors duration-200
              ${p.num === pasoActual
                ? 'bg-brand-600 text-white'
                : p.num < pasoActual
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
              }
            `}
          >
            {p.num < pasoActual ? '✓' : p.num}
          </div>
          {i < pasos.length - 1 && (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          )}
        </div>
      ))}
    </div>
  );
}

function FilaResumen({
  label,
  valor,
  destacar,
  negativo,
  grande,
  esConteo,
}: {
  label: string;
  valor: number;
  destacar?: boolean;
  negativo?: boolean;
  grande?: boolean;
  esConteo?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center ${grande ? 'pt-2' : ''}`}>
      <span
        className={`text-[13px] ${grande ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
      >
        {label}
      </span>
      <span
        className={`
          font-bold text-right
          ${grande ? 'text-[18px] text-brand-700 dark:text-brand-400' : 'text-[13px]'}
          ${destacar ? 'text-slate-800 dark:text-white' : ''}
          ${negativo ? 'text-red-500 dark:text-red-400' : ''}
          ${!destacar && !negativo && !grande ? 'text-slate-600 dark:text-slate-300' : ''}
        `}
      >
        {esConteo ? valor : formatearPesos(valor)}
      </span>
    </div>
  );
}

function Separador() {
  return <div className="border-t border-dashed border-border/60 my-1" />;
}
