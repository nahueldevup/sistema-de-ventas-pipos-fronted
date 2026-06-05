import { useState, memo } from 'react';
import { ImageOff } from 'lucide-react';
import type { Product } from '@/schemas/product.schema';
import { formatearPesos } from '@/lib/ventaUtils';

interface CardProductoVentaProps {
  producto: Product;
  onAgregar: (producto: Product) => void;
  enCarrito: boolean;
}

export default memo(function CardProductoVenta({ producto, onAgregar, enCarrito }: CardProductoVentaProps) {
  const [imgError, setImgError] = useState(false);
  const [animando, setAnimando] = useState(false);

  const agotado = producto.stock <= 0;
  const stockBajo = !agotado && producto.stock <= (producto.minStock || 5);
  const imagenSrc = !imgError ? producto.image : undefined;

  const handleClick = () => {
    if (agotado) return;
    setAnimando(true);
    onAgregar(producto);
    setTimeout(() => setAnimando(false), 300);
  };

  // Color del indicador de stock
  const stockDot = agotado
    ? 'bg-red-500 animate-pulse'
    : stockBajo
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={agotado}
      title={agotado ? 'Sin stock disponible' : `Agregar ${producto.name} al carrito`}
      className={`
        relative flex flex-col bg-card border border-border rounded-xl overflow-hidden
        transition-all duration-200 ease-out text-left cursor-pointer group
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

        {/* Indicador de stock */}
        <div
          className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-card ${stockDot}`}
          title={agotado ? 'Agotado' : stockBajo ? `Stock bajo: ${producto.stock}` : `Stock: ${producto.stock}`}
        />

        {/* Badge "En carrito" */}
        {enCarrito && !agotado && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-bold">
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 p-2.5 flex-1 min-w-0">
        <span
          className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate break-words"
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
