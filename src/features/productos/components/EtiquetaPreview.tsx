import type { Producto } from "@/types/producto.types";

interface EtiquetaPreviewProps {
  producto: Producto;
}

/**
 * Renderiza una etiqueta de producto con aspecto de etiqueta física real.
 * Usa un svg simulado para mejor performance en la grilla.
 */
export default function EtiquetaPreview({ producto }: EtiquetaPreviewProps) {
  // Limpio el # del código para que react-barcode lo acepte como EAN
  const codigoLimpio = producto.codigo.replace(/^#/, "");
  const precioPorUnidad =
    producto.unidadesPorBulto && producto.unidadesPorBulto > 1
      ? (producto.precioVenta / producto.unidadesPorBulto).toFixed(2)
      : null;



  return (
    <div className="bg-white rounded-xl p-3 w-full h-full shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] select-none flex flex-col justify-between">
      {/* Nombre del producto */}
      <p className="text-[11px] sm:text-xs font-bold text-slate-800 leading-snug mb-1.5 line-clamp-2">
        {producto.nombre}
      </p>

      {/* Fila de precio + info de bulto */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xl font-black text-slate-900 tracking-tight">
          ${producto.precioVenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </span>
        {producto.unidadesPorBulto && producto.unidadesPorBulto > 1 && (
          <div className="text-right leading-tight">
            <p className="text-xs font-bold text-slate-600">
              x{producto.unidadesPorBulto} unidad
            </p>
            <p className="text-[11px] text-slate-500">
              ${precioPorUnidad} x und
            </p>
          </div>
        )}
      </div>

      {/* Código de barras simulado (SVG genérico) para fluidez visual */}
      <div className="flex justify-center mb-1 overflow-hidden mx-auto w-full opacity-90 mix-blend-multiply">
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="w-full h-[28px] max-w-[160px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Patrón de barras simulado EAN-like */}
          <path
            d="M0 0h2v40H0zm4 0h1v40H4zm4 0h3v40H8zm5 0h1v40h-1zm3 0h2v40h-2zm4 0h1v40h-1zm3 0h3v40h-3zm5 0h1v40h-1zm3 0h2v40h-2zm4 0h3v40h-3zm6 0h1v40h-1zm4 0h2v40h-2zm5 0h1v40h-1zm3 0h1v40h-1zm3 0h3v40h-3zm5 0h2v40h-2zm4 0h1v40h-1zm3 0h2v40h-2zm6 0h1v40h-1zm4 0h3v40h-3zm5 0h2v40h-2zm4 0h1v40h-1zm3 0h2v40h-2z"
            fill="#1e293b"
          />
        </svg>
      </div>

      {/* Pie: número interno + código EAN */}
      <div className="flex justify-between items-center pt-2 mt-auto border-t border-gray-200">
        <span className="text-[9px] xl:text-[10px] font-semibold text-slate-500 font-mono">
          INT-{producto.id.toString().padStart(3, "0")}
        </span>
        <span className="text-[10px] font-medium text-slate-400 font-mono">
          {codigoLimpio}
        </span>
      </div>
    </div>
  );
}
