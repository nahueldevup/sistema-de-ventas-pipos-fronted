import { Menu, Bell, Sun, Moon } from "lucide-react"
import { useTheme } from "@/hooks/ThemeContext"

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-[64px] bg-header/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-foreground cursor-pointer hover:bg-muted/80 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="hidden sm:block text-xl font-bold text-foreground">Inicio - Bienvenido</h2>
      </div>
      
      <div className="flex items-center gap-6">
        {/*<div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-gray-100 dark:bg-dark-elevated px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">Sistema Online</span>
        </div>*/}

        {/* Theme Toggle Switch */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center w-16 h-8.5 rounded-full cursor-pointer transition-all duration-300 focus:outline-none border-2 border-gray-200 dark:border-indigo-500/50"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)'
              : 'linear-gradient(135deg, #e0d230ff 0%, #fde68a 50%, #fbbf24 100%)',
          }}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          aria-label="Alternar tema"
        >
          {/* Stars in dark track */}
          <div className={`absolute left-2 top-1 w-1 h-1 rounded-full bg-white transition-opacity duration-300 ${isDark ? 'opacity-60' : 'opacity-0'}`} />
          <div className={`absolute left-4 top-3 w-0.5 h-0.5 rounded-full bg-white transition-opacity duration-300 ${isDark ? 'opacity-40' : 'opacity-0'}`} />
          <div className={`absolute left-2.5 bottom-1.5 w-0.5 h-0.5 rounded-full bg-white transition-opacity duration-300 ${isDark ? 'opacity-50' : 'opacity-0'}`} />
          
          {/* Thumb with icon inside */}
          <div
            className={`absolute flex items-center justify-center w-7 h-7 rounded-full shadow-lg transition-all duration-300 ${
              isDark 
                ? 'translate-x-[30px] bg-indigo-900 border-2 border-indigo-400/50' 
                : 'translate-x-[2px] bg-white border-2 border-amber-300'
            }`}
          >
            <Sun className={`absolute w-4 h-4 text-amber-500 transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} strokeWidth={1.5} />
            <Moon className={`absolute w-4 h-4 text-blue-300 transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} strokeWidth={1.5} />
          </div>
        </button>

        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-gray-200 dark:border-dark-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground">Hola, Nahuel</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
          </div>
          <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-dark-card shadow-sm">
            N
          </div>
        </div>
      </div>
    </header>
  )
}