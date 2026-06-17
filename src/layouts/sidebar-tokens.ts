/**
 * Tokens de color para el sidebar, diferenciados por tema.
 *
 * REGLAS DE CONTRASTE (NO NEGOCIABLES):
 * - Activo claro: SIEMPRE emerald-600 sólido, NUNCA emerald-100/200.
 * - Activo oscuro: SIEMPRE emerald-500 sólido (items principales).
 * - Hover mínimo: slate-200 en claro, white/10 en oscuro. NUNCA slate-50.
 * - Texto mínimo: slate-700 en claro, slate-200 en oscuro.
 */
export const SIDEBAR_TOKENS = {
  light: {
    sidebar:       "bg-[#f0f2f0]",
    border:        "border-slate-300/60",
    logoText:      "text-slate-900",
    logoSub:       "text-emerald-700",
    sectionLabel:  "text-slate-500",
    // CTA
    composeBg:     "bg-emerald-600 hover:bg-emerald-700",
    composeTxt:    "text-white",
    composeBorder: "border-emerald-700",
    // Nav items principales
    itemDefault:   "text-slate-800 hover:bg-slate-200/80",
    itemActive:    "bg-emerald-600 text-white",
    iconDefault:   "text-slate-600",
    iconActive:    "text-white",
    // Sub-items accordion
    subDefault:    "text-slate-700 hover:bg-slate-200/80 hover:text-slate-900",
    subActive:     "bg-emerald-100 text-emerald-900 font-semibold",
    subIconDefault: "text-slate-500",
    subIconActive:  "text-emerald-700",
    // Padre con hijo activo
    parentActive:  "text-slate-900 font-semibold",
    // Badge
    badgeBg:       "bg-slate-200 text-slate-700",
    // Footer
    themeBtn:      "text-slate-600 hover:bg-slate-200/80",
    userText:      "text-slate-800",
    userSub:       "text-slate-500",
    userAvatar:    "bg-emerald-600 text-white border-emerald-700",
    logout:        "text-slate-700 hover:bg-red-100 hover:text-red-700",
    divider:       "bg-slate-300/60",
    // Chevron
    chevron:       "text-slate-400",
  },
  dark: {
    sidebar:       "bg-[#111514]",
    border:        "border-white/10",
    logoText:      "text-white",
    logoSub:       "text-emerald-400",
    sectionLabel:  "text-slate-500",
    composeBg:     "bg-emerald-500 hover:bg-emerald-400",
    composeTxt:    "text-slate-950",
    composeBorder: "border-emerald-400",
    itemDefault:   "text-slate-200 hover:bg-white/10",
    itemActive:    "bg-emerald-500 text-slate-950",
    iconDefault:   "text-slate-400",
    iconActive:    "text-slate-950",
    subDefault:    "text-slate-400 hover:bg-white/[0.08] hover:text-slate-200",
    subActive:     "bg-emerald-500/25 text-emerald-300 font-semibold",
    subIconDefault: "text-slate-500",
    subIconActive:  "text-emerald-400",
    parentActive:  "text-slate-100 font-semibold",
    badgeBg:       "bg-white/15 text-slate-300",
    themeBtn:      "text-slate-400 hover:bg-white/10",
    userText:      "text-slate-100",
    userSub:       "text-slate-500",
    userAvatar:    "bg-emerald-500 text-slate-950 border-emerald-400",
    logout:        "text-slate-400 hover:bg-red-500/15 hover:text-red-400",
    divider:       "bg-white/15",
    chevron:       "text-slate-500",
  },
} as const

export type SidebarTokens = typeof SIDEBAR_TOKENS.light
