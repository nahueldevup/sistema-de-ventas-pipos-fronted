import type { LucideIcon } from "lucide-react"

/** Sub-item dentro de un accordion del sidebar */
export interface NavSubItem {
  id: string
  icon: LucideIcon
  label: string
  path: string
}

/** Item principal de navegación */
export interface NavMenuItem {
  id: string
  icon: LucideIcon
  label: string
  /** Ruta directa (si NO tiene sub-items) */
  path?: string
  /** Badge con texto (ej. "3") */
  badge?: string | null
  /** Sub-items para accordion */
  sub?: NavSubItem[]
}

/** Sección agrupadora del menú */
export interface NavSection {
  id: string
  /** Label del grupo (ej. "INVENTARIO") — se muestra como separador */
  label?: string
  items: NavMenuItem[]
}
