import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import BarraFiltros from './BarraFiltros';
import type { FiltrosAvanzados, Ordenamiento } from '@/types/filtros.types';
import {
  Search, Filter, Plus,
  Minus, ChevronDown, X,
  Printer, LayoutGrid, ListTodo
} from 'lucide-react';

interface BarraHerramientasProps {
  filtros: FiltrosAvanzados;
  setFiltros: (filtros: FiltrosAvanzados) => void;
  ordenamiento: Ordenamiento;
  setOrdenamiento: (o: Ordenamiento) => void;
  filtrosActivosCount: number;
  categoriasDisponibles: string[];
  proveedoresDisponibles: string[];
  margenGananciaGlobal: number;
  setMargenGananciaGlobal: (v: number) => void;
  gananciaAutoActiva: boolean;
  setGananciaAutoActiva: (v: boolean) => void;
  onNuevoProducto: () => void;
  onAbrirCategorias: () => void;
  onAbrirActualizarPrecios: () => void;
  onAbrirImprimirEtiquetas: () => void;
}

export default function BarraHerramientas({
  filtros,
  setFiltros,
  ordenamiento,
  setOrdenamiento,
  filtrosActivosCount,
  categoriasDisponibles,
  proveedoresDisponibles,
  margenGananciaGlobal,
  setMargenGananciaGlobal,
  gananciaAutoActiva,
  setGananciaAutoActiva,
  onNuevoProducto,
  onAbrirCategorias,
  onAbrirActualizarPrecios,
  onAbrirImprimirEtiquetas,
}: BarraHerramientasProps) {
  const [filtrosAbierto, setFiltrosAbierto] = useState(false);

  // Ref para el contenedor del dropdown de filtros (click outside)
  const filtroContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtrosAbierto) return;
    const onClick = (e: MouseEvent) => {
      if (filtroContainerRef.current && !filtroContainerRef.current.contains(e.target as Node)) {
        setFiltrosAbierto(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filtrosAbierto]);

  // ── Chips de filtros activos (memoizados) ──────────────────
const chipsActivos = useMemo(() => {
  const chips: { label: React.ReactNode; onRemove: () => void }[] = [];

  if (ordenamiento !== "relevancia") {
    const labels: Record<string, string> = {
      masVendidos: "Más vendidos",
      menosVendidos: "Menos vendidos",
      actividadReciente: "Actividad reciente",
    };

    chips.push({
      label: (
        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
          Orden: <strong className="font-bold">{labels[ordenamiento]}</strong>
        </span>
      ),
      onRemove: () => setOrdenamiento("relevancia"),
    });
  }

  if (filtros.estadoStock !== "todos") {
    const labels: Record<string, string> = {
      enStock: "En stock",
      stockBajo: "Stock bajo",
      agotados: "Agotados",
    };

    chips.push({
      label: (
        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
          Estado: {labels[filtros.estadoStock]}
        </span>
      ),
      onRemove: () => setFiltros({ ...filtros, estadoStock: "todos" }),
    });
  }

  if (filtros.categorias.length > 0) {
    const resumenCategorias =
      filtros.categorias.length === 1
        ? filtros.categorias[0]
        : filtros.categorias.length <= 2
          ? filtros.categorias.join(", ")
          : `${filtros.categorias.length} seleccionadas`;

    chips.push({
      label: (
        <span className="flex items-center gap-1 text-brand-700 dark:text-brand-300 font-medium">
          Categorías: <strong className="font-bold">{resumenCategorias}</strong>
        </span>
      ),
      onRemove: () => setFiltros({ ...filtros, categorias: [] }),
    });
  }

  if (filtros.proveedores.length > 0) {
    const resumenProveedores =
      filtros.proveedores.length === 1
        ? filtros.proveedores[0]
        : filtros.proveedores.length <= 2
          ? filtros.proveedores.join(", ")
          : `${filtros.proveedores.length} seleccionados`;

    chips.push({
      label: (
        <span className="flex items-center gap-1 text-brand-700 dark:text-brand-300 font-medium">
          Proveedores: <strong className="font-bold">{resumenProveedores}</strong>
        </span>
      ),
      onRemove: () => setFiltros({ ...filtros, proveedores: [] }),
    });
  }

  if (filtros.precioMin) {
    chips.push({
      label: (
        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
          Precio ≥ <strong>${filtros.precioMin}</strong>
        </span>
      ),
      onRemove: () => setFiltros({ ...filtros, precioMin: "" }),
    });
  }

  if (filtros.precioMax) {
    chips.push({
      label: (
        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
          Precio ≤ <strong>${filtros.precioMax}</strong>
        </span>
      ),
      onRemove: () => setFiltros({ ...filtros, precioMax: "" }),
    });
  }

  if (filtros.fechaDesde || filtros.fechaHasta) {
    chips.push({
      label: (
        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
          Fecha: <strong>{filtros.fechaDesde || "..."} → {filtros.fechaHasta || "..."}</strong>
        </span>
      ),
      onRemove: () => setFiltros({ ...filtros, fechaDesde: "", fechaHasta: "" }),
    });
  }

  return chips;
}, [ordenamiento, filtros, setOrdenamiento, setFiltros]);

  const handleLimpiarFiltrosNav = useCallback(() => {
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
  }, [filtros, setFiltros, setOrdenamiento]);

  return (
    <div className="bg-card p-4 rounded-2xl border border-border shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center flex-1 min-w-[240px] border border-border rounded-xl bg-background focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-100 dark:focus-within:ring-brand-900 transition-all p-1.5 shadow-sm">
          <div className="pl-2.5 text-slate-400 dark:text-slate-500 flex items-center pr-2">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar por producto, código..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            className="flex-1 py-1.5 text-sm outline-none text-foreground placeholder-slate-400 dark:placeholder-slate-500 bg-transparent min-w-0"
          />

          <div
            className="relative shrink-0 ml-2"
            ref={filtroContainerRef}
          >
            <button
              onClick={() => setFiltrosAbierto(!filtrosAbierto)}
              aria-expanded={filtrosAbierto}
              aria-haspopup="dialog"
              className={`px-3 py-1.5 border rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95 ${filtrosAbierto
                  ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 hover:border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700'
                }`}
            >
              <Filter className="w-4 h-4" /> Filtrar
              <ChevronDown className={`w-3.5 h-3.5 ml-0.5 text-slate-400 transition-transform ${filtrosAbierto ? 'rotate-180' : ''}`} />
              {filtrosActivosCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border border-white dark:border-dark-card">
                  {filtrosActivosCount}
                </span>
              )}
            </button>

            <BarraFiltros
              isOpen={filtrosAbierto}
              onClose={() => setFiltrosAbierto(false)}
              filtros={filtros}
              setFiltros={setFiltros}
              ordenamiento={ordenamiento}
              setOrdenamiento={setOrdenamiento}
              categoriasDisponibles={categoriasDisponibles}
              proveedoresDisponibles={proveedoresDisponibles}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">

          <div className="flex items-center h-[38px] border border-border rounded-xl bg-card shadow-sm px-1">
            <div className="flex items-center h-full px-1.5 gap-1">
              <button
                onClick={() => gananciaAutoActiva && setMargenGananciaGlobal(Math.max(0, margenGananciaGlobal - 5))}
                className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="relative h-[24px] flex items-center justify-center">
                <input
                  type="text"
                  value={margenGananciaGlobal}
                  onChange={(e) => {
                    if (gananciaAutoActiva) {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setMargenGananciaGlobal(val === '' ? 0 : Math.min(999, parseInt(val, 10)));
                    }
                  }}
                  className="w-[42px] h-full text-center pr-2 text-[14px] font-bold text-foreground bg-transparent outline-none focus:bg-muted/50 rounded"
                  disabled={!gananciaAutoActiva}
                />
                <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-foreground pointer-events-none">%</span>
              </div>
              <button
                onClick={() => gananciaAutoActiva && setMargenGananciaGlobal(margenGananciaGlobal + 5)}
                className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-px h-5 bg-slate-200 dark:bg-dark-border mx-1"></div>
            <button
              onClick={() => setGananciaAutoActiva(!gananciaAutoActiva)}
              className="relative flex items-center h-full px-2 gap-2 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${gananciaAutoActiva ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}>
                <div className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-200 ${gananciaAutoActiva ? 'translate-x-[16px]' : 'translate-x-[2px]'
                  }`}></div>
              </div>
              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 pr-1">
                Ganancia por defecto
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                <div className="bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl leading-relaxed">
                  {gananciaAutoActiva
                    ? "El precio de venta se calcula solo al cargar un producto nuevo."
                    : "El precio de venta no se calcula automáticamente. Lo ingresás vos a mano."}
                  {/* Flecha del tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={onAbrirActualizarPrecios}
            className="px-3 h-[38px] border border-[#E5E7EB] hover:border-gray-300 dark:border-dark-border rounded-lg text-[#1F2937] dark:text-slate-200 text-sm font-semibold flex items-center gap-2 bg-white hover:bg-[#F3F4F6] dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all active:scale-95"
          >
            <ListTodo size={18} /> <span className="hidden sm:inline">Ajustar precios por inflación</span>
          </button>
          <button
            onClick={onAbrirCategorias}
            className="px-3 h-[38px] border border-[#E5E7EB] hover:border-gray-300 dark:border-dark-border rounded-lg text-[#1F2937] dark:text-slate-200 text-sm font-semibold flex items-center gap-2 bg-white hover:bg-[#F3F4F6] dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all active:scale-95"
          >
            <LayoutGrid size={18} strokeWidth={2} /> <span className="hidden sm:inline">Categorías</span>
          </button>

          <button
            onClick={onAbrirImprimirEtiquetas}
            className="px-3 h-[38px] rounded-lg text-sm font-semibold flex items-center gap-2 transition-all bg-brand-600 text-white hover:bg-brand-700 cursor-pointer active:scale-95"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Imprimir etiquetas</span>
          </button>

          <button
            onClick={onNuevoProducto}
            className="px-4 h-[38px] bg-brand-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-brand-700 cursor-pointer transition-transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      {chipsActivos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-[#E5E7EB] dark:border-dark-border">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Filtros Activos:</span>
          {chipsActivos.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-50/50 dark:bg-brand-900/30 text-[13px] shadow-sm border border-brand-100 dark:border-brand-800/60"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="hover:bg-brand-200 dark:hover:bg-brand-800 rounded-full p-0.5 ml-1 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={handleLimpiarFiltrosNav}
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline hover:text-brand-700 dark:hover:text-brand-300 ml-2 cursor-pointer transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
