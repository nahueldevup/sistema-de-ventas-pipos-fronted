import { useState, useMemo, useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ImageOff, ArrowUpRight } from 'lucide-react';
import type { Product } from '@/schemas/product.schema';
import { getCategoriaColor, formatearPesos, getRowBg } from '@/lib/productoUtils';
import '@/types/table.types';
import MenuOpcionesTabla from './MenuOpcionesTabla';

// ─── Componente Principal: TablaProductos ────────────────────────────────────
export interface TablaProductosProps {
  productos: Product[];
  onEditar?: (producto: Product) => void;
  onBorrar?: (producto: Product) => void;
  onImprimir?: (producto: Product) => void;
}

const columnHelper = createColumnHelper<Product>();

export default function TablaProductos({ productos, onEditar, onBorrar, onImprimir }: TablaProductosProps) {
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);

  const handleCerrarMenu = useCallback(() => setMenuAbiertoId(null), []);

  const columns = useMemo(
    () => [
      // ── PRODUCTO (imagen + nombre + código) ──────────────────
      columnHelper.display({
        id: 'producto',
        header: 'PRODUCTO',
        cell: ({ row }) => {
          const p = row.original;
          const imagenSrc = p.image;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden cursor-zoom-in hover:scale-150 transition-transform origin-left z-10 border border-[#E5E7EB] dark:border-slate-700/60 shrink-0">
                {imagenSrc ? (
                  <img
                    src={imagenSrc}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <ImageOff className="w-5 h-5 text-[#6B7280] dark:text-slate-300 opacity-50" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#1F2937] dark:text-slate-50">{p.name}</span>
                <span className="text-sm text-[#6B7280] dark:text-slate-300 font-semibold tracking-wide">#{p.barcode || '-'}</span>
              </div>
            </div>
          );
        },
        meta: { className: 'py-3 pl-6 pr-2', headerClassName: 'py-4 pl-6 pr-2 min-w-[280px]' },
      }),

      // ── STOCK ACTUAL ─────────────────────────────────────────
      columnHelper.accessor('stock', {
        header: 'STOCK ACTUAL',
        cell: (info) => {
          const stock = info.getValue();
          const minStock = info.row.original.minStock || 5;
          const esAgotado = stock <= 0;
          const esBajo = !esAgotado && stock <= minStock;

          const inputClasses = esAgotado
            ? 'border-red-300 hover:border-red-400 dark:border-red-500/50 text-red-600 dark:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : esBajo
              ? 'border-amber-300 hover:border-amber-400 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              : 'border-[#E5E7EB] hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-[#1F2937] dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

          const dotColor = esAgotado
            ? 'bg-red-500 animate-pulse'
            : esBajo
              ? 'bg-amber-500'
              : 'bg-emerald-500';

          return (
            <div className="flex flex-col items-center justify-center relative">
              <div className="relative group/stock">
                <input
                  type="number"
                  title="Clic para editar stock"
                  defaultValue={stock}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.stopPropagation()}
                  className={`w-14 h-9 text-center font-semibold outline-none text-sm rounded-lg border transition-all bg-white dark:bg-dark-card cursor-text hover:bg-[#F3F4F6] dark:hover:bg-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${inputClasses}`}
                />
                <div
                  className={`absolute -right-2 -top-2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-card shadow-sm z-10 ${dotColor}`}
                  title={esAgotado ? 'Stock agotado' : esBajo ? 'Nivel de stock bajo' : 'Stock en nivel normal'}
                />
                {(esAgotado || esBajo) && (
                  <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                    esAgotado ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'
                  }`}>
                    {esAgotado ? 'Agotado' : 'Bajo'}
                  </span>
                )}
              </div>
            </div>
          );
        },
        meta: { className: 'py-3 px-2', headerClassName: 'py-4 px-2 text-center' },
      }),

      // ── PRECIO VENTA ─────────────────────────────────────────
      columnHelper.accessor('salePrice', {
        header: 'PRECIO VENTA',
        cell: (info) => (
          <input
            type="text"
            title="Clic para editar precio final"
            defaultValue={formatearPesos(info.getValue())}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => e.stopPropagation()}
            className="w-[105px] h-9 text-center px-1.5 font-semibold outline-none text-[14px] rounded-lg border transition-all bg-white dark:bg-dark-card cursor-text hover:bg-[#F3F4F6] dark:hover:bg-slate-800 border-[#E5E7EB] hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-[#1F2937] dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        ),
        meta: { className: 'py-3 px-2 text-center', headerClassName: 'py-4 px-2 text-center' },
      }),

      // ── PRECIO COSTO ─────────────────────────────────────────
      columnHelper.accessor('costPrice', {
        header: 'PRECIO COSTO',
        cell: (info) => (
          <input
            type="text"
            title="Clic para editar costo"
            defaultValue={formatearPesos(info.getValue())}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => e.stopPropagation()}
            className="w-[105px] h-9 text-center px-1.5 font-semibold outline-none text-[14px] rounded-lg border transition-all bg-white dark:bg-dark-card cursor-text hover:bg-[#F3F4F6] dark:hover:bg-slate-800 border-[#E5E7EB] hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-[#1F2937] dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        ),
        meta: { className: 'py-3 px-2 text-center', headerClassName: 'py-4 px-2 text-center' },
      }),

      // ── GANANCIA ─────────────────────────────────────────────
      columnHelper.display({
        id: 'ganancia',
        header: 'GANANCIA',
        cell: ({ row }) => {
          const p = row.original;
          const utilidad = p.salePrice - p.costPrice;
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-bold text-green-700 dark:text-green-500 text-[14px] flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{formatearPesos(utilidad)}
              </span>
              <span className="text-[13px] font-medium text-[#6B7280] dark:text-slate-400">
                ({p.profitMargin}%)
              </span>
            </div>
          );
        },
        meta: { className: 'py-3 px-2', headerClassName: 'py-4 px-2' },
      }),

      // ── CATEGORÍA ────────────────────────────────────────────
      columnHelper.accessor('categoryId', {
        header: 'CATEGORÍA',
        cell: (info) => {
          const cat = info.getValue() || 'Sin categoría';
          return (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getCategoriaColor(cat)}`} />
              <span className="text-[14px] text-[#6B7280] dark:text-slate-300 font-medium">{cat}</span>
            </div>
          );
        },
        meta: { className: 'py-3 px-2', headerClassName: 'py-4 px-2' },
      }),

      // ── PROVEEDOR ────────────────────────────────────────────
      columnHelper.accessor('supplierId', {
        header: 'PROVEEDOR',
        cell: (info) => (
          <span className="text-[15px] font-medium text-[#1F2937] dark:text-slate-200">{info.getValue() || 'Sin proveedor'}</span>
        ),
        meta: { className: 'py-3 pl-2 pr-8', headerClassName: 'py-4 pl-2 pr-8 min-w-[140px]' },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: productos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 68,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
    : 0;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden flex flex-col">

      {productos.length === 0 ? (
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-table-header border-b-2 border-border tracking-wider">
              <tr>
                <th className="py-4 pl-6 pr-2 min-w-[280px]">PRODUCTO</th>
                <th className="py-4 px-2 text-center">STOCK ACTUAL</th>
                <th className="py-4 px-2 text-center">PRECIO VENTA</th>
                <th className="py-4 px-2 text-center">PRECIO COSTO</th>
                <th className="py-4 px-2">GANANCIA</th>
                <th className="py-4 px-2">CATEGORÍA</th>
                <th className="py-4 pl-2 pr-8 min-w-[140px]">PROVEEDOR</th>
                <th className="py-4 px-6 text-center sticky right-0 bg-table-header shadow-sticky-col z-20 border-b-2 border-border">OPCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="text-center py-10 text-base text-slate-600 dark:text-slate-300">
                  No se encontraron productos con los filtros aplicados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={tableContainerRef}
          className="overflow-auto max-h-[600px] relative w-full styled-scrollbar"
        >
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-30 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-table-header border-b-2 border-border tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const headerMeta = header.column.columnDef.meta?.headerClassName;
                    return (
                      <th key={header.id} className={headerMeta || 'py-4 px-2'}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                  {onEditar && (
                    <th className="py-4 px-6 text-center sticky right-0 bg-table-header shadow-sticky-col z-20 border-b-2 border-border">
                      OPCIONES
                    </th>
                  )}
                </tr>
              ))}
            </thead>

            <tbody className="relative">
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} colSpan={columns.length + (onEditar ? 1 : 0)} />
                </tr>
              )}

              {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index];
                const p = row.original;
                const isMenuAbierto = menuAbiertoId === p.id;

                return (
                  <tr
                    key={row.id}
                    ref={rowVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    className={`${getRowBg(virtualRow.index)} hover-fila transition-colors duration-150 group cursor-pointer`}
                    onClick={() => onEditar?.(p)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellMeta = cell.column.columnDef.meta?.className;
                      return (
                        <td key={cell.id} className={cellMeta || 'py-3 px-2'}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                    {onEditar && (
                      <td
                        className={`py-3 px-6 sticky right-0 transition-colors duration-150 shadow-sticky-col ${
                          isMenuAbierto ? 'z-50' : 'z-10'
                        }`}
                        style={{ backgroundColor: 'inherit' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MenuOpcionesTabla
                          abierto={isMenuAbierto}
                          onOpen={() => setMenuAbiertoId(p.id!)}
                          onClose={handleCerrarMenu}
                          onEdit={() => onEditar(p)}
                          onDelete={onBorrar ? () => onBorrar(p) : undefined}
                          onPrint={onImprimir ? () => onImprimir(p) : undefined}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}

              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} colSpan={columns.length + (onEditar ? 1 : 0)} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
