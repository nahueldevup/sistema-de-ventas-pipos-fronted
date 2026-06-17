import {
  House,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  Tag,
  Truck,
  CreditCard,
  FileText,
} from "lucide-react"
import type { NavSection } from "@/types/navigation"

/**
 * Estructura de navegación del sidebar.
 *
 * Para agregar una sub-página:
 *   1. Buscá la sección correspondiente
 *   2. Agregá un objeto al array `sub` del item padre
 *   3. Registrá la ruta en App.tsx
 *
 * Para agregar una sección nueva:
 *   1. Agregá un NavSection al final del array
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "ventas",
    items: [
      { id: "inicio", icon: House, label: "Inicio", path: "/panel", badge: null },
      { id: "vender", icon: ShoppingCart, label: "Vender", path: "/vender", badge: null },
    ],
  },
  {
    id: "inventario",
    label: "Inventario",
    items: [
      {
        id: "productos",
        icon: Package,
        label: "Productos",
        path: "/productos",
        badge: null,
        sub: [
          { id: "categorias", icon: Tag, label: "Categorías", path: "/categorias" },
          { id: "proveedores", icon: Truck, label: "Proveedores", path: "/proveedores" },
        ],
      },
      { id: "clientes", icon: Users, label: "Clientes", path: "/clientes", badge: null },
    ],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    items: [
      {
        id: "caja",
        icon: Wallet,
        label: "Caja",
        badge: "3",
        sub: [
          { id: "pagos", icon: CreditCard, label: "Pagos", path: "/pagos" },
          { id: "reportes", icon: FileText, label: "Reportes", path: "/reportes" },
        ],
      },
    ],
  },
]
