import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import type { Product, PersistedProduct } from "@/schemas/product.schema";
import { useGetProductos, useDeleteProducto } from "@/features/productos/hooks/useProductos";

const ModalRegistroProducto = lazy(() =>
  import("@/features/productos/components/ModalRegistroProducto")
);
const ModalImprimirEtiquetas = lazy(() =>
  import("@/features/productos/components/ModalImprimirEtiquetas")
);
const ModalGestionCategorias = lazy(() =>
  import("@/features/productos/components/ModalGestionarCategorias")
);
const ModalActualizarPrecios = lazy(() =>
  import("@/features/productos/components/ModalActualizarPrecios")
);
const ModalConfirmarBorrado = lazy(() =>
  import("@/features/productos/components/ModalConfirmarBorrado")
);

import BarraHerramientas from "@/features/productos/components/BarraHerramientas";
import TablaProductos from "@/features/productos/components/TablaProductos";
import VistaCards from "@/features/productos/components/VistaCards";
import ToggleVista, { type TipoVista } from "@/features/productos/components/ToggleVista";
import FiltrosRapidos from '@/features/productos/components/FiltrosRapidos';
import useFiltrosProductos from "@/hooks/useFiltrosProductos";



export default function Productos() {
  // ── Fuente de verdad única: TanStack Query ──────────────────────
  const { data: productos = [], isLoading, isError } = useGetProductos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Product | null>(null);
  const [modalActivo, setModalActivo] = useState<
    "etiquetas" | "categorias" | "actualizarPrecios" | null
  >(null);
  const [margenGananciaGlobal, setMargenGananciaGlobal] = useState(40);
  const [gananciaAutoActiva, setGananciaAutoActiva] = useState(true);

  // ── Soft delete ──────────────────────────────────────────────
  const [productoABorrar, setProductoABorrar] = useState<Product | null>(null);
  const deleteProducto = useDeleteProducto();

  // ── Imprimir etiqueta ─────────────────────────────────────────
  const [productoAImprimirId, setProductoAImprimirId] = useState<string | null>(null);

  // ── Vista tabla / cards ──────────────────────────────────
  const [vista, setVista] = useState<TipoVista>("tabla");

  const {
    filtrosAvanzados,
    setFiltrosAvanzados,
    filtrosRapidos,
    setFiltrosRapidos,
    ordenamiento,
    setOrdenamiento,
    productosFiltrados,
    filtrosActivosCount,
  } = useFiltrosProductos(productos);

  // ── Productos con id garantizado (para modales que necesitan PersistedProduct) ──
  const productosConId = useMemo(
    () => productos.filter((p): p is PersistedProduct => !!p.id),
    [productos]
  );

  const categoriasConConteo = useMemo(() => {
    return productos.reduce(
      (acc, p) => {
        const catName = p.categoryId || 'Sin categoría';
        const cat = acc.find((c) => c.nombre === catName);
        if (cat) {
          cat.cantidad++;
        } else {
          acc.push({ nombre: catName, cantidad: 1 });
        }
        return acc;
      },
      [] as { nombre: string; cantidad: number }[]
    );
  }, [productos]);

  const categoriasUnicas = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoryId || 'Sin categoría'))),
    [productos]
  );
  const proveedoresUnicos = useMemo(
    () => Array.from(new Set(productos.map((p) => p.supplierId || 'Sin proveedor'))),
    [productos]
  );

  const handleVerCategoria = useCallback(
    (nombre: string) => {
      setFiltrosAvanzados((prev) => ({
        ...prev,
        categorias: [nombre],
        busqueda: "",
      }));
      setModalActivo(null);
    },
    [setFiltrosAvanzados]
  );

  const handleAgregarCategoria = useCallback((nombre: string) => {
    console.log("Nueva categoría:", nombre);
  }, []);

  // TODO: Migrar estos handlers a mutaciones cuando se refactoricen los modales
  const handleEditarCategoria = useCallback(
    (_nombreAnterior: string, _nombreNuevo: string) => {
      console.warn("[Pendiente] handleEditarCategoria requiere mutaciones. Se implementará al refactorizar ModalGestionarCategorias.");
    },
    []
  );

  const handleBorrarCategoria = useCallback((_nombre: string) => {
    console.warn("[Pendiente] handleBorrarCategoria requiere mutaciones. Se implementará al refactorizar ModalGestionarCategorias.");
  }, []);

  const handleActualizarPreciosMasivos = useCallback(
    (
      _productosIds: string[],
      _calculo: number | ((prev: number) => number)
    ) => {
      console.warn("[Pendiente] handleActualizarPreciosMasivos requiere mutaciones. Se implementará al refactorizar ModalActualizarPrecios.");
    },
    []
  );

  const handleEditar = useCallback((prod: Product) => {
    setProductoEditando(prod);
    setIsModalOpen(true);
  }, []);

  const handleBorrar = useCallback((prod: Product) => {
    setProductoABorrar(prod);
  }, []);

  const handleConfirmarBorrado = useCallback(() => {
    if (!productoABorrar?.id) return;
    deleteProducto.mutate(productoABorrar.id, {
      onSuccess: () => setProductoABorrar(null),
    });
  }, [productoABorrar, deleteProducto]);

  const handleImprimir = useCallback((prod: Product) => {
    if (prod.id) {
      setProductoAImprimirId(prod.id);
      setModalActivo("etiquetas");
    }
  }, []);

  // ── Estado: Carga inicial ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 font-sans -mt-3">
        <div className="bg-card p-4 rounded-2xl border border-border shadow-soft animate-pulse">
          <div className="h-[38px] bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-soft min-h-[400px] p-6 flex flex-col gap-4">
          <div className="flex gap-4 border-b border-border pb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6 animate-pulse" />
            ))}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center py-3 border-b border-border/50">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse shrink-0" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Estado: Error ──────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col gap-4 font-sans -mt-3">
        <div className="bg-card rounded-2xl border border-red-200 dark:border-red-900/50 shadow-soft flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-lg text-slate-800 dark:text-slate-100">Error al cargar productos</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Ha ocurrido un problema al conectar con el servidor. Intenta recargar la página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-sans -mt-3">

      {/* BARRA DE HERRAMIENTAS + TOGGLE VISTA */}
      <div className="flex flex-col gap-3">
        <BarraHerramientas
          filtros={filtrosAvanzados}
          setFiltros={setFiltrosAvanzados}
          ordenamiento={ordenamiento}
          setOrdenamiento={setOrdenamiento}
          filtrosActivosCount={filtrosActivosCount}
          categoriasDisponibles={categoriasUnicas}
          proveedoresDisponibles={proveedoresUnicos}
          margenGananciaGlobal={margenGananciaGlobal}
          setMargenGananciaGlobal={setMargenGananciaGlobal}
          gananciaAutoActiva={gananciaAutoActiva}
          setGananciaAutoActiva={setGananciaAutoActiva}
          onNuevoProducto={() => setIsModalOpen(true)}
          onAbrirCategorias={() => setModalActivo("categorias")}
          onAbrirActualizarPrecios={() => setModalActivo("actualizarPrecios")}
          onAbrirImprimirEtiquetas={() => {
            setProductoAImprimirId(null);
            setModalActivo("etiquetas");
          }}
        />

        {/* Toggle de vista y Filtros Rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-medium text-[#6B7280] dark:text-slate-400">
              <span className="font-bold text-[#1F2937] dark:text-slate-200">
                {productosFiltrados.length}
              </span>{" "}
              producto{productosFiltrados.length !== 1 ? "s" : ""} encontrado
              {productosFiltrados.length !== 1 ? "s" : ""}
            </p>

            <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-dark-border" />

            <FiltrosRapidos
              filtrosRapidos={filtrosRapidos}
              setFiltrosRapidos={setFiltrosRapidos}
              categoriasUnicas={categoriasUnicas}
            />
          </div>

          <ToggleVista vista={vista} onChange={setVista} />
        </div>
      </div>

      {/* CONTENIDO SEGÚN VISTA */}
      {vista === "tabla" ? (
        <TablaProductos
          productos={productosFiltrados}
          onEditar={handleEditar}
          onBorrar={handleBorrar}
          onImprimir={handleImprimir}
        />
      ) : (
        <VistaCards
          productos={productosFiltrados}
          onEditar={handleEditar}
          onBorrar={handleBorrar}
          onImprimir={handleImprimir}
        />
      )}

      {/* Modales (lazy-loaded) */}
      <Suspense fallback={null}>
        <ModalRegistroProducto
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setProductoEditando(null);
          }}
          productoAEditar={productoEditando}
          margenGananciaGlobal={40}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalImprimirEtiquetas
          isOpen={modalActivo === "etiquetas"}
          onClose={() => {
            setModalActivo(null);
            setProductoAImprimirId(null);
          }}
          todosLosProductos={productosConId}
          productoPreseleccionadoId={productoAImprimirId}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalGestionCategorias
          isOpen={modalActivo === "categorias"}
          onClose={() => setModalActivo(null)}
          categorias={categoriasConConteo}
          onVerCategoria={handleVerCategoria}
          onAgregarCategoria={handleAgregarCategoria}
          onEditarCategoria={handleEditarCategoria}
          onBorrarCategoria={handleBorrarCategoria}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalActualizarPrecios
          isOpen={modalActivo === "actualizarPrecios"}
          onClose={() => setModalActivo(null)}
          todosLosProductos={productosConId}
          onActualizarPrecios={handleActualizarPreciosMasivos}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalConfirmarBorrado
          isOpen={!!productoABorrar}
          onClose={() => setProductoABorrar(null)}
          onConfirmar={handleConfirmarBorrado}
          nombreProducto={productoABorrar?.name || ''}
          isPending={deleteProducto.isPending}
        />
      </Suspense>
    </div>
  );
}
