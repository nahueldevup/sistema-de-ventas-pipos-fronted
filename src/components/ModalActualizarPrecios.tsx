import { useState, useMemo, useEffect, useRef } from "react";
import { X, AlertTriangle, Check, ChevronDown, Tag } from "lucide-react";

interface Producto {
  id: string;
  nombre: string;
  precioVenta: number;
  precioCompra: number;
  categoria: string;
}

interface ModalActualizarPreciosProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
  categoriasDisponibles: string[];
  productosSeleccionadosIds: string[];
  onAplicar: (actualizados: { id: string; nuevoPrecioVenta: number }[]) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const formatearPesos = (monto: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(monto);
};

const calcularNuevoPrecio = (
  p: Producto,
  tipo: string,
  valor: number,
  redondear: boolean,
  noBajar: boolean
) => {
  let nuevo = p.precioVenta;

  if (tipo === "porcentaje") {
    nuevo = p.precioVenta * (1 + valor / 100);
  } else if (tipo === "montoFijo") {
    nuevo = p.precioVenta + valor;
  } else if (tipo === "definirMargen") {
    // Margen sobre el costo
    nuevo = p.precioCompra * (1 + valor / 100);
  }

  if (redondear) {
    nuevo = Math.round(nuevo / 10) * 10;
  }

  if (noBajar && nuevo < p.precioVenta) {
    return p.precioVenta;
  }

  return Math.max(0, nuevo);
};

// ─── Componente Interno: CategoryMultiSelect ──────────────────────────

