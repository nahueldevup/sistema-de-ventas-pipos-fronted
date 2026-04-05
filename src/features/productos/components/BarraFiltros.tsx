import { useRef } from "react";
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
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import type { FiltrosPOS, Ordenamiento } from "@/types/filtros.types";
export type { FiltrosPOS, Ordenamiento } from "@/types/filtros.types";


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
      className={`absolute top-[calc(100%+12px)] right-0 w-[850px] max-w-[90vw] bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-2xl shadow-dropdown p-5 z-50 transition-all duration-200 origin-top-right ${
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
                       : `bg-white dark:bg-dark-elevated ${filtro.textColor || "text-[#1F2937] dark:text-slate-300"} border ${filtro.borderColor || "border-[#E5E7EB] dark:border-dark-border hover:bg-[#F3F4F6] dark:hover:bg-slate-600 hover:border-gray-300"}`
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

            <MultiSelect
              label="Categoría"
              icon={Tag}
              opciones={categoriasDisponibles}
              seleccionadas={filtros.categorias}
              onChange={(cats) => setFiltros({ ...filtros, categorias: cats })}
              variant="pill"
            />

            <MultiSelect
              label="Proveedor"
              icon={Truck}
              opciones={proveedoresDisponibles}
              seleccionadas={filtros.proveedores}
              onChange={(provs) => setFiltros({ ...filtros, proveedores: provs })}
              variant="pill"
            />

            {/* Rango de precio */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-dark-border bg-white dark:bg-dark-elevated">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-dark-border bg-white dark:bg-dark-elevated">
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB] dark:border-dark-border mt-2">
            <button
              onClick={handleLimpiarTodo}
              className="px-4 py-2 text-sm font-semibold text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white transition-colors cursor-pointer"
            >
              Limpiar filtros
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors cursor-pointer"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
  );
}
