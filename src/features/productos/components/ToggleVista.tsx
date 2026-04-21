import { LayoutGrid, List} from "lucide-react";

export type TipoVista = "tabla" | "cards";

interface ToggleVistaProps {
  vista: TipoVista;
  onChange: (vista: TipoVista) => void;
}

export default function ToggleVista({ vista, onChange }: ToggleVistaProps) {
  return (
    <div className="flex items-center h-[38px] border border-[#E5E7EB] dark:border-dark-border rounded-xl bg-white dark:bg-dark-elevated shadow-sm overflow-hidden p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => onChange("tabla")}
        title="Vista tabla"
        aria-label="Vista tabla"
        aria-pressed={vista === "tabla"}
        className={`
          flex items-center justify-center w-8 h-full rounded-lg
          transition-all duration-150 cursor-pointer
          ${
            vista === "tabla"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          }
        `}
      >
        <List size={19}/>
      </button>

      <button
        type="button"
        onClick={() => onChange("cards")}
        title="Vista cards"
        aria-label="Vista cards"
        aria-pressed={vista === "cards"}
        className={`
          flex items-center justify-center w-8 h-full rounded-lg
          transition-all duration-150 cursor-pointer
          ${
            vista === "cards"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          }
        `}
      >
        <LayoutGrid size={19}/>
      </button>
    </div>
  );
}
