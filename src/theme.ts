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
//   Teal:    "170 77% 29%"  ← el actual
//
// NOTA: Si cambiás esto, actualizá también --brand-hue en globals.css

export const BRAND_HUE = "170 77%"; // matiz + saturación (no cambies el %)

export const BRAND = {
    // Escala de claridad del color principal (de más claro a más oscuro)
    50: `hsl(${BRAND_HUE} 97%)`,  // fondo muy suave (hover, badges)
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
    // hsl(226 10% 7.5%) ≈ #0F1117
    // NO es negro puro. El negro puro causa "halo" blanco alrededor
    // del texto en pantallas baratas (efecto subpixel rendering).
    // Este gris muy oscuro elimina ese problema.
    surface: "hsl(226 10% 7.5%)",

    // ── Fondo de tarjetas y modales ──────────────────────
    // hsl(226 10% 13%) ≈ #1A1D27
    // Se nota contra el fondo (5.5% más claro) sin necesidad
    // de bordes ni sombras. El ojo distingue "esto es una tarjeta
    // sobre un fondo" por la diferencia de luminosidad sola.
    card: "hsl(226 10% 13%)",

    // ── Superficie elevada (inputs, dropdowns, selects) ──
    // hsl(226 10% 18%) ≈ #242836
    // NUEVA variable. Sin esto, los inputs se fundían con el
    // fondo del modal y el usuario no sabía dónde hacer click.
    // Al ser 5% más clara que la tarjeta, crea un "pozo" visual
    // que el cerebro interpreta como "acá se puede escribir".
    elevated: "hsl(226 10% 18%)",

    // ── Líneas divisoras ─────────────────────────────────
    // hsl(226 10% 20%) ≈ #2A2E3D
    // ANTES: hsl(0 0% 22%) = #383838 (gris puro)
    // El gris puro se confundía con los fondos grises puros.
    // Con el mismo tinte azul que los fondos, la línea se integra
    // pero se nota. Ratio contra card: ~1.8:1, suficiente para
    // SEPARAR sin ser una línea gritona.
    border: "hsl(226 10% 20%)",

    // ── Sidebar y header ─────────────────────────────────
    // Misma luminosidad que card para que se vean como "la misma
    // superficie" que los modales, creando continuidad visual.
    sidebar: "hsl(226 10% 13%)",
    header: "hsl(226 10% 13%)",

    // ── Tabla ────────────────────────────────────────────
    // tableHeader queda entre surface y card (11%) para que las
    // cabeceras se vean como una capa intermedia.
    // tableZebra es más oscuro que surface (9%) para que las filas
    // alternadas se distingan sutilmente.
    tableHeader: "hsl(226 10% 11%)",
    tableZebra: "hsl(226 10% 9%)",

    // ── Textos ───────────────────────────────────────────
    // foreground: hsl(216 1% 95%) ≈ #F0F2F5
    // NO es blanco puro. Blanco puro sobre negro puro tiene
    // contraste 21:1 (excesivo), causa fatiga y "vibración" en
    // paneles baratos. Blanco roto a 95% mantiene ratio ~16:1
    // (pasa AAA) pero elimina la fatiga.
    //
    // mutedForeground: hsl(230 9% 59%) ≈ #8B8FA3
    // ANTES: hsl(0 0% 60%) = #999 (gris puro)
    // El gris puro se confundía con bordes y otros elementos grises.
    // El sutil tinte azul lo asocia con el texto principal pero se
    // distingue claramente. Ratio contra card: ~4.5:1 (pasa AA).
    foreground: "hsl(216 1% 95%)",
    mutedForeground: "hsl(230 9% 59%)",
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