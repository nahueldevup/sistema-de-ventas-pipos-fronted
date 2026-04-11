import { useState, useMemo } from 'react';
import type { Producto } from '@/types/producto.types';
import type { FiltrosAvanzados, FiltrosRapidosTabla, Ordenamiento } from '@/types/filtros.types';

export default function useFiltrosProductos(productos: Producto[]) {
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>('relevancia');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosAvanzados>({
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

  const [filtrosRapidos, setFiltrosRapidos] = useState<FiltrosRapidosTabla>({
    categorias: [],
    filtroStockBajo: false,
    filtroAgotados: false,
  });

  const productosFiltrados = useMemo(() =>
    productos
      .filter(producto => {
        // --- Filtros Avanzados ---
        if (filtrosAvanzados.busqueda) {
          const term = filtrosAvanzados.busqueda.toLowerCase();
          if (!producto.nombre.toLowerCase().includes(term) && !(producto.codigo || '').toLowerCase().includes(term)) {
            return false;
          }
        }
        if (filtrosAvanzados.categorias.length > 0 && !filtrosAvanzados.categorias.includes(producto.categoria)) return false;
        if (filtrosAvanzados.proveedores.length > 0 && !filtrosAvanzados.proveedores.includes(producto.proveedor)) return false;
        if (filtrosAvanzados.estadoStock === 'enStock' && producto.existencia <= 0) return false;
        if (filtrosAvanzados.estadoStock === 'stockBajo' && (producto.existencia > 5 || producto.existencia === 0)) return false;
        if (filtrosAvanzados.estadoStock === 'agotados' && producto.existencia > 0) return false;
        
        if (filtrosAvanzados.precioMin && producto.precioVenta < Number(filtrosAvanzados.precioMin)) return false;
        if (filtrosAvanzados.precioMax && producto.precioVenta > Number(filtrosAvanzados.precioMax)) return false;
        if (filtrosAvanzados.fechaDesde || filtrosAvanzados.fechaHasta) {
          if (filtrosAvanzados.fechaCampo === 'actividad') {
            const act = producto.ultimaActividad || producto.fechaModificacion || producto.fechaCreacion;
            const pasaAct = (!filtrosAvanzados.fechaDesde || act >= filtrosAvanzados.fechaDesde) && (!filtrosAvanzados.fechaHasta || act <= filtrosAvanzados.fechaHasta);
            if (!pasaAct) return false;
          } else {
            const fechaProducto = filtrosAvanzados.fechaCampo === 'creacion' ? producto.fechaCreacion : producto.fechaModificacion;
            if (filtrosAvanzados.fechaDesde && fechaProducto < filtrosAvanzados.fechaDesde) return false;
            if (filtrosAvanzados.fechaHasta && fechaProducto > filtrosAvanzados.fechaHasta) return false;
          }
        }

        // --- Filtros Rapidos de Tabla ---
        if (filtrosRapidos.categorias.length > 0 && !filtrosRapidos.categorias.includes(producto.categoria)) return false;
        
        if (filtrosRapidos.filtroStockBajo || filtrosRapidos.filtroAgotados) {
          const esStockBajo = producto.existencia > 0 && producto.existencia <= 5;
          const esAgotado = producto.existencia === 0;
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
          case 'masVendidos': return b.ventasTotales - a.ventasTotales;
          case 'menosVendidos': return a.ventasTotales - b.ventasTotales;
          case 'actividadReciente': return (b.ultimaActividad || '').localeCompare(a.ultimaActividad || '');
          default: return 0;
        }
      }),
    [productos, filtrosAvanzados, filtrosRapidos, ordenamiento]
  );

  const filtrosActivosCount = [
    filtrosAvanzados.categorias.length > 0,
    filtrosAvanzados.proveedores.length > 0,
    filtrosAvanzados.estadoStock !== 'todos',
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
