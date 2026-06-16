import { useState, memo } from 'react';
import { ImageOff } from 'lucide-react';
import type { Product } from '@/schemas/product.schema';
import { formatearPesos } from '@/lib/ventaUtils';

interface CardProductoVentaProps {
  producto: Product;
  onAgregar: (producto: Product) => void;
  enCarrito: boolean;
  cantidadEnCarrito?: number;
}

export default memo(function CardProductoVenta({ producto, onAgregar, enCarrito, cantidadEnCarrito = 0 }: CardProductoVentaProps) {
  const [imgError, setImgError] = useState(false);
  const [animando, setAnimando] = useState(false);

  const agotado = producto.stock <= 0;
  const stockBajo = !agotado && producto.stock <= (producto.minStock || 5);
  const imagenSrc = !imgError ? producto.image : undefined;

  const handleClick = () => {
    if (agotado) return;
    setAnimando(true);
    onAgregar(producto);
    setTimeout(() => setAnimando(false), 150);
  };

  // Color del indicador de stock según nivel
  const stockColor = agotado
    ? 'text-red-400'
    : stockBajo
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={agotado}
      title={agotado ? 'Sin stock disponible' : `Agregar ${producto.name} al carrito`}
      className={`
        relative flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-md
        transition-all duration-150 ease-out text-left cursor-pointer group
        ${agotado
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-brand-400 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-[0.97]'
        }
        ${animando ? 'scale-[0.95] ring-2 ring-brand-400' : ''}
        ${enCarrito ? 'ring-1 ring-brand-300 dark:ring-brand-600' : ''}
      `}
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-white dark:bg-slate-900 overflow-hidden">
        {imagenSrc ? (
          <img
            src={imagenSrc}
            alt={producto.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
        )}


        {/* Badge "En carrito" (Cantidad) */}
        {enCarrito && !agotado && cantidadEnCarrito > 0 && (
          <div className="absolute top-1.5 left-1.5 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
            {cantidadEnCarrito}
          </div>
        )}
      </div>

      {/* Indicador de stock */}
      <div className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold tracking-wide border-t border-black/5 dark:border-white/[0.09] ${stockColor}`}>
        <span>●</span>
        <span>{producto.stock} Disponibles</span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 px-2.5 pt-1 pb-2.5 flex-1 min-w-0 border-t border-black/5 dark:border-white/[0.09]">
        <span
          className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2 break-words h-[2.03rem] overflow-hidden"
          title={producto.name}
        >
          {producto.name}
        </span>
        <span className="text-[16px] font-bold text-brand-700 dark:text-brand-400">
          {formatearPesos(producto.salePrice)}
        </span>
      </div>
    </button>
  );
});
