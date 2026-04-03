import { useState, useMemo, useCallback } from "react";
import { X, Printer, Search, Package } from "lucide-react";
import Fuse from "fuse.js";
import type { Producto } from "@/types/producto.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EtiquetaPreview from "./EtiquetaPreview";

interface ModalImprimirEtiquetasProps {
  isOpen: boolean;
  onClose: () => void;
  todosLosProductos: Producto[];
}

export default function ModalImprimirEtiquetas({
  isOpen,
  onClose,
  todosLosProductos,
}: ModalImprimirEtiquetasProps) {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  // ── Fuse.js para búsqueda fuzzy ─────────────────────────────
  const fuse = useMemo(
    () =>
      new Fuse(todosLosProductos, {
        keys: ["nombre", "codigo"],
        threshold: 0.35,
        includeScore: true,
      }),
    [todosLosProductos]
  );

  const resultados = useMemo(() => {
    if (!busqueda.trim()) return [];
    return fuse.search(busqueda).map((r) => r.item);
  }, [fuse, busqueda]);

  // ── Selección ───────────────────────────────────────────────
  const toggleSeleccion = useCallback((id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const quitarSeleccionado = useCallback((id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const limpiarTodo = useCallback(() => {
    setSeleccionados(new Set());
  }, []);

  const productosSeleccionados = useMemo(
    () => todosLosProductos.filter((p) => seleccionados.has(p.id)),
    [todosLosProductos, seleccionados]
  );

  // ── Impresión ───────────────────────────────────────────────
  const handleImprimir = useCallback(() => {
    if (productosSeleccionados.length === 0) return;

    // Genero el HTML de las etiquetas con estilos inline para la ventana de impresión
    const etiquetasHTML = productosSeleccionados
      .map((producto) => {
        const codigoLimpio = producto.codigo.replace(/^#/, "");
        const precioPorUnidad =
          producto.unidadesPorBulto && producto.unidadesPorBulto > 1
            ? (producto.precioVenta / producto.unidadesPorBulto).toFixed(2)
            : null;

        // En la ventana de impresión uso JsBarcode (CDN) para generar los barcodes,
        // así evito depender de React en el contexto de la ventana nueva.
        return `
          <div style="
            background: white;
            border: 2px solid #d1d5db;
            border-radius: 12px;
            padding: 16px;
            width: 280px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            page-break-inside: avoid;
            break-inside: avoid;
          ">
            <p style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0; line-height: 1.3;">
              ${producto.nombre}
            </p>
            <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
                $${producto.precioVenta.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
              ${
                precioPorUnidad
                  ? `<div style="text-align: right; line-height: 1.3;">
                      <p style="font-size: 11px; font-weight: 700; color: #475569; margin: 0;">x${producto.unidadesPorBulto} unidad</p>
                      <p style="font-size: 10px; color: #64748b; margin: 0;">$${precioPorUnidad} x und</p>
                    </div>`
                  : ""
              }
            </div>
            <div style="text-align: center; margin-bottom: 8px;" class="barcode-container" data-code="${codigoLimpio}"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px solid #e2e8f0;">
              <span style="font-size: 9px; font-weight: 600; color: #64748b; font-family: monospace;">
                INT-${producto.id.toString().padStart(3, "0")}
              </span>
              <span style="font-size: 9px; font-weight: 500; color: #94a3b8; font-family: monospace;">
                ${codigoLimpio}
              </span>
            </div>
          </div>
        `;
      })
      .join("");

    const ventana = window.open("", "_blank");
    if (!ventana) return;

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiquetas — Pipos</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', system-ui, sans-serif;
              padding: 20px;
              background: #f8fafc;
            }
            .grid {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              justify-content: center;
            }
            @media print {
              body { padding: 0; background: white; }
              .grid { gap: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${etiquetasHTML}
          </div>
          <script>
            // Genero los códigos de barras con JsBarcode después de que el DOM esté listo
            document.querySelectorAll('.barcode-container').forEach(container => {
              const code = container.dataset.code;
              const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              container.appendChild(svg);
              try {
                JsBarcode(svg, code, {
                  format: "EAN13",
                  width: 1.4,
                  height: 45,
                  displayValue: false,
                  margin: 0,
                  background: "transparent",
                  lineColor: "#1e293b"
                });
              } catch(e) {
                // Si el código no es EAN válido, uso CODE128 como fallback
                JsBarcode(svg, code, {
                  format: "CODE128",
                  width: 1.2,
                  height: 45,
                  displayValue: false,
                  margin: 0,
                  background: "transparent",
                  lineColor: "#1e293b"
                });
              }
            });
            // Espero un frame para que se rendericen los barcodes y después imprimo
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.print();
              });
            });
          <\/script>
        </body>
      </html>
    `);
    ventana.document.close();
  }, [productosSeleccionados]);

  // ── Reset al cerrar ─────────────────────────────────────────
  const handleClose = useCallback(() => {
    setBusqueda("");
    setSeleccionados(new Set());
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-5xl p-0 gap-0 overflow-hidden bg-white dark:bg-dark-card border-none shadow-xl rounded-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Imprimir etiquetas</DialogTitle>

        <div className="flex flex-col w-full max-h-[85vh]">
          {/* ── Encabezado ─────────────────────────────── */}
          <div className="flex justify-between items-start p-5 pb-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-elevated/30">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Imprimir etiquetas
              </h2>
              {seleccionados.size > 0 && (
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                  {seleccionados.size} producto{seleccionados.size !== 1 ? 's' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-white bg-rose-400 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700 p-1.5 rounded-full transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Contenido principal con sidebar ──────────────────── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            
            {/* ── Panel izquierdo: Buscador + Resultados ─────────── */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100 dark:border-dark-border">
              
              {/* Buscador */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center border-2 border-gray-200 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-elevated/50 focus-within:border-brand-500 focus-within:bg-white dark:focus-within:bg-dark-card transition-all">
                  <div className="pl-3 text-slate-400 dark:text-slate-500 flex items-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscá por nombre o código de barras..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="flex-1 px-3 py-3 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent"
                    autoFocus
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda("")}
                      className="pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Resultados de búsqueda */}
              <div className="flex-1 overflow-y-auto px-5 pb-4">
                {!busqueda.trim() ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Buscá y agregá los productos que querés etiquetar
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Los productos seleccionados aparecerán en el panel derecho
                    </p>
                  </div>
                ) : resultados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      No se encontraron productos
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Intentá con otro término de búsqueda
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {resultados.map((producto) => {
                      const isSelected = seleccionados.has(producto.id);
                      return (
                        <button
                          key={producto.id}
                          onClick={() => toggleSeleccion(producto.id)}
                          className={`relative text-left cursor-pointer rounded-xl border-2 transition-all group ${
                            isSelected
                              ? "border-brand-400/50 ring-4 ring-brand-50/50 dark:ring-brand-900/20 dark:border-brand-500/40 bg-brand-50/30 dark:bg-brand-900/10"
                              : "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-500"
                          }`}
                        >
                          {/* Checkbox en esquina superior izquierda como badge */}
                          <div
                            className={`absolute -top-2.5 -left-2.5 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all shadow-sm ${
                              isSelected
                                ? "bg-brand-400 border-brand-400 text-white"
                                : "bg-white dark:bg-dark-card border-gray-300 dark:border-slate-600 group-hover:border-brand-300"
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                                <path
                                  d="M2 6L5 9L10 3"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Etiqueta real */}
                          <EtiquetaPreview producto={producto} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Panel derecho: Seleccionados (Sidebar) ─────────── */}
            <div className="w-80 flex flex-col bg-gray-50/50 dark:bg-dark-elevated/30">
              <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Seleccionados
                  </h3>
                  {seleccionados.size > 1 && (
                    <button
                      onClick={limpiarTodo}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors cursor-pointer"
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {seleccionados.size === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Aún no hay productos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productosSeleccionados.map((producto) => (
                      <div
                        key={producto.id}
                        className="relative group animate-in fade-in-0 slide-in-from-right-4 duration-200"
                      >
                        {/* Click en la etiqueta = toggle (deseleccionar) */}
                        <button
                          onClick={() => quitarSeleccionado(producto.id)}
                          className="text-left w-full cursor-pointer rounded-xl border-2 border-brand-400/50 dark:border-brand-500/40 ring-2 ring-brand-50/50 dark:ring-brand-900/20 bg-brand-50/30 dark:bg-brand-900/10 transition-all hover:border-brand-400/70 dark:hover:border-brand-500"
                        >
                          <EtiquetaPreview producto={producto} />
                        </button>
                        {/* Badge X para quitar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            quitarSeleccionado(producto.id);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer z-10 hover:scale-110 opacity-0 group-hover:opacity-100"
                          aria-label="Quitar producto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────── */}
          <div className="p-5 pt-3 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-elevated/50 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-5 py-2.5 h-auto text-sm font-bold text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-dark-elevated cursor-pointer"
            >
              CANCELAR
            </Button>
            <Button
              onClick={handleImprimir}
              disabled={seleccionados.size === 0}
              className={`px-6 py-2.5 h-auto text-sm font-bold flex items-center gap-2 ${
                seleccionados.size > 0
                  ? "bg-brand-600 hover:bg-brand-700 text-white cursor-pointer active:scale-95"
                  : "bg-gray-200 dark:bg-dark-elevated text-gray-400 dark:text-slate-500 cursor-not-allowed"
              }`}
            >
              <Printer className="w-4 h-4" />
              IMPRIMIR{seleccionados.size > 0 ? ` (${seleccionados.size})` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}