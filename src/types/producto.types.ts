export interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  proveedor: string;
  precioCompra: number;
  precioVenta: number;
  existencia: number;
  utilidad: number;
  porcentaje: number;
  unidadesPorBulto?: number;
  ventasTotales: number;
  fechaCreacion: string;
  fechaModificacion: string;
  ultimaActividad: string;
  tipoActividad: string;
}

export interface ProductoDatos {
  codigo: string;
  descripcion: string;
  categoria: string;
  proveedor?: string;
  precioCompra: string;
  precioVenta: string;
  existencia: string;
  stockMinimo: string;
}
