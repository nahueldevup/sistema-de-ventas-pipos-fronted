import type { LucideIcon } from "lucide-react"

interface TarjetaAccesoRapidoProps {
  titulo: string;
  descripcion: string;
  Icono: LucideIcon;
  temaColor: "naranja" | "azul" | "purpura" | "esmeralda" | "indigo" | "pizarra";
  onClick?: () => void;
}

const mapaColores = {
  naranja: { fondoClaro: "bg-orange-50 dark:bg-orange-900/20", fondoIcono: "bg-orange-100 dark:bg-orange-900/40", textoIcono: "text-orange-600 dark:text-orange-400", hoverFondo: "group-hover:bg-orange-600" },
  azul: { fondoClaro: "bg-blue-50 dark:bg-blue-900/20", fondoIcono: "bg-blue-100 dark:bg-blue-900/40", textoIcono: "text-blue-600 dark:text-blue-400", hoverFondo: "group-hover:bg-blue-600" },
  purpura: { fondoClaro: "bg-purple-50 dark:bg-purple-900/20", fondoIcono: "bg-purple-100 dark:bg-purple-900/40", textoIcono: "text-purple-600 dark:text-purple-400", hoverFondo: "group-hover:bg-purple-600" },
  esmeralda: { fondoClaro: "bg-emerald-50 dark:bg-emerald-900/20", fondoIcono: "bg-emerald-100 dark:bg-emerald-900/40", textoIcono: "text-emerald-600 dark:text-emerald-400", hoverFondo: "group-hover:bg-emerald-600" },
  indigo: { fondoClaro: "bg-indigo-50 dark:bg-indigo-900/20", fondoIcono: "bg-indigo-100 dark:bg-indigo-900/40", textoIcono: "text-indigo-600 dark:text-indigo-400", hoverFondo: "group-hover:bg-indigo-600" },
  pizarra: { fondoClaro: "bg-slate-50 dark:bg-slate-800/50", fondoIcono: "bg-slate-100 dark:bg-slate-700", textoIcono: "text-slate-600 dark:text-slate-400", hoverFondo: "group-hover:bg-slate-600" },
}

export default function TarjetaAccesoRapido({ titulo, descripcion, Icono, temaColor, onClick }: TarjetaAccesoRapidoProps) {
  const colores = mapaColores[temaColor]

  return (
    <button 
      onClick={onClick}
      className="cursor-pointer group bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft hover:shadow-float hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${colores.fondoClaro}`}></div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative z-10 transition-colors group-hover:text-white ${colores.fondoIcono} ${colores.textoIcono} ${colores.hoverFondo}`}>
        <Icono className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 relative z-10">{titulo}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 relative z-10">{descripcion}</p>
    </button>
  )
} 