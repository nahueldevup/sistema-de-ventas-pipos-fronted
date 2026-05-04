import { useState, useRef, useEffect } from 'react';
import { Edit2, Printer, MoreVertical, Trash2, History } from 'lucide-react';

export interface MenuOpcionesTablaProps {
  abierto: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
}

export default function MenuOpcionesTabla({
  abierto,
  onOpen,
  onClose,
  onEdit,
  onDelete,
  onPrint,
}: MenuOpcionesTablaProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [ubicarArriba, setUbicarArriba] = useState(false);

  // Calcula si el menú debe abrirse hacia arriba o abajo según el espacio disponible
  useEffect(() => {
    if (abierto && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const container = menuRef.current.closest('.overflow-auto');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        setUbicarArriba(containerRect.bottom - rect.bottom < 180);
      } else {
        setUbicarArriba(window.innerHeight - rect.bottom < 180);
      }
    }
  }, [abierto]);

  // Cierra el menú al hacer click fuera o al presionar Escape
  useEffect(() => {
    if (!abierto) return;
    const handleClickFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [abierto, onClose]);

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      {/* ── Grupo de botones principales ────────────────────────── */}
      <div className="flex h-8 items-center overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm divide-x divide-slate-200 dark:border-dark-border dark:bg-dark-elevated dark:divide-dark-border">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); onClose(); }}
          title="Editar producto"
          aria-label="Editar producto"
          className="flex h-8 w-8 items-center justify-center cursor-pointer text-sky-600 hover:bg-slate-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/25 transition-colors dark:text-sky-400 dark:hover:bg-slate-800 dark:hover:text-sky-300"
        >
          <Edit2 className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); onPrint?.(); }}
          title="Imprimir etiqueta"
          aria-label="Imprimir etiqueta"
          className="flex h-8 w-8 items-center justify-center cursor-pointer text-emerald-600 hover:bg-slate-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 transition-colors dark:text-emerald-400 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
        >
          <Printer className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); abierto ? onClose() : onOpen(); }}
          title="Más opciones"
          aria-label="Más opciones"
          aria-haspopup="menu"
          aria-expanded={abierto}
          className={`flex h-8 w-8 items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400/25 transition-colors ${
            abierto
              ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MoreVertical className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Menú desplegable ────────────────────────────────────── */}
      {abierto && (
        <div
          className={`absolute right-0 z-50 ${
            ubicarArriba ? 'bottom-full pb-2' : 'top-full pt-2'
          } animate-in fade-in ${
            ubicarArriba ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
          } duration-150`}
        >
          <div className="w-48 overflow-hidden rounded-lg border border-slate-300 bg-white py-1 shadow-md dark:border-dark-border dark:bg-dark-card">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); onEdit(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium cursor-pointer text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Edit2 className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" />
              <span>Editar producto</span>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); onPrint?.(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium cursor-pointer text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Printer className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>Imprimir etiqueta</span>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              disabled
              title="Próximamente"
              className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm font-medium cursor-not-allowed text-slate-400 dark:text-slate-600"
            >
              <History className="h-4 w-4 shrink-0 mt-0.5 text-violet-400 dark:text-violet-700" />
              <div className="flex flex-col items-start gap-1">
                <span className="whitespace-nowrap">Historial de precios</span>
                <span className="text-[10px] leading-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">Próximamente</span>
              </div>
            </button>
            <div className="mx-2 my-1 h-px bg-slate-200 dark:bg-dark-border" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); onDelete?.(); }}
              disabled={!onDelete}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none ${
                onDelete
                  ? 'cursor-pointer text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : 'cursor-not-allowed text-slate-400 dark:text-slate-600'
              }`}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span>Borrar producto</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
