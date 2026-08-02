import { useState, useMemo } from 'react';
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

  const productosFiltrados = useMemo(
    () =>
      productos
        .filter((producto) => {
          // ── Filtros avanzados ─────────────────────────────────────────────
          if (filtrosAvanzados.busqueda) {
            const term = filtrosAvanzados.busqueda.toLowerCase();
            const coincideNombre = producto.name.toLowerCase().includes(term);
            const coincideCodigo = (producto.barcode || '').toLowerCase().includes(term);

            if (!coincideNombre && !coincideCodigo) {
              return false;
            }
          }

          if (
            filtrosAvanzados.categorias.length > 0 &&
            !filtrosAvanzados.categorias.includes(producto.categoryId || '')
          ) {
            return false;
          }

          if (
            filtrosAvanzados.proveedores.length > 0 &&
            !filtrosAvanzados.proveedores.includes(producto.supplierId || '')
          ) {
            return false;
          }

          // Filtro "Con stock"
          if (filtrosAvanzados.filtroConStock && producto.stock <= 0) {
            return false;
          }

          // Stock avanzado combinable (stock bajo / agotados)
          if (filtrosAvanzados.filtroStockBajo || filtrosAvanzados.filtroAgotados) {
            const esStockBajo = producto.stock > 0 && producto.stock <= (producto.minStock || 5);
            const esAgotado = producto.stock === 0;

            if (filtrosAvanzados.filtroStockBajo && filtrosAvanzados.filtroAgotados) {
              if (!esStockBajo && !esAgotado) return false;
            } else if (filtrosAvanzados.filtroStockBajo) {
              if (!esStockBajo) return false;
            } else if (filtrosAvanzados.filtroAgotados) {
              if (!esAgotado) return false;
            }
          }

          // TODO: Filtro "Sin imagen" — activar cuando Producto tenga campo imagen
          // if (filtrosAvanzados.filtroSinImagen && producto.image) {
          //   return false;
          // }

          if (
            filtrosAvanzados.precioMin &&
            producto.salePrice < Number(filtrosAvanzados.precioMin)
          ) {
            return false;
          }

          if (
            filtrosAvanzados.precioMax &&
            producto.salePrice > Number(filtrosAvanzados.precioMax)
          ) {
            return false;
          }

          // Filtro por fechas — comparamos Dates con strings de input YYYY-MM-DD
          if (filtrosAvanzados.fechaDesde || filtrosAvanzados.fechaHasta) {
            // Usamos updatedAt como "actividad" y "modificación"; createdAt para "creación"
            const fechaProducto =
              filtrosAvanzados.fechaCampo === 'creacion'
                ? producto.createdAt
                : producto.updatedAt; // tanto 'actividad' como 'modificacion' usan updatedAt

            if (fechaProducto) {
              const fechaStr = fechaProducto instanceof Date
                ? fechaProducto.toISOString().slice(0, 10)
                : String(fechaProducto).slice(0, 10);

              if (filtrosAvanzados.fechaDesde && fechaStr < filtrosAvanzados.fechaDesde) {
                return false;
              }
              if (filtrosAvanzados.fechaHasta && fechaStr > filtrosAvanzados.fechaHasta) {
                return false;
              }
            }
          }

          // ── Filtros rápidos de tabla ──────────────────────────────────────
          if (
            filtrosRapidos.categorias.length > 0 &&
            !filtrosRapidos.categorias.includes(producto.categoryId || '')
          ) {
            return false;
          }

          if (filtrosRapidos.filtroStockBajo || filtrosRapidos.filtroAgotados) {
            const esStockBajo = producto.stock > 0 && producto.stock <= (producto.minStock || 5);
            const esAgotado = producto.stock === 0;

            if (filtrosRapidos.filtroStockBajo && filtrosRapidos.filtroAgotados) {
              if (!esStockBajo && !esAgotado) return false;
            } else if (filtrosRapidos.filtroStockBajo) {
              if (!esStockBajo) return false;
            } else if (filtrosRapidos.filtroAgotados) {
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
    [productos, filtrosAvanzados, filtrosRapidos, ordenamiento]
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