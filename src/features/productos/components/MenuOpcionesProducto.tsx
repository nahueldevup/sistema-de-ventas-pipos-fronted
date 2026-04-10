import { useState, useRef, useEffect } from "react";
import { Edit2, Printer, Trash2, MoreVertical, History } from "lucide-react";

interface MenuOpcionesProductoProps {
  abierto: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onImprimir?: () => void;
}

const MenuOpcionesProducto = ({
  abierto,
  onOpen,
  onClose,
  onEdit,
  onImprimir,
}: MenuOpcionesProductoProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [ubicarArriba, setUbicarArriba] = useState(false);

  useEffect(() => {
    if (abierto && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const container = menuRef.current.closest(".overflow-x-auto");

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const espacioDebajo = containerRect.bottom - rect.bottom;
        setUbicarArriba(espacioDebajo < 180);
      } else {
        const espacioDebajo = window.innerHeight - rect.bottom;
        setUbicarArriba(espacioDebajo < 180);
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

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, [abierto, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && abierto) {
        onClose();
      }
    };

    if (abierto) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [abierto, onClose]);

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      <div className="flex h-8 items-center overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm divide-x divide-slate-200 dark:border-dark-border dark:bg-dark-elevated dark:divide-dark-border">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
            onClose();
          }}
          title="Editar producto"
          aria-label="Editar producto"
          className="flex h-8 w-8 items-center justify-center cursor-pointer text-sky-600 hover:bg-slate-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/25 transition-colors dark:text-sky-400 dark:hover:bg-slate-800 dark:hover:text-sky-300"
        >
          <Edit2 className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onImprimir) onImprimir();
            onClose();
          }}
          title="Imprimir etiqueta"
          aria-label="Imprimir etiqueta"
          className="flex h-8 w-8 items-center justify-center cursor-pointer text-emerald-600 hover:bg-slate-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 transition-colors dark:text-emerald-400 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
        >
          <Printer className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            abierto ? onClose() : onOpen();
          }}
          title="Más opciones"
          aria-label="Más opciones"
          aria-haspopup="menu"
          aria-expanded={abierto}
          className={`flex h-8 w-8 items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400/25 transition-colors ${
            abierto
              ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <MoreVertical className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {abierto && (
        <div
          className={`absolute right-0 z-50 ${
            ubicarArriba ? "bottom-full pb-2" : "top-full pt-2"
          } animate-in fade-in ${
            ubicarArriba ? "slide-in-from-bottom-2" : "slide-in-from-top-2"
          } duration-150`}
        >
          <div className="w-48 overflow-hidden rounded-lg border border-slate-300 bg-white py-1 shadow-md dark:border-dark-border dark:bg-dark-card">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium cursor-pointer text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Edit2 className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" />
              <span>Editar producto</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onImprimir) onImprimir();
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium cursor-pointer text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Printer className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>Imprimir etiqueta</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Historial de precios");
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium cursor-pointer text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <History className="h-4 w-4 shrink-0 text-violet-700 dark:text-violet-400" />
              <span>Historial de precios</span>
            </button>

            <div className="mx-2 my-1 h-px bg-slate-200 dark:bg-dark-border" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();

                if (
                  confirm(
                    "¿Borrar este producto? Esta acción no se puede deshacer."
                  )
                ) {
                  // lógica de borrado
                }
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium cursor-pointer text-red-700 hover:bg-red-50 transition-colors focus:outline-none dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span>Borrar producto</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuOpcionesProducto;