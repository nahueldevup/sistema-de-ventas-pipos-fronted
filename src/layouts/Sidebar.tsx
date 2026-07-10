import { useState, useCallback, memo, useEffect } from "react"
import {
  Menu,
  ShoppingBag,
  LogOut,
  X,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  Bell,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { NAV_SECTIONS } from "./navigation-data"
import { SIDEBAR_TOKENS } from "./sidebar-tokens"
import type { NavMenuItem, NavSubItem } from "@/types/navigation"

// ── Props ───────────────────────────────────────────────────
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isExpanded: boolean
  onToggleExpanded: () => void
}

// ── Componente ──────────────────────────────────────────────
export default memo(function Sidebar({
  isOpen,
  onClose,
  isExpanded,
  onToggleExpanded,
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const tk = isDark ? SIDEBAR_TOKENS.dark : SIDEBAR_TOKENS.light

  // ── Accordion state ─────────────────────────────────────
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.sub?.some((s) => isChildActive(s.path, location.pathname))) {
          initial.add(item.id)
        }
      }
    }
    return initial
  })

  // Al colapsar sidebar, cerrar todos los accordions
  useEffect(() => {
    if (!isExpanded) setOpenSections(new Set())
  }, [isExpanded])

  // Auto-abrir accordion cuando la ruta activa es un sub-item
  useEffect(() => {
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.sub?.some((s) => isChildActive(s.path, location.pathname))) {
          setOpenSections((prev) => {
            if (prev.has(item.id)) return prev
            return new Set(prev).add(item.id)
          })
        }
      }
    }
  }, [location.pathname])

  const toggleAccordion = useCallback((itemId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }, [])

  const handleNav = useCallback(
    (path: string) => {
      navigate(path)
      if (window.innerWidth < 768) onClose()
    },
    [navigate, onClose],
  )

  // ── Render helpers ──────────────────────────────────────

  /** Item directo (sin sub-items) */
  const renderDirectItem = (item: NavMenuItem) => {
    if (!item.path) return null
    const active = isChildActive(item.path, location.pathname)

    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={() => { if (window.innerWidth < 768) onClose() }}
        className={`
          flex items-center gap-3 rounded-full transition-colors duration-150 cursor-pointer
          ${isExpanded ? "px-3 py-2.5" : "w-10 h-10 justify-center mx-auto"}
          ${active ? tk.itemActive : tk.itemDefault}
        `}
        title={!isExpanded ? item.label : undefined}
      >
        <item.icon
          className={`w-5 h-5 shrink-0 ${active ? tk.iconActive : tk.iconDefault}`}
          strokeWidth={active ? 2.2 : 1.8}
        />
        {isExpanded && (
          <span className="text-[14px] font-medium leading-none truncate">
            {item.label}
          </span>
        )}
      </Link>
    )
  }

  /** Item con accordion (tiene sub-items) */
  const renderAccordionItem = (item: NavMenuItem) => {
    const isOpen = openSections.has(item.id)
    const childActive = item.sub?.some((s) => isChildActive(s.path, location.pathname)) ?? false
    const selfActive = item.path ? isChildActive(item.path, location.pathname) && !childActive : false
    const hasSubs = item.sub && item.sub.length > 0

    return (
      <div key={item.id}>
        {/* Botón padre — navega (si tiene path) + togglea accordion */}
        <button
          onClick={() => {
            if (isExpanded) {
              toggleAccordion(item.id)
              // Si tiene path, navegar
              if (item.path) {
                handleNav(item.path)
              }
            } else {
              // Si está colapsado: expandir sidebar + abrir accordion + navegar
              onToggleExpanded()
              setOpenSections((prev) => new Set(prev).add(item.id))
              if (item.path) handleNav(item.path)
            }
          }}
          className={`
            flex items-center gap-3 rounded-full transition-colors duration-150 cursor-pointer
            ${isExpanded ? "w-full px-3 py-2.5" : "w-10 h-10 justify-center mx-auto"}
            ${selfActive ? tk.itemActive : childActive ? tk.itemDefault + " " + tk.parentActive : tk.itemDefault}
          `}
          title={!isExpanded ? item.label : undefined}
        >
          <item.icon
            className={`w-5 h-5 shrink-0 ${selfActive ? tk.iconActive : tk.iconDefault}`}
            strokeWidth={selfActive ? 2.2 : 1.8}
          />
          {isExpanded && (
            <>
              <span className="text-[14px] font-medium leading-none truncate flex-1 text-left">
                {item.label}
              </span>
              {/* Badge */}
              {item.badge && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium leading-none ${tk.badgeBg}`}>
                  {item.badge}
                </span>
              )}
              {/* Chevron */}
              {hasSubs && (
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform duration-150 ease-linear ${
                    selfActive ? tk.iconActive : tk.chevron
                  } ${isOpen ? "rotate-180" : ""}`}
                />
              )}
            </>
          )}
        </button>

        {/* Sub-items con animación grid */}
        {isExpanded && hasSubs && (
          <div
            className={`grid transition-[grid-template-rows,opacity] ${isOpen ? "duration-[180ms] ease-out opacity-100" : "duration-150 ease-in opacity-0"}`}
            style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="pt-1 pb-0.5 space-y-0.5">
                {item.sub!.map((sub) => renderSubItem(sub))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /** Sub-item dentro de un accordion */
  const renderSubItem = (sub: NavSubItem) => {
    const active = isChildActive(sub.path, location.pathname)

    return (
      <Link
        key={sub.id}
        to={sub.path}
        onClick={() => { if (window.innerWidth < 768) onClose() }}
        className={`
          flex items-center gap-2.5 rounded-full transition-colors duration-150 cursor-pointer
          pl-12 pr-3 py-2
          ${active ? tk.subActive : tk.subDefault}
        `}
      >
        <sub.icon
          className={`w-4 h-4 shrink-0 ${active ? tk.subIconActive : tk.subIconDefault}`}
          strokeWidth={1.8}
        />
        <span className="text-[13px] leading-none truncate">{sub.label}</span>
      </Link>
    )
  }

  // ── JSX principal ───────────────────────────────────────
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30
          ${tk.sidebar} border-r ${tk.border}
          flex flex-col
          transition-[width,transform] duration-200 ease-out antialiased
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isExpanded ? "w-[220px]" : "w-[60px]"}
        `}
      >
        {/* ── Header: hamburguesa + logo ──────────────────── */}
        <div className={`h-14 flex items-center shrink-0 ${isExpanded ? "px-3 gap-3" : "justify-center"} border-b ${tk.border}`}>
          <button
            onClick={onToggleExpanded}
            className={`hidden md:flex p-2 rounded-lg cursor-pointer transition-colors shrink-0 ${tk.themeBtn}`}
            aria-label="Expandir o colapsar menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          {isExpanded && (
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
              >
                <ShoppingBag className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`font-bold text-[16px] leading-tight tracking-tight ${tk.logoText}`}>
                  Pipos
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-[0.08em] leading-tight ${tk.logoSub}`}>
                  Ventas
                </span>
              </div>
              <button
                className={`p-1.5 rounded-full cursor-pointer transition-colors shrink-0 mr-1 ${
                  isDark
                    ? "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
                aria-label="Notificaciones"
              >
                <Bell className="w-[18px] h-[18px]" />
              </button>
            </div>
          )}

          {/* Cerrar en mobile */}
          <button
            onClick={onClose}
            className={`md:hidden absolute right-3 p-2 rounded-lg cursor-pointer transition-colors ${tk.themeBtn} ${isExpanded ? "" : "hidden"}`}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── CTA: Nueva venta ────────────────────────────── */}
        <div className={`pt-4 pb-2 ${isExpanded ? "px-3" : "flex justify-center"}`}>
          <button
            onClick={() => handleNav("/vender")}
            className={`
              flex items-center gap-2 font-semibold shadow-sm
              ${tk.composeBg} ${tk.composeTxt}
              transition-all duration-150 cursor-pointer active:scale-[0.97]
              ${isExpanded
                ? "w-full px-4 py-2.5 rounded-2xl text-[14px] justify-start"
                : "w-10 h-10 rounded-xl justify-center"
              }
            `}
            title={!isExpanded ? "Nueva venta" : undefined}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            {isExpanded && <span>Nueva venta</span>}
          </button>
        </div>

        {/* ── Navegación ──────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-3 hide-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              {/* Label de sección */}
              {section.label && isExpanded && (
                <div className={`text-[10px] uppercase tracking-[0.08em] font-semibold px-3 pt-4 pb-1.5 ${tk.sectionLabel}`}>
                  {section.label}
                </div>
              )}
              {!isExpanded && section.label && (
                <div className={`h-px mx-2 my-2 ${tk.divider}`} />
              )}

              <div className="space-y-0.5">
                {section.items.map((item) =>
                  item.sub !== undefined
                    ? renderAccordionItem(item)
                    : renderDirectItem(item),
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className={`border-t ${tk.border} ${isExpanded ? "px-3" : "px-0"} py-2.5 space-y-0.5 shrink-0 ${!isExpanded ? "flex flex-col items-center" : ""}`}>
          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            className={`
              flex items-center gap-3 rounded-full transition-colors duration-150 cursor-pointer
              ${isExpanded ? "w-full px-3 py-2.5" : "w-10 h-10 justify-center"}
              ${tk.themeBtn}
            `}
            title={!isExpanded ? (isDark ? "Modo claro" : "Modo oscuro") : undefined}
            aria-label="Alternar tema"
          >
            {isDark ? (
              <Sun className="w-5 h-5 shrink-0 text-amber-400" strokeWidth={1.8} />
            ) : (
              <Moon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
            )}
            {isExpanded && (
              <span className="text-[14px] font-medium leading-none">
                {isDark ? "Modo claro" : "Modo oscuro"}
              </span>
            )}
          </button>

          {/* Usuario */}
          <div className={`flex items-center gap-3 ${isExpanded ? "px-3 py-2" : "justify-center py-2"}`}>
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold border-2 ${tk.userAvatar}`}>
              N
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <div className={`text-[13px] font-semibold leading-tight truncate ${tk.userText}`}>
                  Nahuel
                </div>
                <div className={`text-[11px] leading-tight truncate ${tk.userSub}`}>
                  Administrador
                </div>
              </div>
            )}
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={() => navigate("/")}
            className={`
              flex items-center gap-3 rounded-full transition-colors duration-150 cursor-pointer group
              ${isExpanded ? "w-full px-3 py-2.5" : "w-10 h-10 justify-center"}
              ${tk.logout}
            `}
            title={!isExpanded ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" strokeWidth={1.8} />
            {isExpanded && (
              <span className="text-[14px] font-medium leading-none">Cerrar sesión</span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
})

// ── Helper ────────────────────────────────────────────────
function isChildActive(itemPath: string, currentPath: string): boolean {
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/")
}