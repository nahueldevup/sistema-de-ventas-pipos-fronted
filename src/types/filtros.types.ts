export interface FiltrosPOS {
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

export type Ordenamiento = 'relevancia' | 'masVendidos' | 'menosVendidos' | 'actividadReciente';
