import { useState } from 'react';
import type { Producto } from '@/types/producto.types';
import type { FiltrosPOS, Ordenamiento } from '@/types/filtros.types';
import CabeceraTablaProductos from './CabeceraTablaProductos';
import PaginacionTabla from './PaginacionTabla';
import FilaProducto from './FilaProducto';

interface TablaProductosProps {
  productos: Producto[];
  onEditar: (producto: Producto) => void;
  ordenamiento: Ordenamiento;
  filtros: FiltrosPOS;
  setFiltros: (filtros: FiltrosPOS) => void;
  categoriasUnicas: string[];
}

export default function TablaProductos({
  productos,
  onEditar,
  ordenamiento,
  filtros,
  setFiltros,
  categoriasUnicas,
}: TablaProductosProps) {
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden flex flex-col">

      <CabeceraTablaProductos
        productosLength={productos.length}
        ordenamiento={ordenamiento}
        filtros={filtros}
        setFiltros={setFiltros}
        categoriasUnicas={categoriasUnicas}
      />

      {/* Tabla */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-table-header border-b-2 border-border tracking-wider">
            <tr>
              <th className="py-4 pl-6 pr-2 min-w-[280px]">PRODUCTO</th>
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
                menuAbiertoId={menuAbiertoId}
                onAbrirMenu={(id) => setMenuAbiertoId(id)}
                onCerrarMenu={() => setMenuAbiertoId(null)}
                onEditar={onEditar}
              />
            ))}

            {productos.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-base text-slate-600 dark:text-slate-300">
                  No se encontraron productos con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PIE DE PÁGINA: Paginación */}
      <PaginacionTabla totalProductos={productos.length} />

    </div>
  );
}
