import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Package } from 'lucide-react';
import Fuse from 'fuse.js';
import type { Product } from '@/schemas/product.schema';
import type { CarritoItem } from '../hooks/useCarrito';
import CardProductoVenta from './CardProductoVenta';
import FilaProductoVenta from './FilaProductoVenta';
import { BarraHerramientasVentas } from './barra-herramientas-ventas';

interface GrillaProductosVentaProps {
  productos: Product[];
  carritoItems: CarritoItem[];
  onAgregarProducto: (producto: Product) => void;
  isCajaAbierta: boolean;
  onAbrirCajaClick: () => void;
  onCerrarCajaClick: () => void;
}

export default function GrillaProductosVenta({
  productos,
  carritoItems,
  onAgregarProducto,
  isCajaAbierta,
  onAbrirCajaClick,
  onCerrarCajaClick,
}: GrillaProductosVentaProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [vista, setVista] = useState<'grilla' | 'fila'>('grilla');
  const [productosFiltrados, setProductosFiltrados] = useState<Product[]>(productos);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Extraer categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set<string>();
    productos.forEach((p) => {
      if (p.categoryId) cats.add(p.categoryId);
    });
    return Array.from(cats).sort().map(cat => ({
      id: cat,
      nombre: cat
    }));
  }, [productos]);

  // Cantidades de productos en el carrito
  const cantidadesEnCarrito = useMemo(() => {
    const map = new Map<string, number>();
    carritoItems.forEach((item) => {
      map.set(item.productId, (map.get(item.productId) || 0) + item.quantity);
    });
    return map;
  }, [carritoItems]);

  // Reordenar productos: los que están en el carrito primero (por orden de agregado),
  // luego el resto en su orden original
  const productosOrdenados = useMemo(() => {
    // IDs del carrito en orden de agregado
    const idsEnCarrito = carritoItems.map((item) => item.productId);
    const setEnCarrito = new Set(idsEnCarrito);

    // Productos en el carrito, ordenados según el orden del array del carrito
    const enCarrito = idsEnCarrito
      .map((id) => productosFiltrados.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);

    // Resto de productos en su orden original
    const resto = productosFiltrados.filter((p) => !setEnCarrito.has(p.id!));

    return [...enCarrito, ...resto];
  }, [productosFiltrados, carritoItems]);

  // Fuse.js para búsqueda fuzzy
  const fuse = useMemo(
    () =>
      new Fuse(productos, {
        keys: [
          { name: 'name', weight: 0.5 },
          { name: 'barcode', weight: 0.35 },
          { name: 'sku', weight: 0.15 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [productos]
  );

  // Filtrar productos combinando categoría y búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      let resultado = productos;

      // Filtrar por categorías seleccionadas si las hay
      if (categoriasSeleccionadas.length > 0) {
        resultado = resultado.filter(p => p.categoryId && categoriasSeleccionadas.includes(p.categoryId));
      }

      // Filtrar por búsqueda si no está vacía
      if (busqueda.trim()) {
        const query = busqueda.trim();
        // Intentar match exacto primero
        const matchExacto = resultado.find(
          (p) => p.barcode === query || p.sku === query
        );

        if (matchExacto) {
          if (matchExacto.stock > 0) {
            onAgregarProducto(matchExacto);
          }
          setBusqueda('');
          setProductosFiltrados(resultado); // Volver al estado anterior
          return;
        }

        // Si no, buscar fuzzy pero solo dentro de los filtrados por categoría
        // Podríamos usar el mismo fuse general y luego filtrar por categoría, 
        // o crear un mini fuse para esta lista. Para mejor performance y precisión, 
        // usamos Fuse general y cruzamos resultados.
        const resultadosBusqueda = fuse.search(query).map(r => r.item);

        if (categoriasSeleccionadas.length > 0) {
          resultado = resultadosBusqueda.filter(p => p.categoryId && categoriasSeleccionadas.includes(p.categoryId));
        } else {
          resultado = resultadosBusqueda;
        }
      }

      setProductosFiltrados(resultado);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda, categoriasSeleccionadas, productos, fuse, onAgregarProducto]);

  const handleToggleCategoria = useCallback((id: string) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }, []);

  const handleLimpiarCategorias = useCallback(() => {
    setCategoriasSeleccionadas([]);
  }, []);

  // Handlers para las nuevas funciones (A implementar en el futuro o delegar)
  const handleNuevoProductoClick = () => {
    console.log("Nuevo producto click");
    // TODO: Implementar lógica de nuevo producto si se requiere aquí
  };

  const handleDevolucionClick = () => {
    console.log("Devolución click");
    // TODO: Implementar lógica
  };

  const handleMontoManualClick = () => {
    console.log("Monto manual click");
    // TODO: Implementar lógica
  };

  const handleGastosIngresosClick = () => {
    console.log("Gastos e ingresos click");
    // TODO: Implementar lógica
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="shrink-0">
        <BarraHerramientasVentas
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          productos={productos}
          categorias={categorias}
          categoriasSeleccionadas={categoriasSeleccionadas}
          onToggleCategoria={handleToggleCategoria}
          onLimpiarCategorias={handleLimpiarCategorias}
          vista={vista}
          onVistaChange={setVista}
          onNuevoProductoClick={handleNuevoProductoClick}
          onDevolucionClick={handleDevolucionClick}
          onGastosIngresosClick={handleGastosIngresosClick}
          onMontoManualClick={handleMontoManualClick}
          isCajaAbierta={isCajaAbierta}
          onAbrirCajaClick={onAbrirCajaClick}
          onCerrarCajaClick={onCerrarCajaClick}
        />
      </div>

      {/* Grilla/Lista de productos */}
      <div className="flex-1 overflow-y-auto hide-scrollbar rounded-xl pt-2 -mt-2 px-2 -mx-2">
        {productosOrdenados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 h-full">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className={
            vista === 'grilla'
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4"
              : "flex flex-col gap-2 pb-4"
          }>
            {productosOrdenados.map((producto) => {
              const cantidad = cantidadesEnCarrito.get(producto.id!) || 0;
              const enCarrito = cantidad > 0;
              
              return vista === 'grilla' ? (
                <CardProductoVenta
                  key={producto.id}
                  producto={producto}
                  onAgregar={onAgregarProducto}
                  enCarrito={enCarrito}
                  cantidadEnCarrito={cantidad}
                />
              ) : (
                <FilaProductoVenta
                  key={producto.id}
                  producto={producto}
                  onAgregar={onAgregarProducto}
                  enCarrito={enCarrito}
                  cantidadEnCarrito={cantidad}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
