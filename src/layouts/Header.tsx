import { Menu, Bell, Sun, Moon } from "lucide-react"
import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"

interface HeaderProps {
    onMenuClick: () => void
}

const routeTitles: Record<string, string> = {
    "/": "Inicio - Bienvenido",
    "/vender": "Vender",
    "/productos": "Productos",
    "/clientes": "Clientes",
    "/caja": "Caja",
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { isDark, toggleTheme } = useTheme()
    const location = useLocation()

    const pageTitle = useMemo(() => {
        const pathname = location.pathname

        if (routeTitles[pathname]) return routeTitles[pathname]

        const matchedPrefix = Object.keys(routeTitles)
            .filter((route) => route !== "/" && pathname.startsWith(route))
            .sort((a, b) => b.length - a.length)[0]

        return matchedPrefix ? routeTitles[matchedPrefix] : "Panel de control"
    }, [location.pathname])

    return (
        <header className="h-[64px] bg-header border-b border-border/80 flex items-center justify-between px-4 sm:px-6 md:px-8 z-10 transition-colors duration-300">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-foreground cursor-pointer hover:bg-muted/80 rounded-xl transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <h2 className="truncate text-[20px] leading-none font-bold tracking-[-0.015em] text-slate-800 dark:text-slate-100">
                    {pageTitle}
                </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                {/* Theme Toggle más sobrio */}
                <button
                    onClick={toggleTheme}
                    className={`
            relative flex h-9 w-[58px] items-center rounded-full border shadow-sm
            transition-all duration-300 cursor-pointer
            ${isDark
                            ? "border-indigo-400/25 bg-slate-800"
                            : "border-amber-200/80 bg-amber-50"}
          `}
                    title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    aria-label="Alternar tema"
                >
                    <span
                        className={`
              absolute left-[4px] flex h-7 w-7 items-center justify-center rounded-full
              shadow-sm transition-all duration-300
              ${isDark
                                ? "translate-x-[21px] bg-slate-900 border border-indigo-300/30"
                                : "translate-x-0 bg-white border border-amber-200"}
            `}
                    >
                        <Sun
                            className={`
                absolute h-4 w-4 text-amber-500 transition-all duration-300
                ${isDark ? "opacity-0 scale-75 rotate-45" : "opacity-100 scale-100 rotate-0"}
              `}
                            strokeWidth={1.9}
                        />
                        <Moon
                            className={`
                absolute h-4 w-4 text-sky-300 transition-all duration-300
                ${isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-45"}
              `}
                            strokeWidth={1.9}
                        />
                    </span>
                </button>

                <button
                    className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-elevated hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-colors cursor-pointer"
                    aria-label="Notificaciones"
                >
                    <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-border/80">
                    <div className="text-right hidden sm:block leading-tight">
                        <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                            Hola, Nahuel
                        </p>
                        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                            Administrador
                        </p>
                    </div>

                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-[15px] font-bold border-2 border-white dark:border-dark-card shadow-sm">
                        N
                    </div>
                </div>
            </div>
        </header>
    )
}