import { Upload, Download, AlertCircle, XCircle, Tag } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import type { FiltrosPOS, Ordenamiento } from '@/types/filtros.types';

interface CabeceraTablaProductosProps {
  productosLength: number;
  ordenamiento: Ordenamiento;
  filtros: FiltrosPOS;
  setFiltros: (filtros: FiltrosPOS) => void;
  categoriasUnicas: string[];
}

export default function CabeceraTablaProductos({
  productosLength,
  ordenamiento,
  filtros,
  setFiltros,
  categoriasUnicas,
}: CabeceraTablaProductosProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-foreground">{productosLength} productos</span>
        {ordenamiento !== 'relevancia' && (
          <>
            <div className="w-px h-4 bg-gray-200 dark:bg-dark-border"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Ordenado por: <strong className="text-brand-600 dark:text-brand-400">{
                ordenamiento === 'masVendidos' ? 'Más vendidos' :
                  ordenamiento === 'menosVendidos' ? 'Menos vendidos' :
                    'Actividad reciente'
              }</strong>
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-1 xl:flex-none justify-start xl:justify-center">
        <MultiSelect
          label="Categoría"
          icon={Tag}
          opciones={categoriasUnicas}
          seleccionadas={filtros.categorias}
          onChange={(cats) => setFiltros({ ...filtros, categorias: cats })}
          variant="pill"
          size="small"
        />

        <button
          title="Filtrar stock bajo"
          onClick={() => setFiltros({ ...filtros, estadoStock: filtros.estadoStock === 'stockBajo' ? 'todos' : 'stockBajo' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${filtros.estadoStock === 'stockBajo'
            ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-300'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
        >
          <AlertCircle size={14} className={filtros.estadoStock === 'stockBajo' ? '' : 'text-slate-400 dark:text-slate-500'} /> Stock Bajo
        </button>
        <button
          title="Filtrar agotados"
          onClick={() => setFiltros({ ...filtros, estadoStock: filtros.estadoStock === 'agotados' ? 'todos' : 'agotados' })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${filtros.estadoStock === 'agotados'
            ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
        >
          <XCircle size={14} className={filtros.estadoStock === 'agotados' ? '' : 'text-slate-400 dark:text-slate-500'} /> Agotados
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 dark:border-dark-border rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm active:scale-95">
          <Upload size={16} /> Cargar
        </button>
        <button className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 dark:border-dark-border rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm active:scale-95">
          <Download size={16} /> Descargar
        </button>
      </div>
    </div>
  );
}
