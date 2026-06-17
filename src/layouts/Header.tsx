import { Menu, Bell } from "lucide-react"
import { memo, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"

interface HeaderProps {
  onMenuClick: () => void
}

const routeTitles: Record<string, string> = {
  "/panel": "Inicio",
  "/vender": "Vender",
  "/productos": "Productos",
  "/clientes": "Clientes",
  "/caja": "Caja",
  "/categorias": "Categorías",
  "/proveedores": "Proveedores",
  "/pagos": "Pagos",
  "/reportes": "Reportes",
}

export default memo(function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const { isDark } = useTheme()

  const pageTitle = useMemo(() => {
    const p = location.pathname
    if (routeTitles[p]) return routeTitles[p]
    const match = Object.keys(routeTitles)
      .filter((r) => p.startsWith(r))
      .sort((a, b) => b.length - a.length)[0]
    return match ? routeTitles[match] : "Inicio"
  }, [location.pathname])

  return (
    <header
      className={`
        h-14 flex items-center justify-between px-5 shrink-0 border-b
        ${isDark
          ? "bg-[#111514] border-white/10 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
        }
      `}
    >
      {/* Izquierda: hamburguesa mobile + título */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className={`md:hidden p-2 rounded-xl cursor-pointer transition-colors ${
            isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600"
          }`}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-bold tracking-[-0.01em] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Derecha: notificaciones + avatar */}
      <div className="flex items-center gap-3">
        <button
          className={`p-2 rounded-full cursor-pointer transition-colors ${
            isDark
              ? "text-slate-400 hover:bg-white/10 hover:text-slate-200"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`}
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold border-2 ${
          isDark
            ? "bg-emerald-500 text-slate-950 border-emerald-400"
            : "bg-emerald-600 text-white border-emerald-700"
        }`}>
          N
        </div>
      </div>
    </header>
  )
})