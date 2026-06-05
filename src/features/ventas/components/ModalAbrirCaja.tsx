import { useState } from 'react';
import { Wallet, X, ArrowRight, MessageSquarePlus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAbrirCaja } from '../hooks/useCaja';

interface ModalAbrirCajaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModalAbrirCaja({ open, onOpenChange }: ModalAbrirCajaProps) {
  const [fondoInicial, setFondoInicial] = useState('');
  const [nota, setNota] = useState('');
  const [mostrarNota, setMostrarNota] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abrirCaja = useAbrirCaja();
  const montoNumerico = parseFloat(fondoInicial) || 0;

  const handleAbrir = async () => {
    setError(null);
    try {
      await abrirCaja.mutateAsync({
        initialAmount: montoNumerico,
        note: mostrarNota ? nota.trim() : undefined,
      });
      // Reset state on success
      setFondoInicial('');
      setNota('');
      setMostrarNota(false);
      onOpenChange(false);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido al abrir la caja.';
      setError(mensaje);
      console.error('Error al abrir caja:', err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="
            fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%]
            bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden
            animate-in fade-in zoom-in-95 duration-200 outline-none
          "
        >
          {/* Header Verde tipo tarjeta */}
          <div className="bg-emerald-600 px-6 py-6 text-white relative">
            <Dialog.Close className="absolute right-4 top-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <Dialog.Title className="text-[18px] font-bold">
                Apertura de Caja
              </Dialog.Title>
            </div>
            <Dialog.Description className="text-emerald-50 text-[14px]">
              ¿Cuánto efectivo tenés para empezar?
            </Dialog.Description>
          </div>

          <div className="p-6 space-y-5">
            {/* Input Efectivo Inicial */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Efectivo inicial
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  value={fondoInicial}
                  onChange={(e) => setFondoInicial(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAbrir();
                  }}
                  placeholder="0"
                  autoFocus
                  className="
                    w-full h-12 pl-8 pr-4 rounded-xl
                    bg-slate-50 dark:bg-dark-elevated border border-border
                    text-[18px] font-bold text-slate-800 dark:text-white
                    placeholder:text-slate-300 dark:placeholder:text-slate-600
                    outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                    transition-all duration-200
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  "
                />
              </div>
            </div>

            {/* Error Visible */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40">
                <p className="text-[12px] font-semibold text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Nota opcional expandible */}
            {!mostrarNota ? (
              <button
                type="button"
                onClick={() => setMostrarNota(true)}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Añadir nota opcional
              </button>
            ) : (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    Nota de apertura
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarNota(false);
                      setNota('');
                    }}
                    className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
                <input
                  type="text"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ej: Reemplazando turno..."
                  className="
                    w-full h-10 px-3.5 rounded-xl
                    bg-slate-50 dark:bg-dark-elevated border border-border
                    text-[14px] text-slate-700 dark:text-slate-200
                    placeholder:text-slate-400
                    outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
                  "
                />
              </div>
            )}

            {/* Botón Confirmar */}
            <button
              onClick={handleAbrir}
              disabled={abrirCaja.isPending}
              className={`
                w-full h-12 rounded-xl flex items-center justify-center gap-2
                text-[15px] font-bold text-white transition-all duration-200
                ${abrirCaja.isPending 
                  ? 'bg-emerald-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                }
              `}
            >
              {abrirCaja.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Confirmar apertura
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