function CategoryMultiSelect({
  opciones,
  seleccionadas,
  onChange,
}: {
  opciones: string[];
  seleccionadas: string[];
  onChange: (sel: string[]) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
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

  return (
    <div className="relative mt-2" ref={ref}>
      <button
        onClick={() => setAbierto(!abierto)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
          seleccionadas.length > 0
            ? "bg-brand-50 border-brand-300 text-brand-700"
            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          {seleccionadas.length === 0 ? (
            <span>Seleccionar categorías...</span>
          ) : (
            <span className="font-bold">
              {seleccionadas.length} {seleccionadas.length === 1 ? "categoría" : "categorías"}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-xl z-[60] py-1 max-h-60 overflow-y-auto">
          {opciones.map((opcion) => {
            const sel = seleccionadas.includes(opcion);
            return (
              <button
                key={opcion}
                onClick={() => toggle(opcion)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                  sel ? "bg-brand-50 text-brand-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  sel ? "bg-brand-600 border-brand-600 text-white" : "border-slate-300"
                }`}>
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

// ─── Componente Principal ────────────────────────────────────────────────

export default function ModalActualizarPrecios({
  isOpen,
  onClose,
  productos,
  categoriasDisponibles,
  productosSeleccionadosIds,
  onAplicar,
}: ModalActualizarPreciosProps) {
  const [alcance, setAlcance] = useState<"categorias" | "seleccion">(
    productosSeleccionadosIds.length > 0 ? "seleccion" : "categorias"
  );
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [tipo, setTipo] = useState<"porcentaje" | "montoFijo" | "definirMargen">("porcentaje");
  const [valor, setValor] = useState("");
  const [redondear, setRedondear] = useState(true);
  const [noBajar, setNoBajar] = useState(false);
  const [confirmacion, setConfirmacion] = useState(false);

  // Reiniciar estado al abrir
  useEffect(() => {
    if (isOpen) {
      setAlcance(productosSeleccionadosIds.length > 0 ? "seleccion" : "categorias");
      setConfirmacion(false);
      setValor("");
    }
  }, [isOpen, productosSeleccionadosIds]);

  const tipoOpciones = [
    { value: "porcentaje", label: "Subir un porcentaje (%)" },
    { value: "montoFijo", label: "Subir un monto fijo ($)" },
    { value: "definirMargen", label: "Fijar nuevo % de ganancia" },
  ];

  const productosAfectados = useMemo(() => {
    if (alcance === "seleccion") {
      return productos.filter((p) => productosSeleccionadosIds.includes(p.id));
    }
    return productos.filter((p) => categoriasSeleccionadas.includes(p.categoria));
  }, [alcance, productos, productosSeleccionadosIds, categoriasSeleccionadas]);

  const valorNum = parseFloat(valor) || 0;

  const previews = useMemo(() => {
    return productosAfectados.slice(0, 5).map((p) => ({
      ...p,
      nuevoPrecio: calcularNuevoPrecio(p, tipo, valorNum, redondear, noBajar),
    }));
  }, [productosAfectados, tipo, valorNum, redondear, noBajar]);

  const puedeAplicar =
    productosAfectados.length > 0 &&
    (tipo === "definirMargen" ? valorNum >= 0 : valorNum !== 0);

  const handleAplicar = () => {
    if (!confirmacion) {
      setConfirmacion(true);
      return;
    }
    const actualizados = productosAfectados.map((p) => ({
      id: p.id,
      nuevoPrecioVenta: calcularNuevoPrecio(p, tipo, valorNum, redondear, noBajar),
    }));
    onAplicar(actualizados);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh] border border-gray-100 dark:border-dark-border relative animate-in fade-in zoom-in duration-200">
        
        {/* Modal de Confirmación Interno */}
        {confirmacion && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl scale-100 animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg leading-tight">¿Confirmar cambios?</h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Vas a modificar el precio de <span className="font-bold text-slate-900 dark:text-white">{productosAfectados.length} productos</span>. 
                Esta acción no se puede deshacer de forma automática.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmacion(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Regresar
                </button>
                <button
                  onClick={handleAplicar}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 shadow-md shadow-brand-200 transition-all hover:-translate-y-0.5"
                >
                  Sí, actualizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ajustar precios masivamente</h2>
          <button 
            onClick={onClose}
            className="text-white bg-rose-400 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700 p-1.5 rounded-full transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 overflow-y-auto">

          {/* ALCANCE */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
              1. Alcance de la actualización
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAlcance("categorias")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                  alcance === "categorias" 
                    ? "bg-brand-600 border-brand-600 text-white" 
                    : "border-slate-100 text-slate-500 hover:border-slate-200"
                }`}
              >
                <Tag size={20} className={alcance === "categorias" ? "text-white" : "text-slate-400"} />
                <span className="text-sm font-bold">Por categoría</span>
              </button>

              <button
                onClick={() => setAlcance("seleccion")}
                disabled={!productosSeleccionadosIds.length}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${
                  alcance === "seleccion" 
                    ? "bg-brand-600 border-brand-600 text-white" 
                    : "border-slate-100 text-slate-500 hover:border-slate-200 disabled:opacity-40 disabled:grayscale"
                }`}
              >
                <Check size={20} className={alcance === "seleccion" ? "text-white" : "text-slate-400"} />
                <span className="text-sm font-bold">Seleccionados ({productosSeleccionadosIds.length})</span>
              </button>
            </div>

            {alcance === "categorias" && (
              <CategoryMultiSelect
                opciones={categoriasDisponibles}
                seleccionadas={categoriasSeleccionadas}
                onChange={setCategoriasSeleccionadas}
              />
            )}
          </div>

          {/* CONFIGURACIÓN */}
          <div className="space-y-6">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
              2. Configurar ajuste
            </label>

            {/* TIPO */}
            <div className="space-y-3">
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                {tipoOpciones.map((op) => (
                  <button
                    key={op.value}
                    onClick={() => setTipo(op.value as any)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      tipo === op.value 
                        ? "bg-brand-600 text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VALOR E INPUTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Valor del cambio</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    {tipo === "montoFijo" ? "$" : ""}
                  </span>
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ej: 15"
                    className={`w-full bg-white dark:bg-dark-card border-2 rounded-xl py-2.5 outline-none font-black text-lg transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      tipo === "montoFijo" ? "pl-7" : "px-4"
                    } ${valorNum !== 0 ? "border-brand-500 ring-4 ring-brand-50" : "border-slate-100 focus:border-slate-300"}`}
                  />
                  {tipo !== "montoFijo" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 pb-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={redondear} 
                      onChange={() => setRedondear(!redondear)} 
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-checked:bg-brand-600 rounded-full transition-colors"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Redondear a decenas</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={noBajar} 
                      onChange={() => setNoBajar(!noBajar)} 
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-checked:bg-orange-600 rounded-full transition-colors"></div>
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Protección de baja</span>
                </label>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="pt-4 mt-2">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                3. Vista previa ({productosAfectados.length} productos)
              </label>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl overflow-hidden border border-slate-100 dark:border-dark-border">
              {productosAfectados.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Tag className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-medium">Ningún producto seleccionado</p>
                </div>
              ) : (
                <div className="p-1">
                  {previews.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-dark-card transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[240px]">{p.nombre}</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase">{p.categoria}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right shrink-0">
                        <span className="text-xs text-slate-400 line-through font-medium">{formatearPesos(p.precioVenta)}</span>
                        <span className="text-sm font-black text-brand-600 dark:text-brand-400">{formatearPesos(p.nuevoPrecio)}</span>
                      </div>
                    </div>
                  ))}
                  {productosAfectados.length > 5 && (
                    <div className="p-3 text-center border-t border-slate-100 dark:border-dark-border">
                      <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Y otros {productosAfectados.length - 5} productos más...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleAplicar}
            disabled={!puedeAplicar}
            className={`px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg ${
              puedeAplicar 
                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100 hover:-translate-y-0.5" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed grayscale"
            }`}
          >
            Aplicar ajustes
          </button>
        </div>
      </div>
    </div>
  );
}