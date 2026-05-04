/**
 * Configuración centralizada para el entorno mock (desarrollo local).
 *
 * Cuando se integre Tauri + SQLite, estos valores vendrán del contexto
 * de autenticación del usuario logueado y de la base de datos local.
 */

/** ID de la sucursal por defecto en modo mock */
export const MOCK_STORE_ID = 'cm0abc1230000010000000000';

/** ID del usuario (cajero) por defecto en modo mock */
export const MOCK_USER_ID = 'cm0user1230000010000000000';

/** ID de la caja registradora por defecto en modo mock */
export const MOCK_CASH_REGISTER_ID = 'cm0caja1230000010000000000';
