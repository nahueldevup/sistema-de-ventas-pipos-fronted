import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import type { ProductoDatos } from "@/types/producto.types";

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

import BarraHerramientas from "@/features/productos/components/BarraHerramientas";
import TablaProductos from "@/features/productos/components/TablaProductos";
import VistaCards from "@/features/productos/components/VistaCards";
import ToggleVista, { type TipoVista } from "@/features/productos/components/ToggleVista";
import FiltrosRapidos from '@/features/productos/components/FiltrosRapidos';
import useFiltrosProductos from "@/hooks/useFiltrosProductos";
import { PRODUCTOS_EJEMPLO } from "@/datos/productos.datos";

export default function Productos() {
  const [productos, setProductos] = useState(PRODUCTOS_EJEMPLO);
  const [productoEditando, setProductoEditando] = useState<ProductoDatos | null>(null);
  const [modalActivo, setModalActivo] = useState<
    "registro" | "etiquetas" | "categorias" | "actualizarPrecios" | null
  >(null);
  const [margenGananciaGlobal, setMargenGananciaGlobal] = useState(40);
  const [gananciaAutoActiva, setGananciaAutoActiva] = useState(true);

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

  const categoriasConConteo = useMemo(() => {
    return productos.reduce(
      (acc, p) => {
        const cat = acc.find((c) => c.nombre === p.categoria);
        if (cat) {
          cat.cantidad++;
        } else {
          acc.push({ nombre: p.categoria, cantidad: 1 });
        }
        return acc;
      },
      [] as { nombre: string; cantidad: number }[]
    );
  }, [productos]);

  const categoriasUnicas = useMemo(
    () => Array.from(new Set(productos.map((p) => p.categoria))),
    [productos]
  );
  const proveedoresUnicos = useMemo(
    () => Array.from(new Set(productos.map((p) => p.proveedor))),
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

  const handleEditarCategoria = useCallback(
    (nombreAnterior: string, nombreNuevo: string) => {
      setProductos((prev) =>
        prev.map((p) =>
          p.categoria === nombreAnterior ? { ...p, categoria: nombreNuevo } : p
        )
      );
    },
    []
  );

  const handleBorrarCategoria = useCallback((nombre: string) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.categoria === nombre ? { ...p, categoria: "General" } : p
      )
    );
  }, []);

  const handleActualizarPreciosMasivos = useCallback(
    (
      productosIds: string[],
      calculo: number | ((prev: number) => number)
    ) => {
      setProductos((prev) =>
        prev.map((p) => {
          if (productosIds.includes(p.id)) {
            const nuevoPrecioVenta =
              typeof calculo === "function" ? calculo(p.precioVenta) : calculo;
            const utilidad = nuevoPrecioVenta - p.precioCompra;
            const porcentaje =
              p.precioCompra > 0 ? (utilidad / p.precioCompra) * 100 : 0;
            return {
              ...p,
              precioVenta: nuevoPrecioVenta,
              utilidad: Math.round(utilidad),
              porcentaje: Math.round(porcentaje),
            };
          }
          return p;
        })
      );
    },
    []
  );

  const handleEditar = useCallback((p: (typeof productos)[0]) => {
    setProductoEditando({
      codigo: p.codigo,
      descripcion: p.nombre,
      categoria: p.categoria,
      proveedor: p.proveedor,
      precioCompra: p.precioCompra.toString(),
      precioVenta: p.precioVenta.toString(),
      existencia: p.existencia.toString(),
      stockMinimo: "5",
    });
    setModalActivo("registro");
  }, []);

  return (
    <div className="flex flex-col gap-6 font-sans">

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
          onNuevoProducto={() => setModalActivo("registro")}
          onAbrirCategorias={() => setModalActivo("categorias")}
          onAbrirActualizarPrecios={() => setModalActivo("actualizarPrecios")}
          onAbrirImprimirEtiquetas={() => setModalActivo("etiquetas")}
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
        />
      ) : (
        <VistaCards
          productos={productosFiltrados}
          onEditar={handleEditar}
        />
      )}

      {/* Modales (lazy-loaded) */}
      <Suspense fallback={null}>
        <ModalRegistroProducto
          isOpen={modalActivo === "registro"}
          onClose={() => {
            setModalActivo(null);
            setProductoEditando(null);
          }}
          margenGananciaGlobal={margenGananciaGlobal}
          productoAEditar={productoEditando}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalImprimirEtiquetas
          isOpen={modalActivo === "etiquetas"}
          onClose={() => setModalActivo(null)}
          todosLosProductos={productos}
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
          todosLosProductos={productos}
          onActualizarPrecios={handleActualizarPreciosMasivos}
        />
      </Suspense>
    </div>
  );
}
