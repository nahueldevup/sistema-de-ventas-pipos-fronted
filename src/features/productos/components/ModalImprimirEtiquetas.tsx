import { X, Printer } from "lucide-react";
import { useRef } from "react";
import type { Producto } from "@/types/producto.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";


interface ModalImprimirEtiquetasProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
}

export default function ModalImprimirEtiquetas({ isOpen, onClose, productos }: ModalImprimirEtiquetasProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[calc(100%-2rem)] sm:max-w-4xl p-0 gap-0 overflow-hidden bg-white dark:bg-dark-card border-none shadow-xl rounded-2xl" 
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Vista previa de etiquetas</DialogTitle>
        
        <div className="flex flex-col w-full max-h-[90vh]">
          <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-elevated/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Vista previa de etiquetas</h2>
          <button onClick={onClose} className="text-white bg-rose-400 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700 p-1.5 rounded-full transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {productos.map((producto) => (
              <div key={producto.id} className="border border-gray-300 dark:border-dark-border p-3 rounded-lg text-center">
                <div className="font-bold text-sm mb-1 text-slate-800 dark:text-slate-100">{producto.nombre}</div>
                <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">{producto.codigo}</div>
                <div className="text-lg font-bold text-green-700 dark:text-green-400">${producto.precioVenta.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-elevated/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-dark-elevated rounded-lg transition-colors">
            CANCELAR
          </button>
          <button onClick={handlePrint} className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
            <Printer className="w-4 h-4" />
            IMPRIMIR
          </button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}