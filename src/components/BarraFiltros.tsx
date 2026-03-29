import { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  History,
  AlertCircle,
  XCircle,
  Tag,
  Truck,
  CircleDollarSign,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────
export interface FiltrosPOS {
  busqueda: string;
  categorias: string[];
  proveedores: string[];
  estadoStock: "todos" | "enStock" | "stockBajo" | "agotados";
  precioMin: string;
  precioMax: string;
  fechaCampo: "actividad" | "creacion" | "modificacion";
  fechaDesde: string;
  fechaHasta: string;
}

export type Ordenamiento = "relevancia" | "masVendidos" | "menosVendidos" | "actividadReciente";

interface BarraFiltrosProps {
  isOpen: boolean;
  onClose: () => void;
  filtros: FiltrosPOS;
  setFiltros: (filtros: FiltrosPOS) => void;
  ordenamiento: Ordenamiento;
  setOrdenamiento: (o: Ordenamiento) => void;
  categoriasDisponibles: string[];
  proveedoresDisponibles: string[];
}

// ─── Filtros rápidos ─────────────────────────────────────
const FILTROS_RAPIDOS: {
  id: Ordenamiento | "stockBajo" | "agotados";
  label: string;
  icon: React.ElementType;
  desc: string;
  tipo: "orden" | "stock";
  iconColor?: string;
  textColor?: string;
  borderColor?: string;
  activeBgColor?: string;
  activeRingColor?: string;
}[] = [
  { id: "masVendidos", label: "Más vendidos", icon: TrendingUp, desc: "Ordenar por más vendidos", tipo: "orden" },
  { id: "menosVendidos", label: "Menos vendidos", icon: TrendingDown, desc: "Ordenar por menos vendidos", tipo: "orden" },
  { id: "actividadReciente", label: "Actividad reciente", icon: History, desc: "Últimos cambios (precio, stock, nuevos)", tipo: "orden" },
  { 
    id: "stockBajo", 
    label: "Stock bajo", 
    icon: AlertCircle, 
    desc: "Stock por debajo del mínimo", 
    tipo: "stock", 
    iconColor: "text-orange-500",
    textColor: "text-orange-600 hover:text-orange-700",
    borderColor: "border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-900/20",
    activeBgColor: "bg-orange-600",
    activeRingColor: "ring-orange-200 dark:ring-orange-800"
  },
  { 
    id: "agotados", 
    label: "Agotados", 
    icon: XCircle, 
    desc: "Existencia = 0", 
    tipo: "stock", 
    iconColor: "text-red-500",
    textColor: "text-red-600 hover:text-red-700",
    borderColor: "border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:border-red-600 dark:hover:bg-red-900/20",
    activeBgColor: "bg-red-600",
    activeRingColor: "ring-red-200 dark:ring-red-800"
  },
];

// ─── Componente Dropdown Multi-Select ────────────────────
export function MultiSelectDropdown({
  label,
  icon: Icon,
  opciones,
  seleccionadas,
  onChange,
  variant = 'default',
}: {
  label: string;
  icon: React.ElementType;
  opciones: string[];
  seleccionadas: string[];
  onChange: (sel: string[]) => void;
  variant?: 'default' | 'small';
}) {
  const isSmall = variant === 'small';
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opcion: string) => {
    onChange(
      seleccionadas.includes(opcion)
        ? seleccionadas.filter((s) => s !== opcion)
        : [...seleccionadas, opcion]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto(!abierto)}
        className={`
          inline-flex items-center transition-all border
          ${isSmall ? 'gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm' : 'gap-1.5 px-3 py-2 rounded-xl text-sm font-medium'}
          ${seleccionadas.length > 0
            ? "bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300"
            : isSmall
              ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-700" 
              : "bg-white dark:bg-dark-elevated border-gray-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-600"
          }
        `}
      >
        <Icon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {label}
        {seleccionadas.length > 0 && (
          <span className={`bg-brand-600 text-white flex items-center justify-center ml-0.5 rounded-full ${isSmall ? 'text-[10px] font-bold w-4 h-4' : 'text-xs w-5 h-5'}`}>
            {seleccionadas.length}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg z-50 min-w-[200px] py-1 max-h-60 overflow-y-auto">
          {opciones.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">Sin opciones</p>
          )}
          {opciones.map((opcion) => {
            const sel = seleccionadas.includes(opcion);
            return (
              <button
                key={opcion}
                onClick={() => toggle(opcion)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  sel
                    ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-dark-elevated"
                }`}
              >
                <span
                  className={`w-4 h-4 flex items-center justify-center rounded border ${
                    sel ? "bg-brand-600 border-brand-600 text-white" : "border-gray-300 dark:border-slate-600"
                  }`}
                >
                  {sel && <Check className="w-3 h-3" />}
                </span>
                {opcion}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────
export default function BarraFiltros({
  isOpen,
  onClose,
  filtros,
  setFiltros,
  ordenamiento,
  setOrdenamiento,
  categoriasDisponibles,
  proveedoresDisponibles,
}: BarraFiltrosProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleFiltroRapido = (filtro: (typeof FILTROS_RAPIDOS)[number]) => {
    if (filtro.tipo === "orden") {
      const id = filtro.id as Ordenamiento;
      setOrdenamiento(ordenamiento === id ? "relevancia" : id);
    } else {
      const stockVal = filtro.id as "stockBajo" | "agotados";
      setFiltros({
        ...filtros,
        estadoStock: filtros.estadoStock === stockVal ? "todos" : stockVal,
      });
    }
  };

  const isFiltroRapidoActivo = (filtro: (typeof FILTROS_RAPIDOS)[number]) => {
    if (filtro.tipo === "orden") return ordenamiento === filtro.id;
    return filtros.estadoStock === filtro.id;
  };

  const handleLimpiarTodo = () => {
    setFiltros({
      ...filtros,
      categorias: [],
      proveedores: [],
      estadoStock: "todos",
      precioMin: "",
      precioMax: "",
      fechaCampo: "actividad",
      fechaDesde: "",
      fechaHasta: "",
    });
    setOrdenamiento("relevancia");
  };

  return (
    <div
      className={`absolute top-[calc(100%+12px)] right-0 w-[850px] max-w-[90vw] bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-5 z-50 transition-all duration-200 origin-top-right ${
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div ref={contentRef} className="space-y-4">
          {/* Fila 1: Filtros rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Rápidos</span>
            {FILTROS_RAPIDOS.map((filtro) => {
              const Icon = filtro.icon;
              const activo = isFiltroRapidoActivo(filtro);
              return (
                <button
                  key={filtro.id}
                  onClick={() => handleFiltroRapido(filtro)}
                  title={filtro.desc}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${activo
                      ? `${filtro.activeBgColor || "bg-brand-600"} text-white shadow-sm ring-2 ${filtro.activeRingColor || "ring-brand-200 dark:ring-brand-800"}`
                      : `bg-white dark:bg-dark-elevated ${filtro.textColor || "text-slate-600 dark:text-slate-300"} border ${filtro.borderColor || "border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300"}`
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${!activo && filtro.iconColor ? filtro.iconColor : ""}`} />
                  {filtro.label}
                </button>
              );
            })}
          </div>

          {/* Fila 2: Dropdowns de filtro */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Filtrar</span>

            <MultiSelectDropdown
              label="Categoría"
              icon={Tag}
              opciones={categoriasDisponibles}
              seleccionadas={filtros.categorias}
              onChange={(cats) => setFiltros({ ...filtros, categorias: cats })}
            />

            <MultiSelectDropdown
              label="Proveedor"
              icon={Truck}
              opciones={proveedoresDisponibles}
              seleccionadas={filtros.proveedores}
              onChange={(provs) => setFiltros({ ...filtros, proveedores: provs })}
            />

            {/* Rango de precio */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated">
              <CircleDollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <input
                type="number"
                placeholder="Mín"
                value={filtros.precioMin}
                onChange={(e) => setFiltros({ ...filtros, precioMin: e.target.value })}
                className="w-16 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent"
              />
              <span className="text-slate-300 dark:text-slate-600">–</span>
              <input
                type="number"
                placeholder="Máx"
                value={filtros.precioMax}
                onChange={(e) => setFiltros({ ...filtros, precioMax: e.target.value })}
                className="w-16 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent"
              />
            </div>

            {/* Fecha */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated">
              <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <select
                value={filtros.fechaCampo}
                onChange={(e) => setFiltros({ ...filtros, fechaCampo: e.target.value as FiltrosPOS["fechaCampo"] })}
                className="text-sm outline-none text-slate-600 dark:text-slate-300 bg-transparent cursor-pointer"
              >
                <option value="actividad">Actividad</option>
                <option value="creacion">Creación</option>
                <option value="modificacion">Modificación</option>
              </select>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                className="text-sm outline-none text-slate-700 dark:text-slate-200 bg-transparent w-[130px]"
              />
              <span className="text-slate-300 dark:text-slate-600">→</span>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                className="text-sm outline-none text-slate-700 dark:text-slate-200 bg-transparent w-[130px]"
              />
            </div>
          </div>

          {/* Fila 3: Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border mt-2">
            <button
              onClick={handleLimpiarTodo}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
  );
}
