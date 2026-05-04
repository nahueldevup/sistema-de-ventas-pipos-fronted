import { Image as ImageIcon, Barcode, Check, ChevronDown, Plus, Minus, X as XIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { calcularPrecioVenta } from "@/lib/precioUtils"
import { ProductSchema, type Product } from "@/schemas/product.schema"
import type { z } from "zod"
import { useCreateProducto, useUpdateProducto } from "@/features/productos/hooks/useProductos"
import { ModalFormulario } from "@/components/ui/modal-wrappers"
import { MOCK_STORE_ID } from "@/config/mock.config"

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
        className={`w-full flex items-center justify-between border ${isOpen ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-[#E5E7EB] dark:border-dark-border'} rounded-lg pl-3 pr-2 py-2 text-sm outline-none transition-all bg-white dark:bg-dark-elevated cursor-pointer`}
      >
        <span className="font-semibold text-[#1F2937] dark:text-slate-300 truncate pr-2">
          {value || "Seleccionar..."}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-lg shadow-md py-1 overflow-auto max-h-60 top-full left-0">
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
                  ? 'bg-[#F3F4F6] dark:bg-slate-800/50 text-[#1F2937] dark:text-slate-100' 
                  : 'text-[#6B7280] dark:text-slate-400 hover:bg-[#F3F4F6] dark:hover:bg-slate-800/50'
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
  productoAEditar?: Product | null;
  margenGananciaGlobal: number;
}

/** Tipo input del formulario (antes del refine de Zod) */
type ProductFormInput = z.input<typeof ProductSchema>;

export default function ModalRegistroProducto({ isOpen, onClose, productoAEditar, margenGananciaGlobal }: ModalRegistroProductoProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors }, reset } = useForm<ProductFormInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      storeId: MOCK_STORE_ID,
      name: "",
      barcode: "",
      categoryId: "Sin categoría",
      supplierId: "Sin proveedor",
      costPrice: 0,
      salePrice: 0,
      profitMargin: margenGananciaGlobal,
      stock: 0,
      minStock: 5,
      allowDecimalQuantity: false,
      unit: "UNIT",
      image: null,
    }
  });

  // ── Estado de imagen (preview + base64) ──────────────────────
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede superar los 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagenPreview(base64);
      setValue('image', base64, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagenPreview(null);
    setValue('image', null, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const createProducto = useCreateProducto();
  const updateProducto = useUpdateProducto();
  
  const isPending = createProducto.isPending || updateProducto.isPending;

  // Lógica de Ganancia
  const costPrice = watch("costPrice");
  const profitMargin = watch("profitMargin");
  const salePrice = watch("salePrice");
  
  const [lastEdited, setLastEdited] = useState<"costPrice" | "profitMargin" | "salePrice" | null>(null);

  useEffect(() => {
    if (lastEdited === "costPrice" || lastEdited === "profitMargin") {
      const costo = Number(costPrice) || 0;
      const margen = Number(profitMargin) || 0;
      const venta = calcularPrecioVenta(costo, margen, false, 0);
      if (Number(salePrice) !== venta) {
        setValue("salePrice", venta, { shouldValidate: true });
      }
    } else if (lastEdited === "salePrice") {
      const costo = Number(costPrice) || 0;
      const venta = Number(salePrice) || 0;
      if (costo > 0) {
        const margen = ((venta - costo) / costo) * 100;
        if (Number(profitMargin) !== Math.round(margen)) {
          setValue("profitMargin", Math.round(margen), { shouldValidate: true });
        }
      }
    }
  }, [costPrice, profitMargin, salePrice, lastEdited, setValue]);

  useEffect(() => {
    if (isOpen) {
      if (productoAEditar) {
        reset({
          storeId: productoAEditar.storeId || MOCK_STORE_ID,
          name: productoAEditar.name || "",
          barcode: productoAEditar.barcode || "",
          categoryId: productoAEditar.categoryId || "Sin categoría",
          supplierId: productoAEditar.supplierId || "Sin proveedor",
          costPrice: productoAEditar.costPrice || 0,
          salePrice: productoAEditar.salePrice || 0,
          profitMargin: productoAEditar.profitMargin ?? margenGananciaGlobal,
          stock: productoAEditar.stock || 0,
          minStock: productoAEditar.minStock || 5,
          allowDecimalQuantity: productoAEditar.allowDecimalQuantity ?? false,
          unit: productoAEditar.unit || "UNIT",
          image: productoAEditar.image || null,
        });
        setImagenPreview(productoAEditar.image || null);
      } else {
        reset({
          storeId: MOCK_STORE_ID,
          name: "",
          barcode: "",
          categoryId: "Sin categoría",
          supplierId: "Sin proveedor",
          costPrice: 0,
          salePrice: 0,
          profitMargin: margenGananciaGlobal,
          stock: 0,
          minStock: 5,
          allowDecimalQuantity: false,
          unit: "UNIT",
          image: null,
        });
        setImagenPreview(null);
      }
      setLastEdited(null);
    }
  }, [productoAEditar, isOpen, reset, margenGananciaGlobal]);

  const generarCodigoBarras = () => {
    const random = Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
    setValue("barcode", random, { shouldValidate: true });
  }

  const onSubmit = (data: ProductFormInput) => {
    // Después del zodResolver, los datos ya están validados — casteamos al tipo output
    const payload = data as Product;
    
    if (productoAEditar && productoAEditar.id) {
      updateProducto.mutate({ id: productoAEditar.id, data: payload }, {
        onSuccess: () => {
          reset();
          onClose();
        }
      });
    } else {
      createProducto.mutate(payload, {
        onSuccess: () => {
          reset();
          onClose();
        }
      });
    }
  };

  if (!isOpen) return null;

  const tituloModal = productoAEditar ? "Editar Producto" : "Registrar Producto"

  return (
    <ModalFormulario
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={tituloModal}
      onCancelar={onClose}
      onGuardar={handleSubmit(onSubmit)}
      guardarDisabled={isPending}
    >
        {/* Cuerpo optimizado */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          
          {/* Grid principal de 2 columnas */}
          <div className="grid grid-cols-12 gap-5">
            
            {/* Columna izquierda - Imagen (más estrecha) */}
            <div className="col-span-4">
              {/* Input file oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={handleImageUpload}
              />

              {imagenPreview ? (
                <div className="relative w-full aspect-square rounded-xl border border-[#E5E7EB] dark:border-dark-border bg-white dark:bg-dark-elevated overflow-hidden group">
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
                  {/* Botón cambiar */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="w-8 h-8 rounded-lg bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Subir imagen del producto"
                  title="Subir imagen del producto"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-[#E5E7EB] dark:border-dark-border bg-[#F6F7F8] dark:bg-dark-elevated flex flex-col items-center justify-center text-[#6B7280] dark:text-slate-500 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                >
                  <ImageIcon className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-center px-2">Subir imagen</span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG (máx 2MB)</span>
                </div>
              )}
            </div>

            {/* Columna derecha - Campos principales */}
            <div className="col-span-8 space-y-3">
              {/* Código de barras */}
              <div>
                <label htmlFor="codigo" className="block text-xs font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Código de barras <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="codigo"
                    type="text"
                    {...register("barcode")}
                    placeholder="Escanea o escribe"
                    className="flex-1 border border-[#E5E7EB] dark:border-dark-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-[#1F2937] dark:text-slate-200 bg-white dark:bg-dark-elevated"
                  />
                  <button
                    type="button"
                    onClick={generarCodigoBarras}
                    title="Generar código de barras aleatorio"
                    aria-label="Generar código de barras"
                    className="px-3 py-2 border border-[#E5E7EB] dark:border-dark-border rounded-lg text-xs font-semibold text-[#1F2937] dark:text-slate-300 bg-white dark:bg-dark-elevated hover:bg-[#F3F4F6] dark:hover:bg-slate-600 hover:border-gray-300 flex items-center gap-1 transition-colors whitespace-nowrap"
                  >
                    <Barcode className="w-4 h-4" />
                    Generar Código
                  </button>
                </div>
                {errors.barcode && <p className="text-xs text-red-500 mt-1">{errors.barcode.message}</p>}
              </div>

              {/* Categoría y Proveedor en una fila */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="categoria" className="block text-xs font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Categoría</label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        id="categoria"
                        value={field.value || "Sin categoría"}
                        onChange={field.onChange}
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
                    )}
                  />
                  {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
                </div>
                <div>
                  <label htmlFor="proveedor" className="block text-xs font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Proveedor</label>
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        id="proveedor"
                        value={field.value || "Sin proveedor"}
                        onChange={field.onChange}
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
                    )}
                  />
                  {errors.supplierId && <p className="text-xs text-red-500 mt-1">{errors.supplierId.message}</p>}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-xs font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nombre del producto</label>
                <textarea
                  id="descripcion"
                  {...register("name")}
                  rows={2}
                  placeholder="Escribe el nombre del producto"
                  className="w-full border border-[#E5E7EB] dark:border-dark-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none font-medium text-[#1F2937] dark:text-slate-200 bg-white dark:bg-dark-elevated"
                ></textarea>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
            </div>
          </div>

          {/* Sección de Precios - Compacta */}
          <div className="mt-5 bg-[#F6F7F8] dark:bg-dark-elevated rounded-xl border border-[#E5E7EB] dark:border-dark-border p-4">
            <h3 className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500"></div> 
              Costos y Ganancia
            </h3>
            
            {/* Fila compacta de precios */}
            <div className="grid grid-cols-12 gap-3 items-end">
              {/* Precio de compra */}
              <div className="col-span-3">
                <label htmlFor="precioCompra" className="block text-[10px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Precio costo
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm font-semibold" aria-hidden="true">$</span>
                  <input
                    id="precioCompra"
                    type="number"
                    step="any"
                    {...register("costPrice")}
                    onFocus={() => setLastEdited("costPrice")}
                    placeholder="0"
                    className="w-full border border-[#E5E7EB] dark:border-dark-border rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-semibold text-[#1F2937] dark:text-slate-100 bg-white dark:bg-dark-card"
                  />
                </div>
                {errors.costPrice && <p className="text-xs text-red-500 mt-1">{errors.costPrice.message}</p>}
              </div>

              {/* Margen stepper compacto */}
              <div className="col-span-3">
                <label className="block text-[10px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide text-center">
                  Ganancia
                </label>
                <div className="flex items-center border border-[#E5E7EB] dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-elevated h-[36px]">
                  <button
                    type="button"
                    onClick={() => {
                      setLastEdited("profitMargin");
                      setValue("profitMargin", Math.max(0, (Number(profitMargin) || 0) - 5), { shouldValidate: true });
                    }}
                    className="w-8 h-full flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-slate-700 hover:text-[#1F2937] dark:hover:text-slate-200 transition-colors cursor-pointer border-r border-inherit"
                    title="Reducir margen"
                    aria-label="Reducir margen"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative flex-1 h-full flex items-center justify-center bg-transparent">
                    <input
                      type="text"
                      {...register("profitMargin", {
                        onChange: (e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          e.target.value = val;
                          setLastEdited("profitMargin");
                        }
                      })}
                      onFocus={() => setLastEdited("profitMargin")}
                      className="w-full h-full text-center pr-2 text-[14px] font-semibold text-[#1F2937] dark:text-white bg-transparent outline-none transition-colors"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#6B7280] pointer-events-none">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLastEdited("profitMargin");
                      setValue("profitMargin", (Number(profitMargin) || 0) + 5, { shouldValidate: true });
                    }}
                    className="w-8 h-full flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] dark:hover:bg-slate-700 hover:text-[#1F2937] dark:hover:text-slate-200 transition-colors cursor-pointer border-l border-inherit"
                    title="Aumentar margen"
                    aria-label="Aumentar margen"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {errors.profitMargin && <p className="text-xs text-red-500 mt-1 text-center">{errors.profitMargin.message}</p>}
              </div>

              {/* Precio de venta */}
              <div className="col-span-3">
                <label htmlFor="precioVenta" className="block text-[10px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Precio venta
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-slate-400 text-sm font-semibold" aria-hidden="true">$</span>
                  <input
                    id="precioVenta"
                    type="number"
                    step="any"
                    {...register("salePrice")}
                    onFocus={() => setLastEdited("salePrice")}
                    placeholder="0"
                    className="w-full border border-[#E5E7EB] dark:border-dark-border rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-semibold text-[#1F2937] dark:text-slate-100 bg-white dark:bg-dark-card"
                  />
                </div>
                {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice.message}</p>}
              </div>

              {/* Inventario compacto */}
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="existencia" className="block text-[10px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Stock actual <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="existencia"
                    type="text"
                    {...register("stock", {
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^0-9.-]/g, '');
                        e.target.value = val;
                      }
                    })}
                    className="w-full h-[36px] border border-[#E5E7EB] dark:border-dark-border rounded-lg px-2 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-semibold text-[#1F2937] dark:text-white bg-white dark:bg-dark-elevated text-center"
                  />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <label htmlFor="stockMinimo" className="block text-[10px] font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    Stock mínimo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="stockMinimo"
                    type="text"
                    {...register("minStock", {
                      onChange: (e) => {
                        const val = e.target.value.replace(/[^0-9.-]/g, '');
                        e.target.value = val;
                      }
                    })}
                    className="w-full h-[36px] border border-[#E5E7EB] dark:border-dark-border rounded-lg px-2 text-[14px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-semibold text-[#1F2937] dark:text-white bg-white dark:bg-dark-elevated text-center"
                    title="Cantidad mínima para alerta de stock bajo"
                  />
                  {errors.minStock && <p className="text-xs text-red-500 mt-1">{errors.minStock.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
    </ModalFormulario>
  )
}