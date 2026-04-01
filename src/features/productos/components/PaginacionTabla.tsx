import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacionTablaProps {
  totalProductos: number;
}

export default function PaginacionTabla({ totalProductos }: PaginacionTablaProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border bg-table-header/30 gap-4">
      <div className="flex items-center gap-2">
        <button aria-label="Página anterior" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-dark-border text-slate-400 bg-gray-50 dark:bg-dark-card cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button aria-current="page" aria-label="Página 1" className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 text-white font-bold shadow-sm">
          1
        </button>
        <button aria-label="Página siguiente" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm active:scale-95">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <select aria-label="Productos por página" className="border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1.5 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 outline-none focus:border-brand-500 cursor-pointer">
            <option>10 por página</option>
            <option>20 por página</option>
            <option>50 por página</option>
          </select>
        </div>
        <span>Mostrando 1 - {totalProductos} de {totalProductos} productos</span>
      </div>
    </div>
  );
}
