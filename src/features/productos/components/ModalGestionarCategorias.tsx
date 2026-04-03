import { useState } from "react";
import {
  X, Search, Plus, Check, Trash2, Edit2, AlertTriangle,
  Package, Tag
} from "lucide-react";
import { getCategoriaColor } from "@/theme"; // ← viene del archivo central
import type { Categoria } from "@/types/categoria.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[calc(100%-2rem)] sm:max-w-xl p-0 gap-0 overflow-hidden bg-white dark:bg-dark-card border-none shadow-xl rounded-2xl" 
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Gestionar Categorías</DialogTitle>
        <div className="relative flex flex-col w-full max-h-[85vh]">

        {/* Overlay de Confirmación */}
        {confirmacion && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-2xl rounded-2xl p-6 w-full max-w-sm space-y-4">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Confirmar Acción</h3>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {confirmacion.tipo === "editar" ? (
                  <>
                    Vas a cambiar{" "}
                    <span className="font-bold text-slate-800 dark:text-slate-100">"{confirmacion.nombre}"</span>{" "}
                    por{" "}
                    <span className="font-bold text-brand-600 dark:text-brand-400">"{confirmacion.nuevoNombre}"</span>.
                    Esto afectará a todos los productos.
                  </>
                ) : (
                  <>
                    ¿Borrar{" "}
                    <span className="font-bold text-slate-800 dark:text-slate-100">"{confirmacion.nombre}"</span>?
                    Los productos pasarán a{" "}
                    <span className="font-bold text-brand-600 dark:text-brand-400">Sin categoría</span>.
                  </>
                )}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmacion(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarConfirmacion}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md hover:-translate-y-0.5 ${
                    confirmacion.tipo === "borrar"
                      ? "bg-rose-700 hover:bg-rose-600"
                      : "bg-brand-600 hover:bg-brand-700"
                  }`}
                >
                  {confirmacion.tipo === "borrar" ? "Borrar" : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-brand-50 to-white dark:from-dark-elevated dark:to-dark-card">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Gestionar Categorías
          </h2>
          <button
            onClick={onClose}
            className="text-white bg-rose-400 hover:bg-rose-500 dark:bg-rose-600 dark:hover:bg-rose-700 p-1.5 rounded-full transition-all shadow-sm -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controles */}
        <div className="p-5 flex flex-col md:flex-row gap-4 border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card z-10">
          {/* Buscador */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Buscar categoría
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-200 dark:border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-elevated shadow-sm"
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
                  className="w-full border border-gray-200 dark:border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-dark-elevated shadow-sm"
                />
              </div>
              <button
                onClick={handleAgregar}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Crear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[150px] max-h-[50vh]">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1 mb-1">
            Listado ({categoriasFiltradas.length})
          </h3>

          {categoriasFiltradas.length > 0 ? (
            <div className="flex flex-col bg-white dark:bg-dark-elevated rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden divide-y divide-gray-200 dark:divide-dark-border shadow-sm">
              {categoriasFiltradas.map((cat) => (
                <div
                  key={cat.nombre}
                  className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Puntito de color — viene de theme.ts */}
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
                        <div
                          className="flex items-center gap-2 cursor-pointer truncate"
                          onClick={() => iniciarEdicion(cat.nombre)}
                          title="Clic para editar el nombre"
                        >
                          <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors pb-0.5">
                            {cat.nombre}
                          </p>
                          <Edit2 className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ml-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {cat.cantidad} {cat.cantidad === 1 ? "producto" : "productos"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 pl-3 border-l border-gray-100 dark:border-dark-border ml-2 shrink-0">
                    <button
                      onClick={() => onVerCategoria(cat.nombre)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 rounded-lg text-xs font-bold text-white transition-all shadow-sm hover:-translate-y-0.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    <button
                      onClick={() => solicitarBorrado(cat.nombre)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-bold text-white transition-all shadow-sm hover:-translate-y-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Borrar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-dark-elevated rounded-xl border border-dashed border-gray-200 dark:border-dark-border mt-2">
              <Search className="w-5 h-5 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-1">No se encontraron categorías</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Intenta buscar con otra palabra clave</p>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-elevated/50 flex justify-between items-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {categorias.length} categorías en total
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="px-5 py-2.5 h-auto text-sm font-bold text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-dark-elevated"
          >
            CERRAR
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}