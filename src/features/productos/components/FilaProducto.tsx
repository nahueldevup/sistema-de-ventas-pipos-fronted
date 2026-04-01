import type { Producto } from '@/types/producto.types';
import { getCategoriaColor, formatearPesos, getRowBg } from '@/lib/productoUtils';
import MenuOpcionesProducto from './MenuOpcionesProducto';
import { ArrowUpRight, ImageOff } from 'lucide-react';

interface FilaProductoProps {
  producto: Producto;
  index: number;
  estaSeleccionado: boolean;
  onToggleSeleccion: (id: string, checked: boolean) => void;
  menuAbiertoId: string | null;
  onAbrirMenu: (id: string) => void;
  onCerrarMenu: () => void;
  onEditar: (producto: Producto) => void;
}

export default function FilaProducto({
  producto,
  index,
  estaSeleccionado,
  onToggleSeleccion,
  menuAbiertoId,
  onAbrirMenu,
  onCerrarMenu,
  onEditar,
}: FilaProductoProps) {
  return (
    <tr
      className={`${getRowBg(index)} hover-fila transition-colors duration-150 group cursor-pointer`}
    >
      <td className="py-3 pl-6 pr-2">
        <input
          type="checkbox"
          aria-label={`Seleccionar producto ${producto.nombre}`}
          className="rounded border-gray-300 dark:border-slate-600 w-4 h-4 cursor-pointer accent-brand-600"
          checked={estaSeleccionado}
          onChange={(e) => onToggleSeleccion(producto.id, e.target.checked)}
        />
      </td>

      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-lg cursor-zoom-in hover:scale-150 transition-transform origin-left z-10 border border-slate-200 dark:border-slate-700/60 shrink-0">
            <ImageOff className="w-5 h-5 opacity-50" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-slate-900 dark:text-slate-50">{producto.nombre}</span>
            <span className="text-sm text-slate-600 dark:text-slate-300 font-bold tracking-wide">{producto.codigo}</span>
          </div>
        </div>
      </td>

      <td className="py-3 px-2">
        <div className="flex flex-col items-center justify-center relative">
          <div className="relative group/stock">
            <input
              key={producto.existencia}
              type="number"
              title="Clic para editar stock"
              aria-label={`Cantidad en stock de ${producto.nombre}`}
              defaultValue={producto.existencia}
              className={`w-14 h-9 text-center font-bold outline-none text-sm rounded-lg border shadow-sm transition-all bg-white dark:bg-dark-card cursor-text hover:bg-gray-50 dark:hover:bg-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${producto.existencia <= 0
                  ? 'border-red-300 hover:border-red-400 dark:border-red-500/50 text-red-600 dark:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : producto.existencia <= 5
                    ? 'border-amber-300 hover:border-amber-400 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                }`}
            />
            <div className={`absolute -right-2 -top-2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-card shadow-sm z-10 ${producto.existencia <= 0
                ? 'bg-red-500 animate-pulse'
                : producto.existencia <= 5
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`} title={producto.existencia <= 0 ? 'Stock agotado' : producto.existencia <= 5 ? 'Nivel de stock bajo' : 'Stock en nivel normal'} />
            {producto.existencia <= 5 && (
              <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${producto.existencia <= 0
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-amber-500 dark:text-amber-400'
                }`}>
                {producto.existencia <= 0 ? 'Agotado' : 'Bajo'}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className="py-3 px-2 text-center">
        <input
          key={producto.precioVenta}
          type="text"
          title="Clic para editar precio final"
          aria-label={`Precio de venta de ${producto.nombre}`}
          defaultValue={formatearPesos(producto.precioVenta)}
          className="w-[105px] h-9 text-center px-1.5 font-bold outline-none text-[14px] rounded-lg border shadow-sm transition-all bg-white dark:bg-dark-card cursor-text hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </td>

      <td className="py-3 px-2 text-center">
        <input
          key={producto.precioCompra}
          type="text"
          title="Clic para editar costo"
          aria-label={`Precio de compra de ${producto.nombre}`}
          defaultValue={formatearPesos(producto.precioCompra)}
          className="w-[105px] h-9 text-center px-1.5 font-bold outline-none text-[14px] rounded-lg border shadow-sm transition-all bg-white dark:bg-dark-card cursor-text hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </td>

      <td className="py-3 px-2">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-green-700 dark:text-green-500 text-[14px] flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +{formatearPesos(producto.utilidad)}
          </span>
          <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
            ({producto.porcentaje}%)
          </span>
        </div>
      </td>

      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getCategoriaColor(producto.categoria)}`}></div>
          <span className="text-[14px] text-slate-600 dark:text-slate-300 font-medium">{producto.categoria}</span>
        </div>
      </td>

      <td className="py-3 pl-2 pr-8">
        <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">{producto.proveedor}</span>
      </td>

      <td
        className={`
        py-3 px-6 sticky right-0 transition-colors duration-150
        shadow-sticky-col
        ${menuAbiertoId === producto.id ? 'z-50' : 'z-10'}
      `}
        style={{ backgroundColor: 'inherit' }}
      >
        <MenuOpcionesProducto
          abierto={menuAbiertoId === producto.id}
          onOpen={() => onAbrirMenu(producto.id)}
          onClose={onCerrarMenu}
          onEdit={() => onEditar(producto)}
        />
      </td>
    </tr>
  );
}
