import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface MultiSelectProps {
  opciones: string[];
  seleccionadas: string[];
  onChange: (sel: string[]) => void;
  label?: string;
  placeholder?: string;
  icon?: React.ElementType;
  variant?: "pill" | "field";
  size?: "default" | "small";
}

export function MultiSelect({
  opciones,
  seleccionadas,
  onChange,
  label,
  placeholder = "Seleccionar...",
  icon: Icon,
  variant = "pill",
  size = "default",
}: MultiSelectProps) {
  const isSmall = size === "small";
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setAbierto(false);
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

  // ─── Variante "field" (estilo input, usado en modales) ──────────────
  if (variant === "field") {
    return (
      <div className="relative mt-2" ref={ref}>
        <button
          onClick={() => setAbierto(!abierto)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
            seleccionadas.length > 0
              ? "bg-brand-50 border-brand-300 text-brand-700"
              : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {seleccionadas.length === 0 ? (
              <span>{placeholder}</span>
            ) : (
              <span className="font-bold">
                {seleccionadas.length}{" "}
                {seleccionadas.length === 1 ? "seleccionada" : "seleccionadas"}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""}`}
          />
        </button>

        {abierto && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-xl shadow-md z-[60] py-1 max-h-60 overflow-y-auto">
            {opciones.map((opcion) => {
              const sel = seleccionadas.includes(opcion);
              return (
                <button
                  key={opcion}
                  onClick={() => toggle(opcion)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                    sel
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-[#6B7280] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      sel
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {sel && <Check className="w-3 h-3" />}
                  </div>
                  {opcion}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Variante "pill" (default, usado en barras de filtro) ───────────
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto(!abierto)}
        className={`
          inline-flex items-center transition-all border
          ${isSmall ? "gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm" : "gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"}
          ${
            seleccionadas.length > 0
              ? "bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300"
              : isSmall
                ? "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:border-gray-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-700"
                : "bg-white dark:bg-dark-elevated border-[#E5E7EB] dark:border-dark-border text-[#6B7280] dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-[#F3F4F6] dark:hover:bg-slate-600"
          }
        `}
      >
        {Icon && <Icon className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />}
        {label}
        {seleccionadas.length > 0 && (
          <span
            className={`bg-brand-600 text-white flex items-center justify-center ml-0.5 rounded-full ${isSmall ? "text-[10px] font-bold w-4 h-4" : "text-xs w-5 h-5"}`}
          >
            {seleccionadas.length}
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-xl shadow-md z-50 min-w-[200px] py-1 max-h-60 overflow-y-auto">
          {opciones.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">
              Sin opciones
            </p>
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
                    : "text-[#6B7280] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-dark-elevated"
                }`}
              >
                <span
                  className={`w-4 h-4 flex items-center justify-center rounded border ${
                    sel
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-gray-300 dark:border-slate-600"
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
