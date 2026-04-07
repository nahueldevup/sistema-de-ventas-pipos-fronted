import { AlertTriangle, ShoppingBag, Box, Users, Wallet, BarChart3, Settings } from "lucide-react"
import TarjetaAccesoRapido from "@/components/TarjetaAccesoRapido"
import TablaVentasRecientes from "@/components/TablaVentasRecientes"

export default function PanelControl() {
  const accionesRapidas = [
    { titulo: "Realizar una venta", descripcion: "Iniciar nueva transacción rápida", icono: ShoppingBag, color: "naranja" },
    { titulo: "Productos", descripcion: "Gestionar inventario y precios", icono: Box, color: "azul" },
    { titulo: "Clientes", descripcion: "Historial y datos de contacto", icono: Users, color: "purpura" },
    { titulo: "Caja", descripcion: "Apertura, cierre y arqueos", icono: Wallet, color: "esmeralda" },
    { titulo: "Reportes", descripcion: "Ventas, ganancias y métricas", icono: BarChart3, color: "indigo" },
    { titulo: "Configuración", descripcion: "Ajustes del sistema", icono: Settings, color: "pizarra" },
  ] as const;

  return (
    <>
      {/* Tarjeta de Alerta */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-white dark:bg-red-900/30 rounded-xl text-red-500 shadow-sm shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-red-800 dark:text-red-300 font-bold text-lg">¡Atención! Productos con stock bajo</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1 mb-3">Hay 14 productos con existencia por debajo del mínimo.</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white dark:bg-red-900/30 border border-red-100 dark:border-red-700 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300">Aceite 1-2-3 1L</span>
            <span className="px-3 py-1 bg-white dark:bg-red-900/30 border border-red-100 dark:border-red-700 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300">Arroz La Merced</span>
            <span className="px-3 py-1 bg-white/50 dark:bg-red-900/20 border border-red-100 dark:border-red-700 rounded-lg text-xs text-red-500 dark:text-red-400 flex items-center">+ 12 más</span>
          </div>
        </div>
        <button className="px-4 py-2 bg-white dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm font-semibold rounded-lg border border-red-100 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors shadow-sm whitespace-nowrap cursor-pointer">
          Ver todos
        </button>
      </div>

      {/* Grid de Accesos Rápidos */}
      <h3 className="text-lg font-bold text-foreground mb-4">Accesos Rápidos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {accionesRapidas.map((accion, indice) => (
          <TarjetaAccesoRapido 
            key={indice}
            titulo={accion.titulo}
            descripcion={accion.descripcion}
            Icono={accion.icono}
            temaColor={accion.color}
            onClick={() => console.log(`Clicaste en: ${accion.titulo}`)}
          />
        ))}
      </div>

      {/* Tabla de Ventas Recientes */}
      <TablaVentasRecientes />

      <div className="h-10"></div>
    </>
  )
}