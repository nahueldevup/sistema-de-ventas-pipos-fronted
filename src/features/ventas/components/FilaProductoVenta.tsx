import { useState, useCallback, memo } from 'react';
import { ImageOff, Plus, Loader2 } from 'lucide-react';
import type { Product } from '@/schemas/product.schema';
import { formatearPesos } from '@/lib/ventaUtils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilaProductoVentaProps {
  producto: Product;
  onAgregar: (producto: Product) => void;
  enCarrito: boolean;
  cantidadEnCarrito?: number;
}

export default memo(function FilaProductoVenta({ producto, onAgregar, enCarrito, cantidadEnCarrito = 0 }: FilaProductoVentaProps) {
  const [imgError, setImgError] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [loading, setLoading] = useState(false);

  const agotado = producto.stock <= 0;
  const stockBajo = !agotado && producto.stock < 5;
  const imagenSrc = !imgError ? producto.image : undefined;



  const handleAgregar = useCallback(() => {
    if (agotado || loading) return;
    setAnimando(true);
    setLoading(true);
    onAgregar(producto);
    setTimeout(() => {
      setAnimando(false);
      setLoading(false);
    }, 180);
  }, [agotado, loading, onAgregar, producto]);

  // Click en el botón +: ejecuta la acción y frena propagación al contenedor
  const handleBotonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleAgregar();
  }, [handleAgregar]);

  return (
    <div
      onClick={handleAgregar}
      className={cn(
        "group flex items-center gap-4 bg-card border border-border p-3 rounded-xl shadow-sm transition-all duration-150",
        agotado ? "opacity-50 cursor-not-allowed" : "hover:border-brand-400 hover:shadow-sm cursor-pointer",
        animando ? "scale-[0.99]" : "",
        enCarrito ? "ring-1 ring-brand-300 dark:ring-brand-600 bg-brand-50/10" : ""
      )}
    >
      {/* Imagen */}
      <div className="relative w-20 h-20 shrink-0 bg-white dark:bg-slate-900 rounded-lg border border-border">
        {imagenSrc ? (
          <img
            src={imagenSrc}
            alt={producto.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-0.5 rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        {/* Badge numérico de cantidad en carrito */}
        {enCarrito && !agotado && cantidadEnCarrito > 0 && (
          <div className="absolute -top-1.5 -left-1.5 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm z-10">
            {cantidadEnCarrito}
          </div>
        )}
      </div>

      {/* Info Principal */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-sm font-semibold text-foreground truncate" title={producto.name}>
          {producto.name}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="text-muted-foreground font-mono">
            {producto.barcode || producto.sku || 'Sin cód.'}
          </span>
          {/* Indicador de stock — siempre con cantidad, color según nivel */}
          {agotado ? (
            <div className="flex items-center gap-1 font-semibold text-red-400">
              <span>●</span>
              <span>Agotado</span>
            </div>
          ) : stockBajo ? (
            <div className="flex items-center gap-1 font-semibold text-amber-400">
              <span>●</span>
              <span>{producto.stock} Disponibles</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 font-medium text-slate-400 dark:text-slate-500">
              <span className="text-emerald-400">●</span>
              <span>{producto.stock} Disponibles</span>
            </div>
          )}
        </div>
      </div>

      {/* Precio y Acción */}
      <div className="flex items-center gap-4 pl-4 border-l border-border">
        <div className="flex flex-col items-end min-w-[90px]">
          <span className="text-xs text-muted-foreground">Precio Unit.</span>
          <span className="text-base font-bold text-brand-600 dark:text-brand-400">
            {formatearPesos(producto.salePrice)}
          </span>
        </div>
        
        <Button
          onClick={handleBotonClick}
          disabled={agotado || loading}
          variant="default"
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl transition-all bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
            animando ? "scale-90" : "scale-100"
          )}
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Plus className="h-5 w-5" />
          }
        </Button>
      </div>
    </div>
  );
});
