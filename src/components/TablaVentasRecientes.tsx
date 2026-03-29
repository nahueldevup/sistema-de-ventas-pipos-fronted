import { ChevronRight } from "lucide-react"

export default function TablaVentasRecientes() {
  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ventas Recientes</h3>
        <button className="cursor-pointer text-sm text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300">Ver todo</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-gray-50 dark:border-dark-border">
              <th className="pb-3 pl-2">Folio</th>
              <th className="pb-3">Cliente</th>
              <th className="pb-3">Método</th>
              <th className="pb-3">Total</th>
              <th className="pb-3 text-right pr-2">Estado</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="group hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors">
              <td className="py-4 pl-2 font-medium text-slate-700 dark:text-slate-200">#V-2938</td>
              <td className="py-4 text-slate-600 dark:text-slate-300">Público General</td>
              <td className="py-4"><span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold">Efectivo</span></td>
              <td className="py-4 font-bold text-slate-800 dark:text-slate-100">$163.00</td>
              <td className="py-4 text-right pr-2 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 cursor-pointer">
                <ChevronRight className="w-5 h-5 inline" />
              </td>
            </tr>
            <tr className="group hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors">
              <td className="py-4 pl-2 font-medium text-slate-700 dark:text-slate-200">#V-2937</td>
              <td className="py-4 text-slate-600 dark:text-slate-300">Juan Pérez</td>
              <td className="py-4"><span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-xs font-semibold">Tarjeta</span></td>
              <td className="py-4 font-bold text-slate-800 dark:text-slate-100">$450.50</td>
              <td className="py-4 text-right pr-2 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 cursor-pointer">
                <ChevronRight className="w-5 h-5 inline" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}