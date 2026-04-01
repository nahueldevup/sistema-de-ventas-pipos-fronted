import { useState } from "react"
import { Menu, ShoppingBag, ShoppingCart, Package, Users, Wallet, LogOut, X, House } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktopPinned?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onToggleMenu?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isDesktopPinned = false,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  onToggleMenu
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [suppressHover, setSuppressHover] = useState(false);

  const handleToggle = () => {
    if (isDesktopPinned) {
      setSuppressHover(true);
    }
    if (onToggleMenu) onToggleMenu();
  };

  const handleMouseLeave = () => {
    setSuppressHover(false);
    if (onMouseLeave) onMouseLeave();
  };

  const isExpanded = isDesktopPinned || (isHovered && !suppressHover);

  const cerrarSesion = () => {
    navigate("/");
  };

  const menuItems = [
    { path: "/", id: "inicio", icon: House, label: "Inicio" },
    { path: "/vender", id: "vender", icon: ShoppingCart, label: "Vender" },
    { path: "/productos", id: "productos", icon: Package, label: "Productos" },
    { path: "/clientes", id: "clientes", icon: Users, label: "Clientes" },
    { path: "/caja", id: "caja", icon: Wallet, label: "Caja" },
  ];

  return (
    <>
      {/* Fondo oscuro (Overlay) para celulares */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed md:relative inset-y-0 left-0 z-30 bg-sidebar border-r border-border flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isExpanded ? 'w-[240px]' : 'w-[80px]'}
        `}
      >
        <div className="flex flex-col overflow-hidden whitespace-nowrap h-full">
          {/* Logo Area */}
          <div className={`h-[64px] flex items-center ${isExpanded ? 'px-4 gap-3' : 'justify-center'} border-b border-border relative transition-all duration-200`}>
            {/* Hamburger para Escritorio */}
            <button
              onClick={handleToggle}
              className={`hidden md:flex p-2 text-foreground hover:bg-muted/80 rounded-lg cursor-pointer transition-colors shrink-0`}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className={`flex items-center gap-2 text-brand-900 dark:text-brand-100 font-bold text-2xl tracking-tight transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
              <div className="w-8 h-8 shrink-0 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="md:block">Pipos</span>
            </div>

            <button
              onClick={onClose}
              className={`md:hidden absolute right-4 p-2 text-slate-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg cursor-pointer transition-colors ${isExpanded ? '' : 'hidden'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="p-3 space-y-2 mt-4 flex-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center ${isExpanded ? 'px-4' : 'justify-center'} py-3.5 rounded-full font-bold transition-all group cursor-pointer relative overflow-hidden ${isActive
                      ? 'text-white bg-brand-500 dark:bg-brand-500 shadow-md hover:bg-brand-700 dark:hover:bg-brand-800'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-white'
                    }`}
                  title={!isExpanded ? item.label : undefined}
                >
                  <div className={`shrink-0 flex items-center justify-center transition-colors ${isActive ? 'text-white' : 'text-brand-600 dark:text-brand-500 group-hover:text-brand-700 dark:group-hover:text-brand-400'}`}>
                    <item.icon className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.2} />
                  </div>

                  <span className={`ml-3.5 text-[15px] transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Zona inferior: Botón de Salir */}
        <div className="p-3 border-t border-border overflow-hidden whitespace-nowrap">
          <button
            onClick={cerrarSesion}
            className={`w-full flex items-center ${isExpanded ? 'px-3' : 'justify-center'} py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all cursor-pointer group`}
            title={!isExpanded ? "Salir" : undefined}
          >
            <div className={`shrink-0 flex items-center justify-center`}>
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </div>
            <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Salir
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}