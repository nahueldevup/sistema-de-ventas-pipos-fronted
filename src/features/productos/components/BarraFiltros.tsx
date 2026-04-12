import {
  LayoutList,
  PackageCheck,
  AlertCircle,
  PackageX,
  Filter,
  Truck,
  ImageOff,
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import type { FiltrosAvanzados, Ordenamiento } from "@/types/filtros.types";

interface BarraFiltrosProps {
  isOpen: boolean;
  onClose: () => void;
  filtros: FiltrosAvanzados;
  setFiltros: (filtros: FiltrosAvanzados) => void;
  ordenamiento: Ordenamiento;
  setOrdenamiento: (o: Ordenamiento) => void;
  categoriasDisponibles: string[];
  proveedoresDisponibles: string[];
}

export default function BarraFiltros({
  isOpen,
  onClose,
  filtros,
  setFiltros,
  categoriasDisponibles,
  proveedoresDisponibles,
}: BarraFiltrosProps) {
  // ── Estado derivado de stock ──────────────────────────────────────────
  const todosActivo =
    !filtros.filtroConStock && !filtros.filtroStockBajo && !filtros.filtroAgotados;

  // ── Handlers de stock ─────────────────────────────────────────────────
  const handleTodos = () => {
    setFiltros({
      ...filtros,
      filtroConStock: false,
      filtroStockBajo: false,
      filtroAgotados: false,
    });
  };

  const handleConStock = () => {
    setFiltros({
      ...filtros,
      filtroConStock: true,
      filtroStockBajo: false,
      filtroAgotados: false,
    });
  };

  const handleStockBajo = () => {
    const nuevoValor = !filtros.filtroStockBajo;
    setFiltros({
      ...filtros,
      filtroConStock: false,
      filtroStockBajo: nuevoValor,
      // si ambos toggles quedan apagados, "Todos" se activa automáticamente
    });
  };

  const handleAgotados = () => {
    const nuevoValor = !filtros.filtroAgotados;
    setFiltros({
      ...filtros,
      filtroConStock: false,
      filtroAgotados: nuevoValor,
    });
  };

  // ── Limpiar todo ──────────────────────────────────────────────────────
  const handleLimpiarTodo = () => {
    setFiltros({
      ...filtros,
      categorias: [],
      proveedores: [],
      filtroConStock: false,
      filtroStockBajo: false,
      filtroAgotados: false,
      filtroSinImagen: false,
    });
  };

  // ── Estilos base para botones de stock ────────────────────────────────
  const BASE_BTN =
    "inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border text-[13px] font-semibold transition-colors duration-150 select-none cursor-pointer";

  const INACTIVO =
    "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <div
      className={`absolute top-[calc(100%+8px)] right-0 z-50 w-[420px] max-w-[92vw] overflow-visible rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-150 origin-top-right dark:border-dark-border dark:bg-dark-card ${
        isOpen
          ? "pointer-events-auto opacity-100 scale-100 translate-y-0"
          : "pointer-events-none opacity-0 scale-95 -translate-y-1"
      }`}
    >
      <div className="p-4 space-y-4">
        {/* ── Sección 1: Estado del stock ─────────────────────────────── */}
        <section>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Estado del stock
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Todos */}
            <button
              type="button"
              onClick={handleTodos}
              className={`${BASE_BTN} ${
                todosActivo
                  ? "bg-brand-600 border-brand-600 text-white"
                  : INACTIVO
              }`}
            >
              <LayoutList className="h-3.5 w-3.5 shrink-0" />
              Todos
            </button>

            {/* En stock */}
            <button
              type="button"
              onClick={handleConStock}
              className={`${BASE_BTN} ${
                filtros.filtroConStock
                  ? "bg-brand-50 border-brand-400 text-brand-700 dark:bg-brand-900/20 dark:border-brand-600 dark:text-brand-300"
                  : INACTIVO
              }`}
            >
              <PackageCheck className="h-3.5 w-3.5 shrink-0" />
              En stock
            </button>

            {/* Stock bajo */}
            <button
              type="button"
              onClick={handleStockBajo}
              className={`${BASE_BTN} ${
                filtros.filtroStockBajo
                  ? "bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-900/20 dark:border-amber-500 dark:text-amber-300"
                  : INACTIVO
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Stock bajo
            </button>

            {/* Agotados */}
            <button
              type="button"
              onClick={handleAgotados}
              className={`${BASE_BTN} ${
                filtros.filtroAgotados
                  ? "bg-red-50 border-red-400 text-red-600 dark:bg-red-900/20 dark:border-red-500 dark:text-red-300"
                  : INACTIVO
              }`}
            >
              <PackageX className="h-3.5 w-3.5 shrink-0" />
              Agotados
            </button>
          </div>
        </section>

        {/* ── Separador ──────────────────────────────────────────────── */}
        <div className="border-t border-slate-100 dark:border-dark-border" />

        {/* ── Sección 2: Filtrar por ─────────────────────────────────── */}
        <section>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Filtrar por
          </div>

          <div className="grid grid-cols-2 gap-2 max-[480px]:grid-cols-1">
            <div className="col-span-1 [&_button]:w-full">
              <MultiSelect
                label="Categoría"
                labelAll="Todas las categorías"
                labelPlural="categorías"
                icon={Filter}
                iconSize={16}
                opciones={categoriasDisponibles}
                seleccionadas={filtros.categorias}
                onChange={(cats) => setFiltros({ ...filtros, categorias: cats })}
                variant="pill"
              />
            </div>

            <div className="col-span-1 [&_button]:w-full">
              <MultiSelect
                label="Proveedor"
                labelAll="Todos los proveedores"
                labelPlural="proveedores"
                icon={Truck}
                iconSize={16}
                opciones={proveedoresDisponibles}
                seleccionadas={filtros.proveedores}
                onChange={(provs) => setFiltros({ ...filtros, proveedores: provs })}
                variant="pill"
              />
            </div>
          </div>

          {/* Chip "Sin imagen" */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() =>
                setFiltros({ ...filtros, filtroSinImagen: !filtros.filtroSinImagen })
              }
              className={`${BASE_BTN} ${
                filtros.filtroSinImagen
                  ? "bg-slate-100 border-slate-400 text-slate-800 dark:bg-slate-700/40 dark:border-slate-500 dark:text-slate-100"
                  : INACTIVO
              }`}
            >
              <ImageOff size={16}/>
              Sin imagen
            </button>
          </div>
        </section>

        {/* ── Sección 3: Footer ──────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-dark-border pt-3">
          <button
            type="button"
            onClick={handleLimpiarTodo}
            className="text-[13px] font-semibold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors px-2 py-1.5 cursor-pointer"
          >
            Limpiar Filtros
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold px-5 py-2 transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}