import { useState, useCallback, useMemo } from 'react';
import type { Product } from '@/schemas/product.schema';
import type { CarritoItem } from '../hooks/useCarrito';
import BuscadorProductos from './BuscadorProductos';
import CardProductoVenta from './CardProductoVenta';
import { Package } from 'lucide-react';

interface GrillaProductosVentaProps {
  productos: Product[];
  carritoItems: CarritoItem[];
  onAgregarProducto: (producto: Product) => void;
}

export default function GrillaProductosVenta({
  productos,
  carritoItems,
  onAgregarProducto,
}: GrillaProductosVentaProps) {
  const [productosFiltrados, setProductosFiltrados] = useState<Product[]>(productos);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todos');

  // Extraer categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set<string>();
    productos.forEach((p) => {
      if (p.categoryId) cats.add(p.categoryId);
    });
    return ['Todos', ...Array.from(cats).sort()];
  }, [productos]);

  // IDs de productos en el carrito para marcar visualmente
  const idsEnCarrito = useMemo(
    () => new Set(carritoItems.map((item) => item.productId)),
    [carritoItems]
  );

  // Filtrar por categoría y búsqueda
  const productosVisibles = useMemo(() => {
    if (categoriaActiva === 'Todos') return productosFiltrados;
    return productosFiltrados.filter((p) => p.categoryId === categoriaActiva);
  }, [productosFiltrados, categoriaActiva]);

  const handleResultados = useCallback(
    (resultados: Product[]) => setProductosFiltrados(resultados),
    []
  );

  const handleAgregarDirecto = useCallback(
    (producto: Product) => {
      if (producto.stock > 0) {
        onAgregarProducto(producto);
      }
    },
    [onAgregarProducto]
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Buscador */}
      <BuscadorProductos
        productos={productos}
        onResultados={handleResultados}
        onAgregarDirecto={handleAgregarDirecto}
      />

      {/* Chips de categorías */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoriaActiva(cat)}
            className={`
              shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold
              border transition-all duration-150 cursor-pointer
              ${categoriaActiva === cat
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-card text-slate-600 dark:text-slate-300 border-border hover:border-brand-400 hover:text-brand-700 dark:hover:text-brand-400'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla de productos */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {productosVisibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {productosVisibles.map((producto) => (
              <CardProductoVenta
                key={producto.id}
                producto={producto}
                onAgregar={onAgregarProducto}
                enCarrito={idsEnCarrito.has(producto.id!)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
