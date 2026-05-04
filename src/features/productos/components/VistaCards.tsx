import { useState, useEffect } from "react";
import {
  ImageOff,
  ArrowUpRight,
  Edit2,
  Printer,
  MoreVertical,
  PackageX,
  Trash2,
  History,
} from "lucide-react";
import type { Product } from "@/schemas/product.schema";
import { getCategoriaColor, formatearPesos } from "@/lib/productoUtils";

interface VistaCardsProps {
  productos: Product[];
  onEditar: (producto: Product) => void;
  onBorrar?: (producto: Product) => void;
  onImprimir?: (producto: Product) => void;
}

interface CardProductoProps {
  producto: Product;
  onEditar: (producto: Product) => void;
  onBorrar?: (producto: Product) => void;
  onImprimir?: (producto: Product) => void;
  menuAbierto: boolean;
  onMenuToggle: (abierto: boolean) => void;
  onMouseEnter: () => void;
}

function CardProducto({ producto, onEditar, onBorrar, onImprimir, menuAbierto, onMenuToggle, onMouseEnter }: CardProductoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuAbierto) {
        onMenuToggle(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuAbierto, onMenuToggle]);

  const imagenSrc = !imgError ? producto.image : undefined;

  const estadoStock =
    producto.stock <= 0
      ? "agotado"
      : producto.stock <= (producto.minStock || 5)
      ? "bajo"
      : "normal";

  const badgeStock = {
    agotado: {
      label: "Agotado",
      clase:
        "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
      dot: "bg-red-500 animate-pulse",
    },
    bajo: {
      label: `Stock: ${producto.stock}`,
      clase:
        "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
      dot: "bg-amber-500",
    },
    normal: {
      label: `Stock: ${producto.stock}`,
      clase:
        "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40",
      dot: "bg-emerald-500",
    },
  }[estadoStock];

  const utilidad = producto.salePrice - producto.costPrice;
  const categoriaLabel = producto.categoryId || 'Sin categoría';
  const proveedorLabel = producto.supplierId || 'Sin proveedor';

  return (
    <article
      className="
        group relative flex flex-col
        bg-white dark:bg-dark-card
        border border-[#E5E7EB] dark:border-dark-border
        rounded-2xl overflow-hidden
        shadow-[0_1px_3px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]
        dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]
        hover:-translate-y-0.5
        transition-all duration-200 ease-out
        cursor-pointer
      "
      onClick={() => onEditar(producto)}
      onMouseEnter={onMouseEnter}
    >
      {/* ── Imagen ─────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] bg-white dark:bg-slate-900 overflow-hidden shrink-0">
        {imagenSrc ? (
          <img
            src={imagenSrc}
            alt={producto.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-contain p-2 group-hover:scale-105 transition-all duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Badge estado stock (esquina superior izquierda) */}
        <div
          className={`
            absolute top-2.5 left-2.5
            flex items-center gap-1.5 px-2 py-1
            rounded-full border text-[11px] font-bold
            backdrop-blur-sm
            ${badgeStock.clase}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeStock.dot}`} />
          {badgeStock.label}
        </div>

        {/* Puntito de categoría (esquina superior derecha) */}
        <div
          className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 dark:bg-dark-card/90 border border-white/60 dark:border-dark-border/60 backdrop-blur-sm text-[11px] font-semibold text-slate-600 dark:text-slate-300"
          onClick={(e) => e.stopPropagation()}
        >
          <span className={`w-2 h-2 rounded-full ${getCategoriaColor(categoriaLabel)}`} />
          {categoriaLabel}
        </div>
      </div>

      {/* ── Cuerpo ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Nombre y código */}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[#1F2937] dark:text-slate-50 leading-snug line-clamp-2">
            {producto.name}
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 font-mono mt-0.5 truncate">
            {producto.barcode || '-'}
          </p>
        </div>

        {/* Precios */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold text-[#6B7280] dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Precio final
            </p>
            <p className="text-xl font-bold text-[#1F2937] dark:text-white leading-none">
              {formatearPesos(producto.salePrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-[#6B7280] dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Costo
            </p>
            <p className="text-sm font-semibold text-[#6B7280] dark:text-slate-400 leading-none">
              {formatearPesos(producto.costPrice)}
            </p>
          </div>
        </div>

        {/* Ganancia */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6] dark:border-dark-border">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="text-[13px] font-bold">
              {formatearPesos(utilidad)}
            </span>
            <span className="text-[12px] font-medium text-[#6B7280] dark:text-slate-400">
              ({producto.profitMargin}%)
            </span>
          </div>

          <p className="text-[12px] text-[#6B7280] dark:text-slate-400 font-medium truncate max-w-[100px]">
            {proveedorLabel}
          </p>
        </div>
      </div>

      {/* ── Botones de acción (aparecen en hover) ─────────── */}
      <div
        className={`
          absolute bottom-0 left-0 right-0
          flex items-center justify-between gap-1.5
          px-3 py-3
          bg-gradient-to-t from-white via-white/95 to-transparent
          dark:from-dark-card dark:via-dark-card/95
          transition-transform duration-200 ease-out
          ${menuAbierto ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditar(producto);
            }}
            title="Editar producto"
            className="
              flex items-center gap-1 px-2.5 py-1.5
              rounded-lg border border-sky-200 dark:border-sky-800/60
              bg-sky-50 dark:bg-sky-900/20
              text-sky-700 dark:text-sky-400
              text-xs font-semibold
              hover:bg-sky-100 dark:hover:bg-sky-900/40
              transition-colors cursor-pointer
            "
          >
            <Edit2 className="w-3.5 h-3.5" />
            Editar
          </button>

          <button
            type="button"
            title="Imprimir etiqueta"
            onClick={(e) => {
              e.stopPropagation();
              if (onImprimir) onImprimir(producto);
            }}
            disabled={!onImprimir}
            className={`
              flex items-center gap-1 px-2.5 py-1.5
              rounded-lg border text-xs font-semibold
              transition-colors
              ${onImprimir 
                ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer' 
                : 'border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 cursor-not-allowed'}
            `}
          >
            <Printer className="w-3.5 h-3.5" />
            Etiqueta
          </button>
        </div>

        {/* Menú tres puntos */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle(!menuAbierto);
            }}
            className="
              w-7 h-7 flex items-center justify-center rounded-lg
              border border-[#E5E7EB] dark:border-dark-border
              bg-white dark:bg-dark-elevated
              text-slate-500 dark:text-slate-400
              hover:bg-slate-50 dark:hover:bg-slate-800
              transition-colors cursor-pointer
            "
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuAbierto && (
            <>
              {/* Backdrop para cerrar */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle(false);
                }}
              />
              <div className="absolute bottom-full right-0 mb-2 z-50 w-48 bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border rounded-xl shadow-lg overflow-hidden py-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onMenuToggle(false); onEditar(producto); }}
                >
                  <Edit2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Editar producto
                </button>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    onImprimir
                      ? 'cursor-pointer text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      : 'cursor-not-allowed text-slate-400 dark:text-slate-600'
                  }`}
                  disabled={!onImprimir}
                  onClick={(e) => { e.stopPropagation(); onMenuToggle(false); onImprimir?.(producto); }}
                >
                  <Printer className="h-4 w-4" />
                  Imprimir etiqueta
                </button>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-sm font-medium cursor-not-allowed text-slate-400 dark:text-slate-500"
                  disabled
                  title="Próximamente"
                >
                  <History className="h-4 w-4 shrink-0 mt-0.5 text-violet-400 dark:text-violet-600" />
                  <div className="flex flex-col items-start gap-1">
                    <span className="whitespace-nowrap">Historial de precios</span>
                    <span className="text-[10px] leading-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">Próximamente</span>
                  </div>
                </button>
                <div className="mx-2 my-1 h-px bg-[#E5E7EB] dark:bg-dark-border" />
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    onBorrar
                      ? 'cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'cursor-not-allowed text-slate-400 dark:text-slate-600'
                  }`}
                  disabled={!onBorrar}
                  onClick={(e) => { e.stopPropagation(); onMenuToggle(false); onBorrar?.(producto); }}
                >
                  <Trash2 className="h-4 w-4" />
                  Borrar producto
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function VistaCards({ productos, onEditar, onBorrar, onImprimir }: VistaCardsProps) {
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(null);

  if (productos.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-[#E5E7EB] dark:border-dark-border flex flex-col items-center justify-center py-16 gap-3">
        <PackageX className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">
          No se encontraron productos con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid gap-4
        grid-cols-2
        sm:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
      "
    >
      {productos.map((producto) => (
        <CardProducto
          key={producto.id}
          producto={producto}
          onEditar={onEditar}
          onBorrar={onBorrar}
          onImprimir={onImprimir}
          menuAbierto={openMenuProductId === producto.id}
          onMenuToggle={(abierto) => setOpenMenuProductId(abierto ? producto.id! : null)}
          onMouseEnter={() => {
            if (openMenuProductId && openMenuProductId !== producto.id) {
              setOpenMenuProductId(null);
            }
          }}
        />
      ))}
    </div>
  );
}
