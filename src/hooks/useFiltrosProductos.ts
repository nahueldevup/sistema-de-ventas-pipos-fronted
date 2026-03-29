import { useState, useMemo } from 'react';
import type { Producto } from '@/types/producto.types';
import type { FiltrosPOS, Ordenamiento } from '@/types/filtros.types';

export default function useFiltrosProductos(productos: Producto[]) {
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>('relevancia');
  const [filtros, setFiltros] = useState<FiltrosPOS>({
    busqueda: '',
    categorias: [],
    proveedores: [],
    estadoStock: 'todos',
    precioMin: '',
    precioMax: '',
    fechaCampo: 'actividad',
    fechaDesde: '',
    fechaHasta: '',
  });

  const productosFiltrados = useMemo(() =>
    productos
      .filter(producto => {
        if (filtros.busqueda) {
          const term = filtros.busqueda.toLowerCase();
          if (!producto.nombre.toLowerCase().includes(term) && !(producto.codigo || '').toLowerCase().includes(term)) {
            return false;
          }
        }
        if (filtros.categorias.length > 0 && !filtros.categorias.includes(producto.categoria)) return false;
        if (filtros.proveedores.length > 0 && !filtros.proveedores.includes(producto.proveedor)) return false;
        if (filtros.estadoStock === 'enStock' && producto.existencia <= 0) return false;
        if (filtros.estadoStock === 'stockBajo' && (producto.existencia > 5 || producto.existencia === 0)) return false;
        if (filtros.estadoStock === 'agotados' && producto.existencia > 0) return false;
        if (filtros.precioMin && producto.precioVenta < Number(filtros.precioMin)) return false;
        if (filtros.precioMax && producto.precioVenta > Number(filtros.precioMax)) return false;
        if (filtros.fechaDesde || filtros.fechaHasta) {
          if (filtros.fechaCampo === 'actividad') {
            const act = producto.ultimaActividad || producto.fechaModificacion || producto.fechaCreacion;
            const pasaAct = (!filtros.fechaDesde || act >= filtros.fechaDesde) && (!filtros.fechaHasta || act <= filtros.fechaHasta);
            if (!pasaAct) return false;
          } else {
            const fechaProducto = filtros.fechaCampo === 'creacion' ? producto.fechaCreacion : producto.fechaModificacion;
            if (filtros.fechaDesde && fechaProducto < filtros.fechaDesde) return false;
            if (filtros.fechaHasta && fechaProducto > filtros.fechaHasta) return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (ordenamiento) {
          case 'masVendidos': return b.ventasTotales - a.ventasTotales;
          case 'menosVendidos': return a.ventasTotales - b.ventasTotales;
          case 'actividadReciente': return (b.ultimaActividad || '').localeCompare(a.ultimaActividad || '');
          default: return 0;
        }
      }),
    [productos, filtros, ordenamiento]
  );

  const filtrosActivosCount = [
    filtros.categorias.length > 0,
    filtros.proveedores.length > 0,
    filtros.estadoStock !== 'todos',
    filtros.precioMin !== '',
    filtros.precioMax !== '',
    filtros.fechaDesde !== '',
    filtros.fechaHasta !== '',
    ordenamiento !== 'relevancia',
  ].filter(Boolean).length;

  return {
    filtros,
    setFiltros,
    ordenamiento,
    setOrdenamiento,
    productosFiltrados,
    filtrosActivosCount,
  };
}
