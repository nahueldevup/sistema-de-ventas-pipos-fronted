export interface FiltrosAvanzados {
  busqueda: string;
  categorias: string[];
  proveedores: string[];
  estadoStock: 'todos' | 'enStock' | 'stockBajo' | 'agotados';
  precioMin: string;
  precioMax: string;
  fechaCampo: 'actividad' | 'creacion' | 'modificacion';
  fechaDesde: string;
  fechaHasta: string;
}

export interface FiltrosRapidosTabla {
  categorias: string[];
  filtroStockBajo: boolean;
  filtroAgotados: boolean;
}

export type Ordenamiento = 'relevancia' | 'masVendidos' | 'menosVendidos' | 'actividadReciente';
