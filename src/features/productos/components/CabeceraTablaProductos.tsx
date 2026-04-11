import { Upload, Download, AlertCircle, XCircle, Filter, X } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import type { FiltrosRapidosTabla, Ordenamiento } from '@/types/filtros.types';

interface CabeceraTablaProductosProps {
  productosLength: number;
  ordenamiento: Ordenamiento;
  filtrosRapidos: FiltrosRapidosTabla;
  setFiltrosRapidos: (filtros: FiltrosRapidosTabla) => void;
  categoriasUnicas: string[];
}

export default function CabeceraTablaProductos({
  productosLength,
  ordenamiento,
  filtrosRapidos,
  setFiltrosRapidos,
  categoriasUnicas,
}: CabeceraTablaProductosProps) {
  const hayFiltrosActivos =
    filtrosRapidos.categorias.length > 0 ||
    filtrosRapidos.filtroStockBajo ||
    filtrosRapidos.filtroAgotados;

  const handleLimpiarFiltros = () => {
    setFiltrosRapidos({
      ...filtrosRapidos,
      categorias: [],
      filtroStockBajo: false,
      filtroAgotados: false,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-foreground">{productosLength} productos</span>

        {ordenamiento !== 'relevancia' && (
          <>
            <div className="w-px h-4 bg-slate-200 dark:bg-dark-border" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Ordenado por:{' '}
              <strong className="text-brand-600 dark:text-brand-400">
                {ordenamiento === 'masVendidos'
                  ? 'Más vendidos'
                  : ordenamiento === 'menosVendidos'
                    ? 'Menos vendidos'
                    : 'Actividad reciente'}
              </strong>
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-1 xl:flex-none justify-start xl:justify-center">
        <MultiSelect
          label="Categoría"
          labelAll="Todas las categorías"
          labelPlural="categorías"
          icon={Filter}
          opciones={categoriasUnicas}
          seleccionadas={filtrosRapidos.categorias}
          onChange={(cats) => setFiltrosRapidos({ ...filtrosRapidos, categorias: cats })}
          variant="pill"
          size="small"
        />

        <button
          type="button"
          title="Filtrar stock bajo"
          onClick={() =>
            setFiltrosRapidos({
              ...filtrosRapidos,
              filtroStockBajo: !filtrosRapidos.filtroStockBajo,
            })
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 ${
            filtrosRapidos.filtroStockBajo
              ? 'bg-white border-slate-300 text-amber-700 hover:bg-slate-50 dark:bg-dark-elevated dark:border-slate-600 dark:text-amber-300 dark:hover:bg-slate-800 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <AlertCircle
            size={14}
            className={
              filtrosRapidos.filtroStockBajo
                ? 'text-amber-600 dark:text-amber-300'
                : 'text-slate-500 dark:text-slate-400'
            }
          />
          Stock Bajo
        </button>

        <button
          type="button"
          title="Filtrar agotados"
          onClick={() =>
            setFiltrosRapidos({
              ...filtrosRapidos,
              filtroAgotados: !filtrosRapidos.filtroAgotados,
            })
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 ${
            filtrosRapidos.filtroAgotados
              ? 'bg-white border-slate-300 text-red-700 hover:bg-slate-50 dark:bg-dark-elevated dark:border-slate-600 dark:text-red-300 dark:hover:bg-slate-800 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <XCircle
            size={14}
            className={
              filtrosRapidos.filtroAgotados
                ? 'text-red-600 dark:text-red-300'
                : 'text-slate-500 dark:text-slate-400'
            }
          />
          Agotados
        </button>

        {hayFiltrosActivos && (
          <button
            type="button"
            title="Limpiar filtros de tabla"
            onClick={handleLimpiarFiltros}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-500/20"
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-200 dark:hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-slate-500/20"
        >
          <Upload size={16} /> Cargar
        </button>

        <button
          type="button"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-200 dark:hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-slate-500/20"
        >
          <Download size={16} /> Descargar
        </button>
      </div>
    </div>
  );
}