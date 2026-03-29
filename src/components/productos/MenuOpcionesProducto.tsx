import { useState, useRef, useEffect } from "react";
import { Edit2, Printer, Trash2, MoreVertical } from "lucide-react";

const MenuOpcionesProducto = ({ abierto, onOpen, onClose, onEdit }: { abierto: boolean; onOpen: () => void; onClose: () => void; onEdit: () => void }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [ubicarArriba, setUbicarArriba] = useState(false);

  useEffect(() => {
    if (abierto && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const container = menuRef.current.closest('.overflow-x-auto');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const spaceBelow = containerRect.bottom - rect.bottom;
        setUbicarArriba(spaceBelow < 180);
      } else {
        const spaceBelow = window.innerHeight - rect.bottom;
        setUbicarArriba(spaceBelow < 180);
      }
    }
  }, [abierto]);

  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (abierto) onClose();
      }
    };
    if (abierto) {
      document.addEventListener("mousedown", handleClickFuera);
    }
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [abierto, onClose]);

  return (
    <div
      className="relative flex justify-center"
      ref={menuRef}
    >
      <button
        onClick={() => abierto ? onClose() : onOpen()}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all border shadow-sm active:scale-95 ${abierto
            ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700/50 dark:text-brand-300'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {abierto && (
        <div className={`absolute right-0 ${ubicarArriba ? 'bottom-full pb-2' : 'top-full pt-2'} z-50 animate-in fade-in ${ubicarArriba ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} duration-200`}>
          <div className="w-48 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-lg overflow-hidden py-1">
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => { onClose(); onEdit(); }}
            >
              <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-md text-blue-600 dark:text-blue-400">
                <Edit2 className="w-3.5 h-3.5" />
              </div>
              Editar producto
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => { onClose(); }}
            >
              <div className="bg-green-50 dark:bg-green-900/30 p-1.5 rounded-md text-green-600 dark:text-green-400">
                <Printer className="w-3.5 h-3.5" />
              </div>
              Imprimir etiqueta
            </button>

            <div className="h-px bg-gray-100 dark:bg-dark-border my-1 mx-3"></div>

            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={() => {
                onClose();
                if (confirm('¿Borrar este producto? Esta acción no se puede deshacer.')) {
                  // Lógica de borrado
                }
              }}
            >
              <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-md text-red-700 dark:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              Borrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuOpcionesProducto;
