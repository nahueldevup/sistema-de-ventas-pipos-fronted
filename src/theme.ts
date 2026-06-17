/**
 * ╔══════════════════════════════════════════════════════╗
 * ║           PIPOS — CONFIGURACIÓN DE TEMA              ║
 * ║                                                      ║
 * ║  ¿Querés cambiar los colores de la app?              ║
 * ║  Este es el único archivo que necesitás tocar.       ║
 * ║                                                      ║
 * ║  Después de cambiar algo acá, actualizá también      ║
 * ║  globals.css (la sección :root y .dark) para que     ║
 * ║  estén sincronizados.                                ║
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
//   Teal:    "170 77% 29%"
//   Emerald: "160 84% 27%"  ← el actual
//
// NOTA: Si cambiás esto, actualizá también --brand-hue en index.css

export const BRAND_HUE = "160 84%"; // matiz + saturación (emerald)

export const BRAND = {
    // Escala de claridad del color principal (de más claro a más oscuro)
    50: `hsl(${BRAND_HUE} 97%)`,  // fondo muy suave (hover, badges)
    100: `hsl(${BRAND_HUE} 90%)`,  // fondo suave
    200: `hsl(${BRAND_HUE} 80%)`,  // bordes suaves
    300: `hsl(${BRAND_HUE} 65%)`,  // bordes normales
    400: `hsl(${BRAND_HUE} 50%)`,  // elementos secundarios
    500: `hsl(${BRAND_HUE} 38%)`,  // color base
    600: `hsl(${BRAND_HUE} 27%)`,  // ← botones principales (emerald-600 exacto)
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
    sidebar: "hsl(0 0% 100%)",       // fondo de sidebar (blanco)
    header: "hsl(0 0% 100%)",        // fondo de header (blanco)
    tableHeader: "hsl(210 20% 98%)", // fondo de encabezado de tabla
    tableZebra: "hsl(210 20% 96%)",  // fondo de fila alternada (zebra)
} as const;

// ─────────────────────────────────────────────────────────
// COLORES MODO OSCURO (dark mode)
// ─────────────────────────────────────────────────────────
//
// CAMBIO: Todos los valores pasaron de gris puro (hsl 0 0% X%)
// a gris con tinte azulado (hsl 226 10% X%).
//
// ¿POR QUÉ?
// El gris puro (#121212, #1c1c1c) en pantallas TN baratas se ve
// "muerto" y plano. Un tinte azulado de 10% saturación es casi
// imperceptible conscientemente, pero el cerebro lo registra como
// "más rico" y "más profesional". Es la diferencia entre una app
// que parece template gratuito y una que parece software pago.
//
// Además, al compartir todos el mismo matiz (226) y saturación (10%),
// se garantiza que NO haya conflictos cromáticos entre fondos,
// bordes y superficies. Todo es "la misma familia de gris azulada"
// en distintas luminosidades.
// ─────────────────────────────────────────────────────────

export const DARK = {
    // ── Fondo de página ──────────────────────────────────
    // #111514 — verde-oscuro profundo
    // NO es negro puro. El tinte verdoso sutil (sat 6-10%) en
    // todas las superficies crea coherencia cromática con la
    // paleta emerald de la app. En pantallas TN baratas se ve
    // "más rico" que el gris puro.
    surface: "#111514",

    // ── Fondo de tarjetas y modales ──────────────────────
    // hsl(160 8% 11%) — verde-gris oscuro
    // Se nota contra el fondo por diferencia de luminosidad.
    card: "hsl(160 8% 11%)",

    // ── Superficie elevada (inputs, dropdowns, selects) ──
    // hsl(160 8% 15%) — pozo visual para inputs
    elevated: "hsl(160 8% 15%)",

    // ── Líneas divisoras ─────────────────────────────────
    // hsl(160 6% 20%) — se integra con el tinte verdoso
    border: "hsl(160 6% 20%)",

    // ── Sidebar y header ─────────────────────────────────
    sidebar: "hsl(160 10% 9%)",
    header: "hsl(160 10% 9%)",

    // ── Tabla ────────────────────────────────────────────
    tableHeader: "hsl(160 8% 11%)",
    tableZebra: "hsl(160 6% 8%)",

    // ── Textos ───────────────────────────────────────────
    // Blanco roto con sutil tinte verde, contraste ~16:1 (AAA)
    foreground: "hsl(150 5% 95%)",
    mutedForeground: "hsl(155 5% 58%)",
} as const;

// ─────────────────────────────────────────────────────────
// COLORES DE ESTADO (alertas, toasts, notificaciones)
// ─────────────────────────────────────────────────────────
// Estos son colores BRILLANTES porque las alertas SÍ necesitan
// gritar para captar atención inmediata. No confundir con los
// badges de stock (que van en BADGE_COLORS abajo).
// ─────────────────────────────────────────────────────────
export const STATUS = {
    // Éxito (verde) — para confirmaciones, toasts positivos
    success: "hsl(160 84% 39%)",

    // Advertencia (ámbar) — para warnings generales
    warning: "hsl(38 92% 45%)",

    // Error (rojo) — para errores críticos, toasts de error
    error: "hsl(0 72% 51%)",
} as const;

// ─────────────────────────────────────────────────────────
// COLORES DE BADGES (estado de stock en tablas)
// ─────────────────────────────────────────────────────────
//
// PATRÓN CRÍTICO: En dark mode se INVIERTEN los badges.
//
// Light mode: fondo claro + texto oscuro (contraste directo)
// Dark mode:  fondo oscuro + texto claro (misma familia del color)
//
// ¿POR QUÉ no usar los mismos STATUS brillantes en dark mode?
// Porque un badge rojo brillante sobre fondo oscuro GRITA,
// interrumpe la lectura de la fila, y en pantallas baratas se
// ve como un parche borroso. El badge tiene que INFORMAR, no
// GRITAR. La información de stock es secundaria respecto al
// nombre del producto y el precio.
//
// ¿Por qué estos pares específicos?
// Cada par es (fondo-900 + texto-300) de la misma familia
// Tailwind. Esto garantiza armonía cromática automática:
// - Rojo 900 (#7F1D1D) + Rojo 300 (#FCA5A5) = "peligro serioso"
// - Ámbar 900 (#78350F) + Ámbar 300 (#FCD34D) = "precaución"
// - Verde 900 (#064E3B) + Verde 300 (#6EE7B7) = "todo bien"
//
// El fondo oscuro con texto claro tiene contraste excelente
// (~7:1 para rojo, ~10:1 para ámbar) pero visualmente se
// integra con el dark mode en vez de interrumpirlo.
// ─────────────────────────────────────────────────────────

export const BADGE_COLORS = {
    light: {
        // Fondo claro + texto oscuro = contraste directo
        danger:  { bg: "#FEE2E2", text: "#991B1B" }, // rojo
        warning: { bg: "#FEF3C7", text: "#92400E" }, // ámbar
        success: { bg: "#D1FAE5", text: "#065F46" }, // verde
    },
    dark: {
        // Fondo oscuro + texto claro = informa sin gritar
        danger:  { bg: "#7F1D1D", text: "#FCA5A5" }, // red-900 + red-300
        warning: { bg: "#78350F", text: "#FCD34D" }, // amber-900 + amber-300
        success: { bg: "#064E3B", text: "#6EE7B7" }, // emerald-900 + emerald-300
    },
} as const;

// ─────────────────────────────────────────────────────────
// COLORES DE CATEGORÍAS
// ─────────────────────────────────────────────────────────
// Estos son los puntitos de colores que aparecen
// al lado del nombre de categoría en la tabla.
//
// NOTA PARA DARK MODE: Los bg-400 de Tailwind funcionan bien
// en dark mode porque son colores saturados (no grises) y
// se recortan limpios contra el fondo oscuro. No necesitan
// ajuste especial.
//
// Para agregar una categoría nueva, añadí una línea acá:
//   'NombreCategoria': 'bg-color-400',

export const CATEGORIA_COLORES: Record<string, string> = {
    "Higiene Personal": "bg-sky-400",
    "Bebidas": "bg-blue-400",
    "Limpieza": "bg-amber-400",
    "Lácteos": "bg-orange-400",
    "Alimentos": "bg-emerald-400",
    "Farmacia": "bg-teal-400",
    "Snacks": "bg-purple-400",
    "Cigarrillos": "bg-rose-400",
    "Ferretería": "bg-stone-400",
    // Por defecto (si la categoría no está en la lista):
    _default: "bg-slate-400",
};

// ─────────────────────────────────────────────────────────
// FUNCIÓN HELPER — no necesitás cambiar esto
// ─────────────────────────────────────────────────────────
// Devuelve el color de una categoría, o gris si no existe.
// Uso: getCategoriaColor("Bebidas") → "bg-blue-400"

export function getCategoriaColor(categoria: string): string {
    return CATEGORIA_COLORES[categoria] ?? CATEGORIA_COLORES._default;
}