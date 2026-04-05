import { useState } from "react";
import {
  X, Search, Plus, Check, Trash2, Edit2,
  Tag, Eye
} from "lucide-react";
import { getCategoriaColor } from "@/theme";
import type { Categoria } from "@/types/categoria.types";
import { ModalGestion } from "@/components/ui/modal-wrappers";


interface ModalGestionCategoriasProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: Categoria[];
  onVerCategoria: (nombre: string) => void;
  onAgregarCategoria: (nombre: string) => void;
  onEditarCategoria: (nombreAnterior: string, nombreNuevo: string) => void;
  onBorrarCategoria: (nombre: string) => void;
}

export default function ModalGestionCategorias({
  isOpen,
  onClose,
  categorias,
  onVerCategoria,
  onAgregarCategoria,
  onEditarCategoria,
  onBorrarCategoria,
}: ModalGestionCategoriasProps) {
  const [busqueda, setBusqueda] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [editandoNombre, setEditandoNombre] = useState<string | null>(null);
  const [nombreTemporal, setNombreTemporal] = useState("");
  const [confirmacion, setConfirmacion] = useState<{
    tipo: "editar" | "borrar";
    nombre: string;
    nuevoNombre?: string;
  } | null>(null);

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAgregar = () => {
    if (nuevaCategoria.trim()) {
      onAgregarCategoria(nuevaCategoria.trim());
      setNuevaCategoria("");
    }
  };

  const iniciarEdicion = (nombre: string) => {
    setEditandoNombre(nombre);
    setNombreTemporal(nombre);
  };

  const solicitarEdicion = (nombreAnterior: string) => {
    if (nombreTemporal.trim() && nombreTemporal !== nombreAnterior) {
      setConfirmacion({ tipo: "editar", nombre: nombreAnterior, nuevoNombre: nombreTemporal.trim() });
    } else {
      setEditandoNombre(null);
    }
  };

  const solicitarBorrado = (nombre: string) => {
    setConfirmacion({ tipo: "borrar", nombre });
  };

  const ejecutarConfirmacion = () => {
    if (!confirmacion) return;
    if (confirmacion.tipo === "editar" && confirmacion.nuevoNombre) {
      onEditarCategoria(confirmacion.nombre, confirmacion.nuevoNombre);
    } else if (confirmacion.tipo === "borrar") {
      onBorrarCategoria(confirmacion.nombre);
    }
    setConfirmacion(null);
    setEditandoNombre(null);
  };

  return (
    <ModalGestion
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Gestionar Categorías"
      onCerrar={onClose}
      footerLeft={
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {categorias.length} categorías en total
        </p>
      }
    >
          {/* Overlay de Confirmación */}
          {confirmacion && (
            <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border shadow-lg rounded-2xl p-6 w-full max-w-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmacion.tipo === "borrar"
                    ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    }`}>
                    {confirmacion.tipo === "borrar" ? (
                      <Trash2 className="w-6 h-6" />
                    ) : (
                      <Edit2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#1F2937] dark:text-slate-100">
                      {confirmacion.tipo === "borrar" ? "¿Borrar categoría?" : "¿Cambiar nombre?"}
                    </h3>
                    <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                <div className="bg-[#F6F7F8] dark:bg-dark-elevated/50 rounded-xl p-4 space-y-2">
                  {confirmacion.tipo === "editar" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-wide">De:</span>
                        <span className="text-sm font-semibold text-[#1F2937] dark:text-slate-300">"{confirmacion.nombre}"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">A:</span>
                        <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">"{confirmacion.nuevoNombre}"</span>
                      </div>
                      <p className="pt-2 text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                        El cambio se aplicará a todos los productos de esta categoría.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categoría:</span>
                        <span className="text-sm font-semibold text-[#1F2937] dark:text-slate-300">"{confirmacion.nombre}"</span>
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">
                        Los productos asociados quedarán como <span className="font-bold text-brand-600 dark:text-brand-400">Sin categoría</span>.
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setConfirmacion(null)}
                    className="flex-1 px-4 py-2.5 border border-[#E5E7EB] dark:border-dark-border rounded-xl text-sm font-semibold text-[#1F2937] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-dark-elevated transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={ejecutarConfirmacion}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 ${confirmacion.tipo === "borrar"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-brand-600 hover:bg-brand-700"
                      }`}
                  >
                    {confirmacion.tipo === "borrar" ? "Sí, borrar" : "Sí, cambiar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Controles */}
          <div className="p-5 flex flex-col md:flex-row gap-4 border-b border-[#E5E7EB] dark:border-dark-border bg-white dark:bg-dark-card z-10">
            {/* Buscador */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#6B7280] dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Buscar categoría
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full border border-[#E5E7EB] dark:border-dark-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-[#1F2937] dark:text-slate-200 bg-white dark:bg-dark-elevated"
                />
              </div>
            </div>

            {/* Nueva Categoría */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Añadir categoría
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nombre nuevo..."
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
                    className="w-full border border-gray-200 dark:border-dark-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-elevated shadow-sm"
                  />
                </div>
                <button
                  onClick={handleAgregar}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Crear</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[150px] max-h-[50vh]">
            <h3 className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 uppercase tracking-widest pl-1 mb-1">
              Listado ({categoriasFiltradas.length})
            </h3>

            {categoriasFiltradas.length > 0 ? (
              <div className="flex flex-col bg-white dark:bg-dark-elevated rounded-xl border border-[#E5E7EB] dark:border-dark-border overflow-hidden divide-y divide-[#E5E7EB] dark:divide-dark-border">
                {categoriasFiltradas.map((cat) => (
                  <div
                    key={cat.nombre}
                    className="group flex items-center justify-between p-4 hover:bg-[#F3F4F6] dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Puntito de color */}
                      <div className={`w-3 h-3 rounded-full ${getCategoriaColor(cat.nombre)} ring-2 ring-white dark:ring-dark-card shrink-0`} />

                      {editandoNombre === cat.nombre ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            autoFocus
                            value={nombreTemporal}
                            onChange={(e) => setNombreTemporal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") solicitarEdicion(cat.nombre);
                              if (e.key === "Escape") setEditandoNombre(null);
                            }}
                            className="flex-1 bg-white dark:bg-dark-card border-2 border-brand-400 dark:border-brand-600 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                          />
                          <button
                            onClick={() => solicitarEdicion(cat.nombre)}
                            className="p-2 text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditandoNombre(null)}
                            className="p-2 text-slate-500 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="font-semibold text-[15px] text-[#1F2937] dark:text-slate-100 truncate pb-0.5">
                              {cat.nombre}
                            </p>
                            <button
                              onClick={() => iniciarEdicion(cat.nombre)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-all"
                              title="Editar nombre"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ml-3 bg-[#F3F4F6] dark:bg-slate-700 text-[#6B7280] dark:text-slate-300">
                            {cat.cantidad} {cat.cantidad === 1 ? "producto" : "productos"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pl-3 border-l border-[#E5E7EB] dark:border-dark-border ml-2 shrink-0">
                      <button
                        onClick={() => onVerCategoria(cat.nombre)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 rounded-lg text-xs font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver</span>
                      </button>

                      {!confirmacion || confirmacion.nombre !== cat.nombre ? (
                        <button
                          onClick={() => solicitarBorrado(cat.nombre)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 text-[#6B7280] hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg text-xs font-semibold transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Borrar</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 px-1">
                            ¿Seguro?
                          </span>
                          <button
                            onClick={ejecutarConfirmacion}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors"
                            title="Confirmar borrado"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmacion(null)}
                            className="p-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-md transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-dark-elevated rounded-xl border border-dashed border-[#E5E7EB] dark:border-dark-border mt-2">
                <Search className="w-5 h-5 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-[#1F2937] dark:text-slate-300 font-semibold mb-1">No se encontraron categorías</p>
                <p className="text-xs text-[#6B7280] dark:text-slate-500">Intenta buscar con otra palabra clave</p>
              </div>
            )}
          </div>
    </ModalGestion>
  );
}