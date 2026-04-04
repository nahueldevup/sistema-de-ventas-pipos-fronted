import { useState, useMemo } from "react";
import {
  X, Search, Check, TrendingUp, AlertCircle,
  Package, ArrowRight, Save, RotateCcw, DollarSign
} from "lucide-react";
import type { Producto } from "@/types/producto.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalActualizarPreciosProps {
  isOpen: boolean;
  onClose: () => void;
  todosLosProductos: Producto[];
  onActualizarPrecios: (productosIds: string[], nuevoPrecio: number | ((prev: number) => number)) => void;
}

export default function ModalActualizarPrecios({
  isOpen,
  onClose,
  todosLosProductos,
  onActualizarPrecios,
}: ModalActualizarPreciosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  
  // Estados para el cálculo de precios
  const [tipoAjuste, setTipoAjuste] = useState<"porcentaje" | "monto">("porcentaje");
  const [valorAjuste, setValorAjuste] = useState<string>("");
  const [esAumento, setEsAumento] = useState(true);

  // Estado para confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return [];
    const lowerBusqueda = busqueda.toLowerCase();
    return todosLosProductos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(lowerBusqueda) ||
        p.codigo.toLowerCase().includes(lowerBusqueda)
    );
  }, [busqueda, todosLosProductos]);

  const productosSeleccionadosList = useMemo(
    () => todosLosProductos.filter((p) => seleccionados.has(p.id)),
    [todosLosProductos, seleccionados]
  );

  // Cálculos de preview
  const calculoPreview = useMemo(() => {
    const valor = parseFloat(valorAjuste) || 0;
    return productosSeleccionadosList.map((prod) => {
      let nuevoPrecio = prod.precioVenta;
      
      if (tipoAjuste === "porcentaje") {
        const factor = esAumento ? (1 + valor / 100) : (1 - valor / 100);
        nuevoPrecio = prod.precioVenta * factor;
      } else {
        nuevoPrecio = esAumento ? prod.precioVenta + valor : prod.precioVenta - valor;
      }

      if (nuevoPrecio < 0) nuevoPrecio = 0;

      return {
        ...prod,
        precioAnterior: prod.precioVenta,
        precioNuevo: nuevoPrecio,
        diferencia: nuevoPrecio - prod.precioVenta
      };
    });
  }, [productosSeleccionadosList, tipoAjuste, valorAjuste, esAumento]);

  const totalDiferencia = calculoPreview.reduce((acc, curr) => acc + curr.diferencia, 0);

  // Handlers
  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const seleccionarTodosEnPagina = () => {
    if (productosFiltrados.length === 0) return;
    const todosSeleccionados = productosFiltrados.every(p => seleccionados.has(p.id));
    
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (todosSeleccionados) {
        productosFiltrados.forEach(p => next.delete(p.id));
      } else {
        productosFiltrados.forEach(p => next.add(p.id));
      }
      return next;
    });
  };

  const handleConfirmarInicio = () => {
    if (seleccionados.size === 0 || !valorAjuste) return;
    setMostrarConfirmacion(true);
  };

  const ejecutarActualizacion = () => {
    const ids = Array.from(seleccionados);
    
    const funcionCalculo = (precioActual: number) => {
       const valor = parseFloat(valorAjuste) || 0;
       let nuevo = precioActual;
       if (tipoAjuste === "porcentaje") {
         nuevo = precioActual * (esAumento ? (1 + valor/100) : (1 - valor/100));
       } else {
         nuevo = esAumento ? precioActual + valor : precioActual - valor;
       }
       return Math.max(0, nuevo);
    };

    onActualizarPrecios(ids, funcionCalculo);
    
    setMostrarConfirmacion(false);
    setSeleccionados(new Set());
    setBusqueda("");
    setValorAjuste("");
    onClose();
  };

  const formatearMoneda = (val: number) => 
    val.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[calc(100%-2rem)] sm:max-w-5xl p-0 gap-0 overflow-hidden bg-white dark:bg-dark-card border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh]" 
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Actualizar Precios Masivos</DialogTitle>

        {/* Overlay de Confirmación */}
        {mostrarConfirmacion && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-gray-100 dark:border-dark-border bg-amber-50/50 dark:bg-amber-900/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Confirmar Cambios</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Estás por actualizar <span className="font-bold text-slate-800 dark:text-slate-200">{seleccionados.size} productos</span>.
                </p>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-dashed border-gray-200 dark:border-dark-border">
                    <span className="text-slate-500 dark:text-slate-400">Impacto Total Estimado:</span>
                    <span className={`font-bold text-lg ${totalDiferencia >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {totalDiferencia >= 0 ? '+' : ''}{formatearMoneda(totalDiferencia)}
                    </span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {calculoPreview.slice(0, 10).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs py-2 px-3 bg-gray-50 dark:bg-dark-elevated rounded-lg">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-1/2">{item.nombre}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-400 line-through">{formatearMoneda(item.precioAnterior)}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{formatearMoneda(item.precioNuevo)}</span>
                        </div>
                      </div>
                    ))}
                    {calculoPreview.length > 10 && (
                      <p className="text-center text-xs text-slate-400 italic pt-2">
                        ...y {calculoPreview.length - 10} productos más
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated/50 flex gap-3">
                <button
                  onClick={() => setMostrarConfirmacion(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-dark-card transition-colors"
                >
                  Revisar
                </button>
                <button
                  onClick={ejecutarActualizacion}
                  className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Compacto */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-indigo-50 to-white dark:from-dark-elevated dark:to-dark-card shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              Actualización Masiva de Precios
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Selecciona productos a la izquierda y configura el ajuste a la derecha
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout de Dos Columnas */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          
          {/* COLUMNA IZQUIERDA: Selección */}
          <div className="w-full md:w-2/5 border-r border-gray-100 dark:border-dark-border flex flex-col bg-white dark:bg-dark-card min-w-0">
            <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-elevated/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  1. Seleccionar Productos
                </h3>
                {productosFiltrados.length > 0 && (
                  <button 
                    onClick={seleccionarTodosEnPagina}
                    className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {productosFiltrados.every(p => seleccionados.has(p.id)) ? 'Deseleccionar todos' : 'Todos'}
                  </button>
                )}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full border border-gray-200 dark:border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-elevated shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {!busqueda ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center px-4">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs font-medium">Escribe para buscar productos</p>
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center px-4">
                  <Package className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs font-medium">No se encontraron resultados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {productosFiltrados.map((prod) => {
                    const isSelected = seleccionados.has(prod.id);
                    return (
                      <button
                        key={prod.id}
                        onClick={() => toggleSeleccion(prod.id)}
                        className={`w-full flex items-center p-2.5 rounded-lg border text-left transition-all group ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500"
                            : "border-gray-100 dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-dark-card hover:shadow-sm"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border mr-3 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-brand-500 border-brand-500 text-white" : "border-gray-300 dark:border-slate-600 bg-white dark:bg-dark-card"
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isSelected ? "text-brand-900 dark:text-brand-100" : "text-slate-700 dark:text-slate-200"}`}>
                            {prod.nombre}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {prod.codigo} • <span className="font-semibold">${prod.precioVenta.toLocaleString()}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer pequeño de selección */}
            {seleccionados.size > 0 && (
              <div className="p-3 border-t border-gray-100 dark:border-dark-border bg-brand-50/50 dark:bg-brand-900/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    {seleccionados.size} seleccionados
                  </span>
                  <button 
                    onClick={() => setSeleccionados(new Set())}
                    className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Configuración (Sticky) */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-dark-elevated/30 min-w-0">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="max-w-md mx-auto">
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                  2. Configurar Ajuste
                </h3>

                {seleccionados.size === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Selecciona productos primero</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Elige al menos un producto de la lista izquierda</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    {/* Toggle Aumento/Descuento */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">Dirección</label>
                      <div className="flex p-1 bg-gray-100 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
                        <button
                          onClick={() => setEsAumento(true)}
                          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                            esAumento 
                              ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20" 
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" /> Aumento
                        </button>
                        <button
                          onClick={() => setEsAumento(false)}
                          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                            !esAumento 
                              ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm ring-1 ring-rose-500/20" 
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5 rotate-180" /> Descuento
                        </button>
                      </div>
                    </div>

                    {/* Selector Porcentaje vs Monto */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">Tipo de Valor</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setTipoAjuste("porcentaje")}
                          className={`p-3 border-2 rounded-xl text-center transition-all ${
                            tipoAjuste === "porcentaje"
                              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                              : "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span className="block text-xs font-bold uppercase mb-1">Porcentaje</span>
                          <span className="text-xl font-black">%</span>
                        </button>
                        <button
                          onClick={() => setTipoAjuste("monto")}
                          className={`p-3 border-2 rounded-xl text-center transition-all ${
                            tipoAjuste === "monto"
                              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                              : "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <span className="block text-xs font-bold uppercase mb-1">Monto Fijo</span>
                          <span className="text-xl font-black">$</span>
                        </button>
                      </div>
                    </div>

                    {/* Input Valor */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">
                        Valor del {esAumento ? 'aumento' : 'descuento'}
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                          {tipoAjuste === "porcentaje" ? "%" : "$"}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={valorAjuste}
                          onChange={(e) => setValorAjuste(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 text-lg font-bold border-2 border-gray-200 dark:border-dark-border rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Preview Resumen */}
                    {valorAjuste && (
                      <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Impacto Total Estimado</p>
                          <p className={`text-xl font-black ${totalDiferencia >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {totalDiferencia >= 0 ? '+' : ''}{formatearMoneda(totalDiferencia)}
                          </p>
                        </div>
                        
                        <Button
                          onClick={handleConfirmarInicio}
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Aplicar a {seleccionados.size} productos
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Simple (Solo móvil si fuera necesario, pero en desktop está integrado) */}
        <div className="md:hidden p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated/50 text-center">
           <p className="text-xs text-slate-400 dark:text-slate-500">
             Gira el dispositivo para ver el panel de configuración.
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}