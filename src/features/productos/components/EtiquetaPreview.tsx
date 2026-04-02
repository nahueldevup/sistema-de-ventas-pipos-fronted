import Barcode from "react-barcode";
import type { Producto } from "@/types/producto.types";

interface EtiquetaPreviewProps {
  producto: Producto;
  compact?: boolean;
}

/**
 * Renderiza una etiqueta de producto con aspecto de etiqueta física real.
 * Muestra: nombre, precio, info de bulto (si aplica), código de barras EAN,
 * número interno y código EAN.
 *
 * @param compact — Reduce el tamaño para usarse como miniatura en la sección "Seleccionados"
 */
export default function EtiquetaPreview({ producto, compact = false }: EtiquetaPreviewProps) {
  // Limpio el # del código para que react-barcode lo acepte como EAN
  const codigoLimpio = producto.codigo.replace(/^#/, "");
  const precioPorUnidad =
    producto.unidadesPorBulto && producto.unidadesPorBulto > 1
      ? (producto.precioVenta / producto.unidadesPorBulto).toFixed(2)
      : null;

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex items-center gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-700 truncate leading-tight">
            {producto.nombre}
          </p>
          <p className="text-sm font-black text-slate-900 leading-tight">
            ${producto.precioVenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <p className="text-[9px] text-slate-400 font-mono shrink-0">{codigoLimpio}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 p-4 w-full max-w-[320px] shadow-sm select-none">
      {/* Nombre del producto */}
      <p className="text-sm font-bold text-slate-800 leading-snug mb-2 line-clamp-2">
        {producto.nombre}
      </p>

      {/* Fila de precio + info de bulto */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-2xl font-black text-slate-900 tracking-tight">
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

      {/* Código de barras */}
      <div className="flex justify-center mb-2 overflow-hidden">
        <Barcode
          value={codigoLimpio}
          format="EAN13"
          width={1.4}
          height={45}
          fontSize={0}
          margin={0}
          background="transparent"
          lineColor="#1e293b"
        />
      </div>

      {/* Pie: número interno + código EAN */}
      <div className="flex justify-between items-center pt-1 border-t border-gray-200">
        <span className="text-[10px] font-semibold text-slate-500 font-mono">
          INT-{producto.id.toString().padStart(3, "0")}
        </span>
        <span className="text-[10px] font-medium text-slate-400 font-mono">
          {codigoLimpio}
        </span>
      </div>
    </div>
  );
}
