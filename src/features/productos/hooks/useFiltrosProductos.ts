import { useState, useMemo, useDeferredValue } from 'react';
import type { Product } from '@/schemas/product.schema';
import type {
  FiltrosAvanzados,
  FiltrosRapidosTabla,
  Ordenamiento,
} from '@/types/filtros.types';

export default function useFiltrosProductos(productos: Product[]) {
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>('relevancia');

  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosAvanzados>({
    busqueda: '',
    categorias: [],
    proveedores: [],
    filtroConStock: false,
    filtroStockBajo: false,
    filtroAgotados: false,
    filtroSinImagen: false,
    precioMin: '',
    precioMax: '',
    fechaCampo: 'actividad',
    fechaDesde: '',
    fechaHasta: '',
  });

  const [filtrosRapidos, setFiltrosRapidos] = useState<FiltrosRapidosTabla>({
    categorias: [],
    filtroStockBajo: false,
    filtroAgotados: false,
  });

  const deferredFiltrosAvanzados = useDeferredValue(filtrosAvanzados);
  const deferredFiltrosRapidos = useDeferredValue(filtrosRapidos);

  const productosFiltrados = useMemo(
    () =>
      productos
        .filter((producto) => {
          // ── Filtros avanzados ─────────────────────────────────────────────
          if (deferredFiltrosAvanzados.busqueda) {
            const term = deferredFiltrosAvanzados.busqueda.toLowerCase();
            const coincideNombre = producto.name.toLowerCase().includes(term);
            const coincideCodigo = (producto.barcode || '').toLowerCase().includes(term);

            if (!coincideNombre && !coincideCodigo) {
              return false;
            }
          }

          if (
            deferredFiltrosAvanzados.categorias.length > 0 &&
            !deferredFiltrosAvanzados.categorias.includes(producto.categoryId || '')
          ) {
            return false;
          }

          if (
            deferredFiltrosAvanzados.proveedores.length > 0 &&
            !deferredFiltrosAvanzados.proveedores.includes(producto.supplierId || '')
          ) {
            return false;
          }

          // Filtro "Con stock"
          if (deferredFiltrosAvanzados.filtroConStock && producto.stock <= 0) {
            return false;
          }

          // Stock avanzado combinable (stock bajo / agotados)
          if (deferredFiltrosAvanzados.filtroStockBajo || deferredFiltrosAvanzados.filtroAgotados) {
            const esStockBajo = producto.stock > 0 && producto.stock <= (producto.minStock || 5);
            const esAgotado = producto.stock === 0;

            if (deferredFiltrosAvanzados.filtroStockBajo && deferredFiltrosAvanzados.filtroAgotados) {
              if (!esStockBajo && !esAgotado) return false;
            } else if (deferredFiltrosAvanzados.filtroStockBajo) {
              if (!esStockBajo) return false;
            } else if (deferredFiltrosAvanzados.filtroAgotados) {
              if (!esAgotado) return false;
            }
          }

          // TODO: Filtro "Sin imagen" — activar cuando Producto tenga campo imagen
          // if (deferredFiltrosAvanzados.filtroSinImagen && producto.image) {
          //   return false;
          // }

          if (
            deferredFiltrosAvanzados.precioMin &&
            producto.salePrice < Number(deferredFiltrosAvanzados.precioMin)
          ) {
            return false;
          }

          if (
            deferredFiltrosAvanzados.precioMax &&
            producto.salePrice > Number(deferredFiltrosAvanzados.precioMax)
          ) {
            return false;
          }

          // Filtro por fechas — comparamos Dates con strings de input YYYY-MM-DD
          if (deferredFiltrosAvanzados.fechaDesde || deferredFiltrosAvanzados.fechaHasta) {
            // Usamos updatedAt como "actividad" y "modificación"; createdAt para "creación"
            const fechaProducto =
              deferredFiltrosAvanzados.fechaCampo === 'creacion'
                ? producto.createdAt
                : producto.updatedAt; // tanto 'actividad' como 'modificacion' usan updatedAt

            if (fechaProducto) {
              const fechaStr = fechaProducto instanceof Date
                ? fechaProducto.toISOString().slice(0, 10)
                : String(fechaProducto).slice(0, 10);

              if (deferredFiltrosAvanzados.fechaDesde && fechaStr < deferredFiltrosAvanzados.fechaDesde) {
                return false;
              }
              if (deferredFiltrosAvanzados.fechaHasta && fechaStr > deferredFiltrosAvanzados.fechaHasta) {
                return false;
              }
            }
          }

          // ── Filtros rápidos de tabla ──────────────────────────────────────
          if (
            deferredFiltrosRapidos.categorias.length > 0 &&
            !deferredFiltrosRapidos.categorias.includes(producto.categoryId || '')
          ) {
            return false;
          }

          if (deferredFiltrosRapidos.filtroStockBajo || deferredFiltrosRapidos.filtroAgotados) {
            const esStockBajo = producto.stock > 0 && producto.stock <= (producto.minStock || 5);
            const esAgotado = producto.stock === 0;

            if (deferredFiltrosRapidos.filtroStockBajo && deferredFiltrosRapidos.filtroAgotados) {
              if (!esStockBajo && !esAgotado) return false;
            } else if (deferredFiltrosRapidos.filtroStockBajo) {
              if (!esStockBajo) return false;
            } else if (deferredFiltrosRapidos.filtroAgotados) {
              if (!esAgotado) return false;
            }
          }

          return true;
        })
        .sort((a, b) => {
          switch (ordenamiento) {
            case 'actividadReciente': {
              const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
              const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
              return dateB - dateA;
            }
            default:
              return 0;
          }
        }),
    [productos, deferredFiltrosAvanzados, deferredFiltrosRapidos, ordenamiento]
  );

  const filtrosActivosCount = [
    filtrosAvanzados.categorias.length > 0,
    filtrosAvanzados.proveedores.length > 0,
    filtrosAvanzados.filtroConStock,
    filtrosAvanzados.filtroStockBajo,
    filtrosAvanzados.filtroAgotados,
    filtrosAvanzados.filtroSinImagen,
    filtrosAvanzados.precioMin !== '',
    filtrosAvanzados.precioMax !== '',
    filtrosAvanzados.fechaDesde !== '',
    filtrosAvanzados.fechaHasta !== '',
    ordenamiento !== 'relevancia',
  ].filter(Boolean).length;

  return {
    filtrosAvanzados,
    setFiltrosAvanzados,
    filtrosRapidos,
    setFiltrosRapidos,
    ordenamiento,
    setOrdenamiento,
    productosFiltrados,
    filtrosActivosCount,
  };
}