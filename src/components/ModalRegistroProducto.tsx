import { X, Image as ImageIcon, Barcode, Check, ChevronDown, Plus, Minus } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { calcularPrecioVenta } from "@/lib/precioUtils"

export interface ProductoDatos {
  codigo: string;
  descripcion: string;
  categoria: string;
  proveedor?: string;
  precioCompra: string;
  precioVenta: string;
  existencia: string;
  stockMinimo: string;
}

interface CustomSelectProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

function CustomSelect({ id, value, onChange, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border ${isOpen ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-200 dark:border-dark-border'} rounded-lg pl-3 pr-2 py-2 text-sm outline-none transition-all shadow-sm bg-white dark:bg-dark-elevated cursor-pointer`}
      >
        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate pr-2">
          {value}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-lg shadow-xl py-1 overflow-auto max-h-60 top-full left-0">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                value === opt 
                  ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {value === opt && <Check className="w-4 h-4" />}
              </div>
              <span className="truncate">{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ModalRegistroProductoProps {
  isOpen: boolean;
  onClose: () => void;
  productoAEditar?: ProductoDatos | null;
  margenGananciaGlobal: number;
}

export default function ModalRegistroProducto({ isOpen, onClose, productoAEditar, margenGananciaGlobal }: ModalRegistroProductoProps) {
  const [codigo, setCodigo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("Sin categoría")
  const [proveedor, setProveedor] = useState("Sin proveedor")
  const [precioCompra, setPrecioCompra] = useState("")
  const [precioVenta, setPrecioVenta] = useState("")
  const [margenLocal, setMargenLocal] = useState(margenGananciaGlobal)
  const [existencia, setExistencia] = useState("")
  const [stockMinimo, setStockMinimo] = useState("5")

  useEffect(() => {
    if (isOpen && !productoAEditar) {
      setMargenLocal(margenGananciaGlobal);
    }
  }, [isOpen, margenGananciaGlobal, productoAEditar]);

  useEffect(() => {
    if (precioCompra && !isNaN(Number(precioCompra))) {
      const nuevoPrecio = calcularPrecioVenta(precioCompra, margenLocal, false, 0);
      setPrecioVenta(nuevoPrecio.toString());
    }
  }, [precioCompra, margenLocal]);

  useEffect(() => {
    if (productoAEditar) {
      setCodigo(productoAEditar.codigo)
      setDescripcion(productoAEditar.descripcion)
      setCategoria(productoAEditar.categoria)
      setProveedor(productoAEditar.proveedor || "Sin proveedor")
      setPrecioCompra(productoAEditar.precioCompra)
      setPrecioVenta(productoAEditar.precioVenta)
      setExistencia(productoAEditar.existencia)
      setStockMinimo(productoAEditar.stockMinimo)
    } else {
      setCodigo("")
      setDescripcion("")
      setCategoria("Sin categoría")
      setProveedor("Sin proveedor")
      setPrecioCompra("")
      setPrecioVenta("")
      setExistencia("")
      setStockMinimo("5")
    }
  }, [productoAEditar, isOpen])

  const generarCodigoBarras = () => {
    const random = Math.floor(Math.random() * 9000000000000 + 1000000000000).toString()
    setCodigo(random)
  }

  if (!isOpen) return null;

  const tituloModal = productoAEditar ? "Editar producto" : "Registrar producto"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 font-sans">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[95vh] animate-in fade-in zoom-in duration-200">

        {/* Encabezado compacto */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-brand-50 to-white dark:from-dark-elevated dark:to-dark-card">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{tituloModal}</h2>
          <button
            onClick={onClose}
            className="text-white bg-rose-400 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700 p-1.5 rounded-full transition-colors shadow-sm"
            title="Cerrar"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo optimizado */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          
          {/* Grid principal de 2 columnas */}
          <div className="grid grid-cols-12 gap-5">
            
            {/* Columna izquierda - Imagen (más estrecha) */}
            <div className="col-span-4">
              <div
                role="button"
                tabIndex={0}
                aria-label="Subir imagen del producto"
                title="Subir imagen del producto"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                  }
                }}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
              >
                <ImageIcon className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-center px-2">Subir imagen</span>
              </div>
            </div>

            {/* Columna derecha - Campos principales */}
            <div className="col-span-8 space-y-3">
              {/* Código de barras */}
              <div>
                <label htmlFor="codigo" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Código de barras <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="codigo"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Escanea o escribe"
                    className="flex-1 border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-elevated"
                  />
                  <button
                    type="button"
                    onClick={generarCodigoBarras}
                    title="Generar código de barras aleatorio"
                    aria-label="Generar código de barras"
                    className="px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-dark-elevated hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-brand-300 flex items-center gap-1 transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Barcode className="w-4 h-4" />
                    Generar Código
                  </button>
                </div>
              </div>

              {/* Categoría y Proveedor en una fila */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="categoria" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Categoría</label>
                  <CustomSelect
                    id="categoria"
                    value={categoria}
                    onChange={setCategoria}
                    options={[
                      "Sin categoría",
                      "Higiene Personal",
                      "Bebidas",
                      "Limpieza",
                      "Lácteos",
                      "Alimentos",
                      "Farmacia"
                    ]}
                  />
                </div>
                <div>
                  <label htmlFor="proveedor" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Proveedor</label>
                  <CustomSelect
                    id="proveedor"
                    value={proveedor}
                    onChange={setProveedor}
                    options={[
                      "Sin proveedor",
                      "Avon",
                      "Danone",
                      "Unilever",
                      "Mastellone",
                      "Coca-Cola",
                      "Arcor"
                    ]}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nombre del producto</label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Escribe el nombre del producto"
                  className="w-full border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm resize-none font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-elevated"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Sección de Precios - Compacta */}
          <div className="mt-5 bg-slate-50 dark:bg-dark-elevated rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <h3 className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500"></div> 
              Costos y Ganancia
            </h3>
            
            {/* Fila compacta de precios */}
            <div className="grid grid-cols-12 gap-3 items-end">
              {/* Precio de compra */}
              <div className="col-span-3">
                <label htmlFor="precioCompra" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Precio de costo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold" aria-hidden="true">$</span>
                  <input
                    id="precioCompra"
                    type="number"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 dark:border-dark-border rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-dark-card"
                  />
                </div>
              </div>

              {/* Margen stepper compacto */}
              <div className="col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide text-center">
                  Ganancia
                </label>
                <div className="flex items-center border border-slate-200 dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-elevated shadow-sm h-[36px]">
                  <button
                    type="button"
                    onClick={() => setMargenLocal(Math.max(0, margenLocal - 5))}
                    className="w-8 h-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-r border-inherit"
                    title="Reducir margen"
                    aria-label="Reducir margen"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative flex-1 h-full flex items-center justify-center bg-transparent">
                    <input
                      type="text"
                      value={margenLocal}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setMargenLocal(val === '' ? 0 : Math.min(999, parseInt(val, 10)));
                      }}
                      className="w-full h-full text-center pr-2 text-[14px] font-bold text-slate-900 dark:text-white bg-transparent outline-none transition-colors"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400 pointer-events-none">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMargenLocal(margenLocal + 5)}
                    className="w-8 h-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border-l border-inherit"
                    title="Aumentar margen"
                    aria-label="Aumentar margen"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Precio de venta */}
              <div className="col-span-3">
                <label htmlFor="precioVenta" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Precio final
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 dark:text-brand-400 text-sm font-bold" aria-hidden="true">$</span>
                  <input
                    id="precioVenta"
                    type="number"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    placeholder="0"
                    className="w-full border border-brand-200 dark:border-brand-700 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm font-bold text-brand-800 dark:text-brand-200 bg-brand-50/30 dark:bg-brand-900/20"
                  />
                </div>
              </div>

              {/* Inventario compacto */}
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="existencia" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Stock actual <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="existencia"
                    type="text"
                    value={existencia}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setExistencia(val === '' ? '0' : val);
                    }}
                    className="w-full h-[36px] border border-slate-200 dark:border-dark-border rounded-lg px-2 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-dark-elevated text-center"
                  />
                </div>
                <div>
                  <label htmlFor="stockMinimo" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Stock mínimo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="stockMinimo"
                    type="text"
                    value={stockMinimo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setStockMinimo(val === '' ? '0' : val);
                    }}
                    className="w-full h-[36px] border border-slate-200 dark:border-dark-border rounded-lg px-2 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-dark-elevated text-center"
                    title="Cantidad mínima para alerta de stock bajo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie compacto */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border bg-gray-50/80 dark:bg-dark-elevated/80 flex justify-end gap-3">
          <button
            onClick={onClose}
            title="Cancelar y cerrar"
            aria-label="Cancelar"
            className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-dark-elevated rounded-lg cursor-pointer transition-colors"
          >
            CERRAR
          </button>
          <button
            title="Guardar producto"
            aria-label="Guardar"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            GUARDAR
          </button>
        </div>
      </div>
    </div>
  )
}