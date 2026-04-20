/**
 * Mapa dinámico de id de producto → URL de imagen de prueba.
 *
 * Usa import.meta.glob para importar todas las imágenes de
 * src/assets/productsImage/ y las rota cíclicamente entre los
 * IDs del 1 al 40 (PRODUCTOS_EJEMPLO).
 */

// Importa todas las imágenes de la carpeta como URLs ya resueltas (eager)
const modulosImagenes: Record<string, string> = import.meta.glob(
  '@/assets/productsImage/*.{jpg,jpeg,png,webp,avif,gif}',
  { eager: true, import: 'default', query: '?url' },
) as Record<string, string>;

// Convertimos el record en un array de URLs para poder indexar por posición
const urlsImagenes: string[] = Object.values(modulosImagenes);

/**
 * Mapa id → url de imagen.
 * Rota las imágenes disponibles cíclicamente entre los 40 productos de ejemplo.
 */
export const IMAGENES_PRODUCTOS: Record<string, string> = {};

if (urlsImagenes.length > 0) {
  for (let i = 1; i <= 40; i++) {
    IMAGENES_PRODUCTOS[String(i)] = urlsImagenes[(i - 1) % urlsImagenes.length];
  }
}

/**
 * Devuelve la URL de imagen asociada a un producto, o undefined si no hay.
 */
export function getImagenProducto(id: string): string | undefined {
  return IMAGENES_PRODUCTOS[id];
}
