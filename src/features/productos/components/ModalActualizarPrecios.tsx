import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Check,
  TrendingUp,
  AlertCircle,
  Package,
  ArrowRight,
  Save,
  RotateCcw,
  Filter,
  Truck,
  Percent,
  DollarSign,
  Minus,
} from "lucide-react";
import type { Producto } from "@/types/producto.types";
import { ModalAccion } from "@/components/ui/modal-wrappers";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";

interface ModalActualizarPreciosProps {
  isOpen: boolean;
  onClose: () => void;
  todosLosProductos: Producto[];
  onActualizarPrecios: (
    productosIds: string[],
    nuevoPrecio: number | ((prev: number) => number)
  ) => void;
}

type ModoAjuste = "porcentaje" | "monto" | "margen";

const calcularMargen = (precioVenta: number, precioCompra: number) => {
  if (precioCompra <= 0) return null;
  return ((precioVenta - precioCompra) / precioCompra) * 100;
};

const redondearPrecio = (valor: number) => Number(valor.toFixed(2));

export default function ModalActualizarPrecios({
  isOpen,
  onClose,
  todosLosProductos,
  onActualizarPrecios,
}: ModalActualizarPreciosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriasFiltro, setCategoriasFiltro] = useState<string[]>([]);
  const [proveedoresFiltro, setProveedoresFiltro] = useState<string[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const [modoAjuste, setModoAjuste] = useState<ModoAjuste>("porcentaje");
  const [valorAjuste, setValorAjuste] = useState<string>("");
  const [esAumento, setEsAumento] = useState(true);
  const [mantenerMargenOriginal, setMantenerMargenOriginal] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const categoriasUnicas = useMemo(() => {
    const cats = new Set<string>();
    todosLosProductos.forEach((p) => {
      if (p.categoria) cats.add(p.categoria);
    });
    return Array.from(cats).sort();
  }, [todosLosProductos]);

  const proveedoresUnicos = useMemo(() => {
    const provs = new Set<string>();
    todosLosProductos.forEach((p) => {
      if (p.proveedor) provs.add(p.proveedor);
    });
    return Array.from(provs).sort();
  }, [todosLosProductos]);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim() && categoriasFiltro.length === 0 && proveedoresFiltro.length === 0) {
      return [];
    }

    let result = todosLosProductos;

    if (categoriasFiltro.length > 0) {
      result = result.filter((p) => categoriasFiltro.includes(p.categoria));
    }

    if (proveedoresFiltro.length > 0) {
      result = result.filter(
        (p) => p.proveedor && proveedoresFiltro.includes(p.proveedor)
      );
    }

    if (busqueda.trim()) {
      const lowerBusqueda = busqueda.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(lowerBusqueda) ||
          p.codigo.toLowerCase().includes(lowerBusqueda)
      );
    }

    return result;
  }, [busqueda, categoriasFiltro, proveedoresFiltro, todosLosProductos]);

  const productosSeleccionadosList = useMemo(
    () => todosLosProductos.filter((p) => seleccionados.has(p.id)),
    [todosLosProductos, seleccionados]
  );

  const calcularNuevoPrecio = useCallback(
    (precioActual: number, precioCompra: number, valor: number) => {
      if (modoAjuste === "margen") {
        if (precioCompra <= 0) return Math.max(0, precioActual);
        return Math.max(0, redondearPrecio(precioCompra * (1 + valor / 100)));
      }

      if (mantenerMargenOriginal && precioCompra > 0) {
        const nuevoCosto = esAumento
          ? precioCompra * (1 + valor / 100)
          : precioCompra * (1 - valor / 100);

        const margenOriginal = calcularMargen(precioActual, precioCompra) ?? 0;
        return Math.max(
          0,
          redondearPrecio(nuevoCosto * (1 + margenOriginal / 100))
        );
      }

      if (modoAjuste === "porcentaje") {
        const factor = esAumento ? 1 + valor / 100 : 1 - valor / 100;
        return Math.max(0, redondearPrecio(precioActual * factor));
      }

      const nuevoPrecio = esAumento ? precioActual + valor : precioActual - valor;
      return Math.max(0, redondearPrecio(nuevoPrecio));
    },
    [modoAjuste, mantenerMargenOriginal, esAumento]
  );

  const calculoPreview = useMemo(() => {
    const valor = parseFloat(valorAjuste) || 0;

    return productosSeleccionadosList.map((prod) => {
      const margenAntes = calcularMargen(prod.precioVenta, prod.precioCompra);
      const precioNuevo = calcularNuevoPrecio(
        prod.precioVenta,
        prod.precioCompra,
        valor
      );
      const margenDespues = calcularMargen(precioNuevo, prod.precioCompra);

      return {
        ...prod,
        precioAnterior: prod.precioVenta,
        precioNuevo,
        diferencia: precioNuevo - prod.precioVenta,
        margenAntes,
        margenDespues,
        gananciaAntes: prod.precioVenta - prod.precioCompra,
        gananciaDespues: precioNuevo - prod.precioCompra,
      };
    });
  }, [productosSeleccionadosList, valorAjuste, calcularNuevoPrecio]);

  const totalDiferencia = calculoPreview.reduce(
    (acc, curr) => acc + curr.diferencia,
    0
  );

  const resumenMargen = useMemo(() => {
    const validos = calculoPreview.filter(
      (p) => p.margenAntes !== null && p.margenDespues !== null
    );

    if (validos.length === 0) {
      return { promedioAntes: null, promedioDespues: null };
    }

    const promedioAntes =
      validos.reduce((acc, p) => acc + (p.margenAntes ?? 0), 0) / validos.length;

    const promedioDespues =
      validos.reduce((acc, p) => acc + (p.margenDespues ?? 0), 0) / validos.length;

    return { promedioAntes, promedioDespues };
  }, [calculoPreview]);

  const ejemploRapido = useMemo(() => {
    const productoBase = productosSeleccionadosList[0] ?? todosLosProductos[0];
    if (!productoBase) return null;

    const valor = parseFloat(valorAjuste) || 0;
    const precioNuevo = calcularNuevoPrecio(
      productoBase.precioVenta,
      productoBase.precioCompra,
      valor
    );

    return {
      nombre: productoBase.nombre,
      precioAnterior: productoBase.precioVenta,
      precioNuevo,
      gananciaAntes: productoBase.precioVenta - productoBase.precioCompra,
      gananciaDespues: precioNuevo - productoBase.precioCompra,
    };
  }, [productosSeleccionadosList, todosLosProductos, valorAjuste, calcularNuevoPrecio]);

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const seleccionarTodosEnPagina = () => {
    if (productosFiltrados.length === 0) return;

    const todosSeleccionados = productosFiltrados.every((p) =>
      seleccionados.has(p.id)
    );

    setSeleccionados((prev) => {
      const next = new Set(prev);

      if (todosSeleccionados) {
        productosFiltrados.forEach((p) => next.delete(p.id));
      } else {
        productosFiltrados.forEach((p) => next.add(p.id));
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
    const valor = parseFloat(valorAjuste) || 0;

    const idsSet = new Set(ids);
    const preciosActuales = new Map<string, number>();
    const costosActuales = new Map<string, number>();

    todosLosProductos.forEach((p) => {
      if (idsSet.has(p.id)) {
        preciosActuales.set(p.id, p.precioVenta);
        costosActuales.set(p.id, p.precioCompra);
      }
    });

    let indice = 0;
    const funcionCalculo = () => {
      const idActual = ids[indice++];
      const precioActual = preciosActuales.get(idActual) ?? 0;
      const precioCompra = costosActuales.get(idActual) ?? 0;
      return calcularNuevoPrecio(precioActual, precioCompra, valor);
    };

    onActualizarPrecios(ids, funcionCalculo);

    setMostrarConfirmacion(false);
    setSeleccionados(new Set());
    setBusqueda("");
    setCategoriasFiltro([]);
    setProveedoresFiltro([]);
    setValorAjuste("");
    setMantenerMargenOriginal(false);
    setModoAjuste("porcentaje");
    setEsAumento(true);
    onClose();
  };

  const formatearMoneda = (val: number) =>
    val.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });

  const formatearMargen = (val: number | null) =>
    val === null ? "N/D" : `${val.toFixed(2)}%`;

  const getTituloValor = () => {
    if (modoAjuste === "margen") return "¿Qué ganancia (%) querés dejar?";
    return esAumento ? "¿Cuánto querés subir?" : "¿Cuánto querés bajar?";
  };

  const getPlaceholderValor = () => {
    if (modoAjuste === "margen") return "Ej: 30";
    if (modoAjuste === "monto") return "Ej: 500";
    return "Ej: 10";
  };

  const getTextoAyuda = () => {
    if (modoAjuste === "margen") {
      return "El sistema va a calcular el nuevo precio según el costo del producto.";
    }

    if (modoAjuste === "monto") {
      return esAumento
        ? "Se suma un monto fijo al precio actual."
        : "Se resta un monto fijo al precio actual.";
    }

    return esAumento
      ? "Se aumenta un porcentaje sobre el precio actual."
      : "Se descuenta un porcentaje del precio actual.";
  };

  return (
    <ModalAccion
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Ajustar precios"
      subtitle="Elegí productos, definí el ajuste y revisá el resultado antes de confirmar"
      titleIcon={<TrendingUp className="w-5 h-5 text-brand-600" />}
      onCancelar={onClose}
      onAccion={handleConfirmarInicio}
      accionLabel="APLICAR"
      accionIcon={<Save className="w-4 h-4" />}
      accionDisabled={seleccionados.size === 0 || !valorAjuste}
    >
      {mostrarConfirmacion && (
        <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border shadow-lg rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-dark-border bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-slate-100">
                  Confirmar cambios
                </h3>
              </div>
              <p className="text-sm text-[#6B7280] dark:text-slate-400">
                Vas a actualizar{" "}
                <span className="font-semibold text-[#1F2937] dark:text-slate-200">
                  {seleccionados.size} productos
                </span>.
              </p>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm pb-3 border-b border-dashed border-[#E5E7EB] dark:border-dark-border">
                  <span className="text-[#6B7280] dark:text-slate-400">
                    Cambio total estimado:
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      totalDiferencia >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {totalDiferencia >= 0 ? "+" : ""}
                    {formatearMoneda(totalDiferencia)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pb-3 border-b border-dashed border-[#E5E7EB] dark:border-dark-border">
                  <span className="text-[#6B7280] dark:text-slate-400">
                    Ganancia promedio:
                  </span>
                  <span className="font-bold text-[#1F2937] dark:text-slate-200">
                    {formatearMargen(resumenMargen.promedioAntes)} →{" "}
                    {formatearMargen(resumenMargen.promedioDespues)}
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {calculoPreview.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="text-xs py-2 px-3 bg-[#F6F7F8] dark:bg-dark-elevated rounded-lg"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-medium text-[#1F2937] dark:text-slate-300 truncate w-1/2">
                          {item.nombre}
                        </span>

                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-[#6B7280] line-through">
                            {formatearMoneda(item.precioAnterior)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#6B7280]" />
                          <span className="font-semibold text-[#1F2937] dark:text-slate-200">
                            {formatearMoneda(item.precioNuevo)}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] mt-1 text-[#6B7280] dark:text-slate-400">
                        Ganancia: {formatearMargen(item.margenAntes)} →{" "}
                        {formatearMargen(item.margenDespues)}
                      </p>
                    </div>
                  ))}

                  {calculoPreview.length > 10 && (
                    <p className="text-center text-xs text-[#6B7280] italic pt-2">
                      ...y {calculoPreview.length - 10} productos más
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-dark-border bg-[#F6F7F8] dark:bg-dark-elevated/50 flex justify-end gap-3 mt-auto">
              <Button
                variant="outline"
                onClick={() => setMostrarConfirmacion(false)}
                className="px-5 py-2.5 h-auto text-sm font-semibold text-[#1F2937] dark:text-slate-300 border-[#E5E7EB] dark:border-slate-600 hover:bg-[#F3F4F6] dark:hover:bg-dark-elevated cursor-pointer"
              >
                REVISAR
              </Button>

              <Button
                onClick={ejecutarActualizacion}
                className="px-6 py-2.5 h-auto bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                CONFIRMAR CAMBIOS
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-full md:w-2/5 border-r border-[#E5E7EB] dark:border-dark-border flex flex-col bg-white dark:bg-dark-card min-w-0">
          <div className="p-4 border-b border-[#E5E7EB] dark:border-dark-border bg-[#F6F7F8] dark:bg-dark-elevated/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wide">
                1. Seleccionar productos
              </h3>

              {productosFiltrados.length > 0 && (
                <button
                  onClick={seleccionarTodosEnPagina}
                  className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {productosFiltrados.every((p) => seleccionados.has(p.id))
                    ? "Deseleccionar todos"
                    : "Todos"}
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full border border-[#E5E7EB] dark:border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-[#1F2937] dark:text-slate-200 bg-white dark:bg-dark-elevated"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1 [&_button]:w-full">
                  <MultiSelect
                    label="Categoría"
                    labelAll="Todas las categorías"
                    labelPlural="categorías"
                    icon={Filter}
                    iconSize={14}
                    size="small"
                    variant="pill"
                    opciones={categoriasUnicas}
                    seleccionadas={categoriasFiltro}
                    onChange={setCategoriasFiltro}
                  />
                </div>

                <div className="col-span-1 [&_button]:w-full">
                  <MultiSelect
                    label="Proveedor"
                    labelAll="Todos los proveedores"
                    labelPlural="proveedores"
                    icon={Truck}
                    iconSize={14}
                    size="small"
                    variant="pill"
                    opciones={proveedoresUnicos}
                    seleccionadas={proveedoresFiltro}
                    onChange={setProveedoresFiltro}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto p-3 max-h-[280px]">
            {!busqueda && categoriasFiltro.length === 0 && proveedoresFiltro.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center px-4">
                <Search className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">Escribí algo para buscar productos</p>
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center px-4">
                <Package className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">No se encontraron productos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {productosFiltrados.map((prod) => {
                  const isSelected = seleccionados.has(prod.id);

                  return (
                    <button
                      key={prod.id}
                      onClick={() => toggleSeleccion(prod.id)}
                      className={`w-full flex items-center p-2.5 rounded-lg border text-left transition-all group/item ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500"
                          : "border-[#E5E7EB] dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-dark-card"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border mr-3 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-brand-500 border-brand-500 text-white"
                            : "border-gray-300 dark:border-slate-600 bg-white dark:bg-dark-card"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isSelected
                              ? "text-brand-900 dark:text-brand-100"
                              : "text-[#1F2937] dark:text-slate-200"
                          }`}
                        >
                          {prod.nombre}
                        </p>

                        <p className="text-[10px] text-[#6B7280] dark:text-slate-400 font-mono mt-0.5">
                          {prod.codigo} •{" "}
                          <span className="font-semibold">
                            ${prod.precioVenta.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {seleccionados.size > 0 && (
            <div className="p-3 border-t border-[#E5E7EB] dark:border-dark-border bg-brand-50/50 dark:bg-brand-900/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  {seleccionados.size} seleccionados
                </span>

                <button
                  onClick={() => setSeleccionados(new Set())}
                  className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-1 flex-col bg-[#F6F7F8] dark:bg-dark-elevated/30 min-w-0">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="max-w-md mx-auto">
              <h3 className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wide mb-4">
                2. Configurar ajuste
              </h3>

              <div className="bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-xl p-5 space-y-5 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase">
                    ¿Cómo querés ajustar?
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setModoAjuste("porcentaje")}
                      className={`py-2 px-1 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                        modoAjuste === "porcentaje"
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                          : "border-[#E5E7EB] dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-600 text-[#6B7280] dark:text-slate-400"
                      }`}
                    >
                      <Percent className="w-4 h-4 mb-1" />
                      <span className="text-[10px] sm:text-xs font-semibold uppercase">
                        Porcentaje
                      </span>
                    </button>

                    <button
                      onClick={() => setModoAjuste("monto")}
                      className={`py-2 px-1 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                        modoAjuste === "monto"
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                          : "border-[#E5E7EB] dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-600 text-[#6B7280] dark:text-slate-400"
                      }`}
                    >
                      <DollarSign className="w-4 h-4 mb-1" />
                      <span className="text-[10px] sm:text-xs font-semibold uppercase">
                        Monto
                      </span>
                    </button>

                    <button
                      onClick={() => setModoAjuste("margen")}
                      className={`py-2 px-1 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                        modoAjuste === "margen"
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                          : "border-[#E5E7EB] dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-600 text-[#6B7280] dark:text-slate-400"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 mb-1" />
                      <span className="text-[10px] sm:text-xs font-semibold uppercase">
                        Ganancia %
                      </span>
                    </button>
                  </div>
                </div>

                {modoAjuste !== "margen" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-semibold text-[#6B7280] dark:text-slate-400 mb-2 uppercase">
                      ¿Querés subir o bajar precios?
                    </label>

                    <div className="flex p-1 bg-[#F6F7F8] dark:bg-dark-card rounded-lg border border-[#E5E7EB] dark:border-dark-border">
                      <button
                        onClick={() => setEsAumento(true)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                          esAumento
                            ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
                            : "text-[#6B7280] dark:text-slate-400 hover:text-[#1F2937]"
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Subir
                      </button>

                      <button
                        onClick={() => setEsAumento(false)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                          !esAumento
                            ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm ring-1 ring-rose-500/20"
                            : "text-[#6B7280] dark:text-slate-400 hover:text-[#1F2937]"
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                        Bajar
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] dark:text-slate-400 mb-2 uppercase">
                    {getTituloValor()}
                  </label>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                      {modoAjuste !== "monto" ? (
                        <Percent className="w-5 h-5 text-[#6B7280]" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-[#6B7280]" />
                      )}
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={valorAjuste}
                      onChange={(e) => setValorAjuste(e.target.value)}
                      placeholder={getPlaceholderValor()}
                      className="w-full pl-11 pr-4 py-3 text-lg font-semibold border border-[#E5E7EB] dark:border-dark-border rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all bg-[#F9FAFB] dark:bg-dark-elevated text-[#1F2937] dark:text-slate-200"
                    />
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {getTextoAyuda()}
                  </p>
                </div>

                {ejemploRapido && valorAjuste && (
                  <div className="rounded-xl border border-dashed border-[#D1D5DB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-dark-elevated/60 p-3 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Ejemplo rápido
                    </p>

                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                      {ejemploRapido.nombre}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-mono text-slate-700 dark:text-slate-200">
                      <span>{formatearMoneda(ejemploRapido.precioAnterior)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold">
                        {formatearMoneda(ejemploRapido.precioNuevo)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ganancia estimada:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatearMoneda(ejemploRapido.gananciaAntes)}
                      </span>{" "}
                      →{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatearMoneda(ejemploRapido.gananciaDespues)}
                      </span>
                    </p>
                  </div>
                )}

                {modoAjuste !== "margen" && (
                  <div className="animate-in fade-in duration-300 pt-2 border-t border-dashed border-[#E5E7EB] dark:border-dark-border">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={mantenerMargenOriginal}
                          onChange={(e) =>
                            setMantenerMargenOriginal(e.target.checked)
                          }
                        />

                        <div
                          className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                            mantenerMargenOriginal
                              ? "bg-brand-500 border-brand-500"
                              : "border-gray-300 dark:border-slate-600 bg-white dark:bg-dark-elevated group-hover:border-brand-500"
                          }`}
                        >
                          {mantenerMargenOriginal && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-none mb-1.5">
                          Mantener la misma ganancia (%)
                        </p>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          El sistema ajusta el precio automáticamente según el costo
                          para conservar el mismo porcentaje de ganancia.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalAccion>
  );
}