import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// ─── Props de SingleSelect ───────────────────────────────────────────────────
export interface SingleSelectProps {
  opciones: string[];
  seleccionada: string; // valor actual; "all" = sin filtro
  onChange: (val: string) => void;
  label?: string;
  labelAll?: string;
  icon?: React.ElementType;
  size?: "default" | "small";
}

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKeyDown);
    };
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
    `absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-lg z-50 min-w-[220px] py-1 max-h-64 overflow-y-auto
     transition-all duration-150 ease-out origin-top`;

  const dropdownState = abierto
    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
    : "opacity-0 scale-95 -translate-y-1 pointer-events-none";

  const optionBase =
    `w-full text-left text-sm flex items-center gap-2.5 transition-all duration-150 cursor-pointer
     focus:outline-none`;

  const checkboxBase =
    `w-4 h-4 shrink-0 rounded-md border flex items-center justify-center transition-all duration-150`;

  const checkIconClass = "w-3 h-3 transition-all duration-150 scale-100";

  // ─── Variante "field" (modales / formularios) ─────────────────────────────
  if (variant === "field") {
    return (
      <div className="relative mt-2" ref={ref}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={abierto}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:border-brand-500 ${
            seleccionadas.length > 0
              ? "bg-white dark:bg-dark-elevated border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 shadow-sm"
              : "bg-white dark:bg-dark-elevated border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
          } ${abierto ? "shadow-md" : ""}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {Icon && (
              <Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                seleccionadas.length > 0
                  ? "text-brand-600 dark:text-brand-300"
                  : "text-slate-500 dark:text-slate-400"
              }`} />
            )}

            {labelAll ? (
              <span className="font-medium truncate">{getDisplayText()}</span>
            ) : seleccionadas.length === 0 ? (
              <span className="truncate">{placeholder}</span>
            ) : (
              <span className="font-semibold truncate">
                {seleccionadas.length}{" "}
                {seleccionadas.length === 1 ? "seleccionada" : "seleccionadas"}
              </span>
            )}
          </div>

          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              abierto ? "rotate-180" : ""
            }`}
          />
        </button>

        <div className={`${dropdownBase} ${dropdownState}`} role="listbox" aria-multiselectable="true">
          {labelAll && (
            <>
              <button
                type="button"
                onClick={() => onChange([])}
                className={`${optionBase} px-4 py-2.5 ${
                  seleccionadas.length === 0
                    ? "bg-slate-100 dark:bg-slate-700/70 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
                }`}
              >
                <span
                  className={`${checkboxBase} ${
                    seleccionadas.length === 0
                      ? "bg-brand-600 border-brand-600 text-white shadow-sm scale-100"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent hover:border-slate-400 dark:hover:border-slate-500"
                  }`}
                >
                  {seleccionadas.length === 0 && <Check className={checkIconClass} />}
                </span>
                <span className="truncate">{labelAll}</span>
              </button>

              <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
            </>
          )}

          {opciones.length === 0 && (
            <p className="px-4 py-2 text-sm text-slate-400 dark:text-slate-500">
              Sin opciones
            </p>
          )}

          {opciones.map((opcion) => {
            const sel = seleccionadas.includes(opcion);

            return (
              <button
                key={opcion}
                type="button"
                onClick={() => toggle(opcion)}
                className={`${optionBase} px-4 py-2.5 ${
                  sel
                    ? "bg-slate-100 dark:bg-slate-700/70 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
                }`}
              >
                <span
                  className={`${checkboxBase} ${
                    sel
                      ? "bg-brand-600 border-brand-600 text-white shadow-sm scale-100"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent hover:border-slate-400 dark:hover:border-slate-500"
                  }`}
                >
                  {sel && <Check className={checkIconClass} />}
                </span>
                <span className="truncate transition-transform duration-150 group-hover:translate-x-[1px]">
                  {opcion}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Variante "pill" (header / filtros rápidos) ───────────────────────────
  const pillActive = seleccionadas.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className={`
          inline-flex items-center transition-all duration-150 border outline-none focus-visible:ring-2 focus-visible:ring-slate-500/20
          ${isSmall ? "gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm" : "gap-2 px-3 py-2 rounded-xl text-sm font-medium"}
          ${
            pillActive
              ? "bg-white dark:bg-dark-elevated border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              : "bg-white dark:bg-dark-elevated border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800"
          }
          ${abierto ? "shadow-md -translate-y-[1px]" : ""}
        `}
      >
        {Icon && (
          <Icon
            className={`${isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0 transition-colors duration-150 ${
              pillActive ? "text-brand-600 dark:text-brand-300" : "text-slate-500 dark:text-slate-400"
            }`}
          />
        )}

        <span className={isSmall ? "max-w-[160px] truncate" : "max-w-[210px] truncate"}>
          {labelAll ? getDisplayText() : label}
        </span>

        {!labelAll && seleccionadas.length > 0 && (
          <span
            className={`bg-brand-600 text-white flex items-center justify-center ml-0.5 rounded-full transition-transform duration-150 ${
              isSmall ? "text-[10px] font-bold w-4 h-4" : "text-xs w-5 h-5"
            } ${abierto ? "scale-105" : ""}`}
          >
            {seleccionadas.length}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 ${
            abierto ? "rotate-180 text-slate-600 dark:text-slate-300" : pillActive ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
          }`}
        />
      </button>

      <div className={`${dropdownBase} ${dropdownState}`} role="listbox" aria-multiselectable="true">
        {labelAll && (
          <>
            <button
              type="button"
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
                    ? "bg-brand-600 border-brand-600 text-white shadow-sm scale-100"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                {seleccionadas.length === 0 && <Check className={checkIconClass} />}
              </span>
              <span className="truncate">{labelAll}</span>
            </button>

            <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
          </>
        )}

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
              type="button"
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
                    ? "bg-brand-600 border-brand-600 text-white shadow-sm scale-100"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                {sel && <Check className={checkIconClass} />}
              </span>
              <span className="truncate">{opcion}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── SingleSelect ────────────────────────────────────────────────────────────
export function SingleSelect({
  opciones,
  seleccionada,
  onChange,
  label = "Seleccionar",
  labelAll = "Todas las categorías",
  icon: Icon,
  size = "small",
}: SingleSelectProps) {
  const isSmall = size === "small";
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const tieneSeleccion = seleccionada !== "all";
  const textoBoton = tieneSeleccion ? seleccionada : label;

  const handleSelect = (val: string) => {
    onChange(val);
    setAbierto(false);
  };

  const dropdownBase =
    `absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-lg z-50 min-w-[220px] py-1 max-h-64 overflow-y-auto
     transition-all duration-150 ease-out origin-top`;

  const dropdownState = abierto
    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
    : "opacity-0 scale-95 -translate-y-1 pointer-events-none";

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className={`
          inline-flex items-center transition-all duration-150 border outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25 focus-visible:border-brand-500
          ${isSmall ? "gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm" : "gap-2 px-3 py-2 rounded-xl text-sm font-medium"}
          ${
            tieneSeleccion
              ? "bg-white dark:bg-dark-elevated border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 hover:bg-brand-50/60 dark:hover:bg-brand-900/20 shadow-sm"
              : "bg-white dark:bg-dark-elevated border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
          }
          ${abierto ? "shadow-md -translate-y-[1px]" : ""}
        `}
      >
        {Icon && <Icon className={isSmall ? "w-3.5 h-3.5 shrink-0" : "w-4 h-4 shrink-0"} />}
        <span className="max-w-[150px] truncate">{textoBoton}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`${dropdownBase} ${dropdownState}`} role="listbox">
        <button
          type="button"
          onClick={() => handleSelect("all")}
          className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-all duration-150 cursor-pointer focus:outline-none ${
            !tieneSeleccion
              ? "bg-brand-50/70 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-semibold"
              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
          }`}
        >
          <span
            className={`w-4 h-4 shrink-0 flex items-center justify-center rounded-full border transition-all duration-150 ${
              !tieneSeleccion
                ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent"
            }`}
          >
            {!tieneSeleccion && <Check className="w-3 h-3" />}
          </span>
          <span className="truncate">{labelAll}</span>
        </button>

        {opciones.map((opcion) => {
          const sel = seleccionada === opcion;

          return (
            <button
              key={opcion}
              type="button"
              onClick={() => handleSelect(opcion)}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-all duration-150 cursor-pointer focus:outline-none ${
                sel
                  ? "bg-brand-50/70 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80"
              }`}
            >
              <span
                className={`w-4 h-4 shrink-0 flex items-center justify-center rounded-full border transition-all duration-150 ${
                  sel
                    ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent"
                }`}
              >
                {sel && <Check className="w-3 h-3" />}
              </span>
              <span className="truncate">{opcion}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}