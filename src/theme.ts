/**
 * ╔══════════════════════════════════════════════════════╗
 * ║           PIPOS — CONFIGURACIÓN DE TEMA              ║
 * ║                                                      ║
 * ║  ¿Querés cambiar los colores de la app?              ║
 * ║  Este es el único archivo que necesitás tocar.       ║
 * ║                                                      ║
 * ║  Después de cambiar algo acá, los cambios se         ║
 * ║  aplican solos en toda la aplicación.                ║
 * ╚══════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────
// COLOR PRINCIPAL DE LA APP (el verde/teal de los botones)
// ─────────────────────────────────────────────────────────
// Formato: hsl(matiz saturación% luminosidad%)
//   matiz     → 0=rojo, 120=verde, 240=azul, 170=teal
//   saturación → qué tan "vivo" es el color (0% = gris)
//   luminosidad → qué tan claro/oscuro (0%=negro, 100%=blanco)
//
// Ejemplos para cambiar el color principal:
//   Azul:    "210 77% 35%"
//   Violeta: "270 77% 35%"
//   Naranja: "25 90% 45%"
//   Rojo:    "0 72% 40%"
//   Teal:    "170 77% 29%"  ← el actual

export const BRAND_HUE = "170 77%"; // matiz + saturación (no cambies el %)

export const BRAND = {
  // Escala de claridad del color principal (de más claro a más oscuro)
  50:  `hsl(${BRAND_HUE} 97%)`,  // fondo muy suave (hover, badges)
  100: `hsl(${BRAND_HUE} 90%)`,  // fondo suave
  200: `hsl(${BRAND_HUE} 80%)`,  // bordes suaves
  300: `hsl(${BRAND_HUE} 65%)`,  // bordes normales
  400: `hsl(${BRAND_HUE} 50%)`,  // elementos secundarios
  500: `hsl(${BRAND_HUE} 38%)`,  // color base
  600: `hsl(${BRAND_HUE} 29%)`,  // ← botones principales (el más usado)
  700: `hsl(${BRAND_HUE} 22%)`,  // hover de botones
  800: `hsl(${BRAND_HUE} 15%)`,  // texto sobre fondos claros
  900: `hsl(${BRAND_HUE} 8%)`,   // texto muy oscuro
} as const;

// ─────────────────────────────────────────────────────────
// COLORES MODO CLARO (light mode)
// ─────────────────────────────────────────────────────────
export const LIGHT = {
  background: "hsl(216 24% 96%)",  // fondo de página
  foreground: "hsl(168 28% 10%)",  // texto principal
  sidebar:    "hsl(0 0% 100%)",   // fondo de sidebar (blanco)
  header:     "hsl(0 0% 100%)",   // fondo de header (blanco)
  tableHeader: "hsl(210 20% 98%)", // fondo de encabezado de tabla
  tableZebra:  "hsl(210 20% 96%)", // fondo de fila alternada (zebra)
} as const;

// ─────────────────────────────────────────────────────────
// COLORES MODO OSCURO (dark mode)
// ─────────────────────────────────────────────────────────
export const DARK = {
  surface:  "hsl(0 0% 7%)",   // fondo de página
  card:     "hsl(0 0% 11%)",  // fondo de tarjetas
  elevated: "hsl(0 0% 15%)",  // elementos elevados (inputs, dropdowns)
  border:   "hsl(0 0% 22%)",  // líneas divisoras
  sidebar:  "hsl(0 0% 11%)",  // fondo de sidebar
  header:   "hsl(0 0% 11%)",  // fondo de header
  tableHeader: "hsl(0 0% 13%)", // fondo encabezado tabla DARK
  tableZebra:  "hsl(0 0% 9%)",  // fondo zebra tabla DARK
} as const;

// ─────────────────────────────────────────────────────────
// COLORES DE ESTADO
// ─────────────────────────────────────────────────────────
export const STATUS = {
  // Éxito (verde) — para stock normal, confirmaciones
  success: "hsl(160 84% 39%)",

  // Advertencia (ámbar) — para stock bajo
  warning: "hsl(38 92% 45%)",

  // Error (rojo) — para stock agotado, errores
  error: "hsl(0 72% 51%)",
} as const;

// ─────────────────────────────────────────────────────────
// COLORES DE CATEGORÍAS
// ─────────────────────────────────────────────────────────
// Estos son los puntitos de colores que aparecen
// al lado del nombre de categoría en la tabla.
//
// Para agregar una categoría nueva, añadí una línea acá:
//   'NombreCategoria': 'bg-color-400',

export const CATEGORIA_COLORES: Record<string, string> = {
  "Higiene Personal": "bg-sky-400",
  "Bebidas":          "bg-blue-400",
  "Limpieza":         "bg-amber-400",
  "Lácteos":          "bg-orange-400",
  "Alimentos":        "bg-emerald-400",
  "Farmacia":         "bg-teal-400",
  "Snacks":           "bg-purple-400",
  "Cigarrillos":      "bg-rose-400",
  "Ferretería":       "bg-stone-400",
  // Por defecto (si la categoría no está en la lista):
  _default:           "bg-slate-400",
};

// ─────────────────────────────────────────────────────────
// FUNCIÓN HELPER — no necesitás cambiar esto
// ─────────────────────────────────────────────────────────
// Devuelve el color de una categoría, o gris si no existe.
// Uso: getCategoriaColor("Bebidas") → "bg-blue-400"

export function getCategoriaColor(categoria: string): string {
  return CATEGORIA_COLORES[categoria] ?? CATEGORIA_COLORES._default;
}