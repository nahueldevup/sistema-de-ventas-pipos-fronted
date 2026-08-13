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
        'relative flex flex-col rounded-[6px] overflow-hidden text-left cursor-pointer group bg-card',
        'transition-all duration-100 ease-out',
        'shadow-sm',
        // Estado base
        !enCarrito && 'border border-black/[0.09] dark:border-white/[0.08]',
        // Estado seleccionado — borde azul
        enCarrito && 'border-[2px] border-[#2563EB] dark:border-blue-500',
        agotado
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-[0_2px_16px_4px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_2px_16px_4px_rgba(0,0,0,0.45)] hover:-translate-y-px active:translate-y-0 active:shadow-sm',
        animando && 'scale-[0.97]',
      )}
    >
      {/* Zona de imagen — ratio 1:1 con imagen absoluta */}
      <div className="relative w-full" style={{ paddingTop: '100%' }}>
        {/* Fondo + imagen/fallback: el filtro de agotado se aplica acá
            (NO en el wrapper externo) para que los badges hermanos queden intactos */}
        <div
          className="absolute inset-0 bg-white dark:bg-slate-900"
          style={agotado ? { filter: 'grayscale(1) brightness(0.85)' } : undefined}
        >
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
          {/* Overlay de sombra interior — solo dark mode, encima de la imagen.
              z-[1] > imagen (auto), < badges (z-10). pointer-events-none para no bloquear clicks. */}
          <div
            className="absolute inset-0 hidden dark:block pointer-events-none z-[1]"
            style={{ boxShadow: 'inset 0 0 12px 4px rgba(15, 23, 42, 0.6)' }}
          />
        </div>

        {/* Badge check — esquina superior izquierda, azul oscuro #1E40AF
            Solo muestra "cuánto llevo". Sin stock acá. */}
        {enCarrito && !agotado && (
          <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 bg-[#1E40AF] text-white rounded-full pl-1.5 pr-2 py-0.5 shadow-md">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11px] font-bold leading-none">x{cantidadEnCarrito}</span>
          </div>
        )}

        {/* Badge stock — esquina superior derecha, paleta distinta al check
             Normal: celeste suave | Bajo: ámbar | Agotado: rojo */}
        <div className={cn(
          'absolute top-1.5 right-1.5 text-[10px] font-bold uppercase tracking-wide px-1 py-[3px] rounded-sm z-10',
          agotado
            ? 'bg-red-500/90 text-white'
            : stockBajo
              ? 'bg-amber-400/90 text-amber-900'
              : 'bg-[#E0F2FE] text-[#0369A1] dark:bg-sky-950/60 dark:text-sky-400',
        )}>
          {agotado ? 'Agotado' : `${producto.stock} en stock`}
        </div>
      </div>

      {/* Info — mismo filtro que la imagen cuando agotado */}
      <div
        className="p-2 flex flex-col gap-1 flex-1"
        style={agotado ? { filter: 'grayscale(1) brightness(0.85)' } : undefined}
      >
        {/* Nombre */}
        <span
          className="text-[14px] font-semibold text-[#111827] dark:text-slate-100 leading-snug line-clamp-2 break-words min-h-[2.5rem]"
          title={producto.name}
        >
          {producto.name.charAt(0).toUpperCase() + producto.name.slice(1).toLowerCase()}
        </span>

        {/* Precio: el que grita, eye-tracking foto→precio→stock */}
        <span className="text-[16px] font-bold text-[#059669] dark:text-emerald-400 leading-none mt-auto pt-0.5">
          {formatearPesos(producto.salePrice)}
        </span>
      </div>
    </button>
  );
});
