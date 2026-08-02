/**
 * Hook de permisos — Modo admin/dueño (todo habilitado).
 *
 * Cuando se integre el backend real con JWT y RBAC, este hook
 * decodificará el token y devolverá los permisos reales del usuario.
 * Por ahora, cada permiso retorna `true` para no bloquear funcionalidad.
 */

// Lista centralizada de permisos del sistema
export type Permiso =
  | 'APLICAR_DESCUENTOS'
  | 'APLICAR_DESCUENTO_ALTO'
  | 'ANULAR_VENTA'
  | 'REIMPRIMIR_TICKET'
  | 'ABRIR_CAJA'
  | 'CERRAR_CAJA'
  | 'REGISTRAR_GASTO'
  | 'GESTIONAR_FIADOS'
  | 'VER_COSTOS'
  | 'VENDER_SIN_STOCK'
  | 'REGISTRAR_DEVOLUCION'
  | 'REGISTRAR_CAMBIO'
  | 'DEVOLVER_DINERO'
  | 'DEVOLVER_A_SALDO'
  | 'REGISTRAR_MERMA'
  | 'REGISTRAR_PAGO_PROVEEDOR'
  | 'AJUSTAR_CAJA'
  | 'VER_TODAS_LAS_VENTAS_TURNO';

export function usePermisos() {
  // En modo mock, todos los permisos están habilitados
  const hasPermission = (_permiso: Permiso): boolean => {
    return true;
  };

  return { hasPermission };
}
