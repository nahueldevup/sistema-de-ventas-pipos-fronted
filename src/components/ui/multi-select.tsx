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
  labelAll?: string;
  labelPlural?: string;
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
  labelAll,
  labelPlural,
}: MultiSelectProps) {
  const isSmall = size === "small";
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opcion: string) => {
    const next = seleccionadas.includes(opcion)
      ? seleccionadas.filter((s) => s !== opcion)
      : [...seleccionadas, opcion];

    onChange(next.length === 0 ? [] : next);
  };

  const getDisplayText = () => {
    if (!labelAll) return label || placeholder;
    if (seleccionadas.length === 0) return labelAll;
    if (seleccionadas.length === 1) return seleccionadas[0];
    if (seleccionadas.length === 2) return seleccionadas.join(", ");
    return `${seleccionadas.length} ${labelPlural || "seleccionadas"}`;
  };

  const dropdownBase =
    "absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-lg z-50 min-w-[220px] py-1 max-h-64 overflow-y-auto";

  const optionBase =
    "w-full text-left text-sm flex items-center gap-2.5 transition-colors cursor-pointer";

  const checkboxBase =
    "w-4 h-4 shrink-0 rounded-md border flex items-center justify-center";

  // ─── BOTÓN PILL ─────────────────────────────────────────────────────────
  const pillActive = seleccionadas.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className={`
          inline-flex items-center transition-all border
          ${isSmall ? "gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm" : "gap-2 px-3 py-2 rounded-xl text-sm font-medium"}
          ${
            pillActive
              ? "bg-white dark:bg-dark-elevated border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              : "bg-white dark:bg-dark-elevated border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800"
          }
        `}
      >
        {Icon && (
          <Icon
            className={`${isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} ${
              pillActive
                ? "text-brand-600 dark:text-brand-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          />
        )}

        <span className="truncate max-w-[200px]">
          {labelAll ? getDisplayText() : label}
        </span>

        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>

      {abierto && (
        <div className={dropdownBase}>
          {/* TODAS LAS CATEGORÍAS */}
          {labelAll && (
            <>
              <button
                onClick={() => onChange([])}
                className={`${optionBase} px-3 py-2.5 ${
                  seleccionadas.length === 0
                    ? "bg-slate-100 dark:bg-slate-700/70 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
                }`}
              >
                <span
                  className={`${checkboxBase} ${
                    seleccionadas.length === 0
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {seleccionadas.length === 0 && <Check className="w-3 h-3" />}
                </span>
                {labelAll}
              </button>

              <div className="h-px my-1 bg-slate-200 dark:bg-slate-700" />
            </>
          )}

          {/* OPCIONES */}
          {opciones.map((opcion) => {
            const sel = seleccionadas.includes(opcion);

            return (
              <button
                key={opcion}
                onClick={() => toggle(opcion)}
                className={`${optionBase} px-3 py-2.5 ${
                  sel
                    ? "bg-slate-100 dark:bg-slate-700/70 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
                }`}
              >
                <span
                  className={`${checkboxBase} ${
                    sel
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {sel && <Check className="w-3 h-3" />}
                </span>

                <span className="truncate">{opcion}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}