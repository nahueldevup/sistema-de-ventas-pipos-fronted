import { useState, memo } from 'react';
import { ImageOff } from 'lucide-react';
import type { Product } from '@/schemas/product.schema';
import { formatearPesos } from '@/utils/venta.utils';
import { cn } from '@/lib/utils';

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
  const stockBajo = !agotado && producto.stock < 5;
  const imagenSrc = !imgError ? producto.image : undefined;

  const handleClick = () => {
    if (agotado) return;
    setAnimando(true);
    onAgregar(producto);
    setTimeout(() => setAnimando(false), 150);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={agotado}
      title={agotado ? 'Sin stock disponible' : `Agregar ${producto.name} al carrito`}
      className={cn(
        'relative flex flex-col bg-card border border-border rounded-lg overflow-hidden text-left cursor-pointer group',
        'transition-all duration-100 ease-out shadow-sm',
        agotado
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:-translate-y-px active:translate-y-0 active:shadow-sm hover:border-brand-300 dark:hover:border-brand-700',
        animando && 'scale-[0.97] ring-2 ring-brand-400',
        enCarrito && 'ring-1 ring-brand-400 border-brand-400 dark:ring-brand-600 dark:border-brand-600',
      )}
    >
      {/* Zona de imagen — ratio 1:1 con imagen absoluta */}
      <div className="relative w-full" style={{ paddingTop: '100%' }}>
        <div className="absolute inset-0 bg-white dark:bg-slate-900">
          {imagenSrc ? (
            <img
              src={imagenSrc}
              alt={producto.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        {/* Badge cantidad en carrito */}
        {enCarrito && !agotado && cantidadEnCarrito > 0 && (
          <div className="absolute top-1.5 left-1.5 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm z-10">
            {cantidadEnCarrito}
          </div>
        )}

        {/* Badge stock — siempre visible, 3 estados */}
        <div className={cn(
          'absolute top-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm z-10',
          agotado
            ? 'bg-red-500/90 text-white'
            : stockBajo
              ? 'bg-amber-400/90 text-amber-900'
              : 'bg-teal-600/70 text-white',
        )}>
          {agotado
            ? 'Agotado'
            : stockBajo
              ? `${producto.stock} queda${producto.stock > 1 ? 'n' : ''}`
              : `${producto.stock} en stock`
          }
        </div>
      </div>

      {/* Info */}
      <div className="p-2 flex flex-col gap-1 flex-1">
        <span
          className="text-[12px] font-medium text-slate-700 dark:text-slate-200 leading-tight line-clamp-2 break-words min-h-[2.5rem]"
          title={producto.name}
        >
          {producto.name}
        </span>
        <span className="text-[14px] font-bold text-brand-700 dark:text-brand-400 leading-none mt-auto pt-0.5">
          {formatearPesos(producto.salePrice)}
        </span>
      </div>
    </button>
  );
});
