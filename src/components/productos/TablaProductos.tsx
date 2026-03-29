import { useState } from 'react';
import type { Producto } from '@/types/producto.types';
import type { FiltrosPOS, Ordenamiento } from '@/types/filtros.types';
import { MultiSelectDropdown } from '@/components/BarraFiltros';
import FilaProducto from '@/components/productos/FilaProducto';
import {
  Upload, Download, ChevronLeft, ChevronRight,
  AlertCircle, XCircle, Tag
} from 'lucide-react';

interface TablaProductosProps {
  productos: Producto[];
  seleccionados: string[];
  onSeleccionarTodos: (checked: boolean) => void;
  onToggleSeleccion: (id: string, checked: boolean) => void;
  onEditar: (producto: Producto) => void;
  ordenamiento: Ordenamiento;
  filtros: FiltrosPOS;
  setFiltros: (filtros: FiltrosPOS) => void;
  categoriasUnicas: string[];
}

export default function TablaProductos({
  productos,
  seleccionados,
  onSeleccionarTodos,
  onToggleSeleccion,
  onEditar,
  ordenamiento,
  filtros,
  setFiltros,
  categoriasUnicas,
}: TablaProductosProps) {
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden flex flex-col transition-colors duration-300">

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-foreground">{productos.length} productos</span>
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
          <MultiSelectDropdown
            label="Categoría"
            icon={Tag}
            opciones={categoriasUnicas}
            seleccionadas={filtros.categorias}
            onChange={(cats) => setFiltros({ ...filtros, categorias: cats })}
            variant="small"
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

      {/* Tabla */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-table-header border-b-2 border-border tracking-wider">
            <tr>
              <th className="py-4 pl-6 pr-2">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos los productos"
                  className="rounded border-gray-300 dark:border-slate-600 w-4 h-4 cursor-pointer accent-brand-600"
                  checked={seleccionados.length === productos.length && productos.length > 0}
                  onChange={(e) => onSeleccionarTodos(e.target.checked)}
                />
              </th>
              <th className="py-4 px-2 min-w-[280px]">PRODUCTO</th>
              <th className="py-4 px-2 text-center">STOCK ACTUAL</th>
              <th className="py-4 px-2 text-center">PRECIO FINAL</th>
              <th className="py-4 px-2 text-center">COSTO</th>
              <th className="py-4 px-2">GANANCIA</th>
              <th className="py-4 px-2">CATEGORÍA</th>
              <th className="py-4 pl-2 pr-8 min-w-[140px]">PROVEEDOR</th>
              <th className="py-4 px-6 text-center sticky right-0 bg-table-header shadow-sticky-col z-20 border-b-2 border-border">OPCIONES</th>
            </tr>
          </thead>

          <tbody className="relative">
            {productos.map((producto, index) => (
              <FilaProducto
                key={producto.id}
                producto={producto}
                index={index}
                estaSeleccionado={seleccionados.includes(producto.id)}
                onToggleSeleccion={onToggleSeleccion}
                menuAbiertoId={menuAbiertoId}
                onAbrirMenu={(id) => setMenuAbiertoId(id)}
                onCerrarMenu={() => setMenuAbiertoId(null)}
                onEditar={onEditar}
              />
            ))}

            {productos.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-base text-slate-600 dark:text-slate-300">
                  No se encontraron productos con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PIE DE PÁGINA: Paginación */}
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
          <span>Mostrando 1 - {productos.length} de {productos.length} productos</span>
        </div>
      </div>

    </div>
  );
}
