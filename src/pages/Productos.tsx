import { useState, useMemo, lazy, Suspense } from "react";
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
import useFiltrosProductos from "@/hooks/useFiltrosProductos";
import useSeleccionProductos from "@/hooks/useSeleccionProductos";
import { PRODUCTOS_EJEMPLO } from "@/datos/productos.datos";

export default function Productos() {
  const [productos, setProductos] = useState(PRODUCTOS_EJEMPLO);
  const [productoEditando, setProductoEditando] = useState<ProductoDatos | null>(null);
  const [modalActivo, setModalActivo] = useState<'registro' | 'etiquetas' | 'categorias' | 'actualizarPrecios' | null>(null);
  const [margenGananciaGlobal, setMargenGananciaGlobal] = useState(40);
  const [gananciaAutoActiva, setGananciaAutoActiva] = useState(true);

  const { filtros, setFiltros, ordenamiento, setOrdenamiento, productosFiltrados, filtrosActivosCount } =
    useFiltrosProductos(productos);

  const { seleccionados, seleccionarTodos, toggleSeleccion } =
    useSeleccionProductos(productosFiltrados);

  const categoriasConConteo = useMemo(() => {
    return productos.reduce((acc, p) => {
      const cat = acc.find(c => c.nombre === p.categoria);
      if (cat) {
        cat.cantidad++;
      } else {
        acc.push({ nombre: p.categoria, cantidad: 1 });
      }
      return acc;
    }, [] as { nombre: string; cantidad: number }[]);
  }, [productos]);

  const categoriasUnicas = useMemo(() => Array.from(new Set(productos.map(p => p.categoria))), [productos]);
  const proveedoresUnicos = useMemo(() => Array.from(new Set(productos.map(p => p.proveedor))), [productos]);

  const handleVerCategoria = (nombre: string) => {
    setFiltros({ ...filtros, categorias: [nombre], busqueda: '' });
    setModalActivo(null);
  };

  const handleAgregarCategoria = (nombre: string) => {
    console.log("Nueva categoría:", nombre);
  };

  const handleEditarCategoria = (nombreAnterior: string, nombreNuevo: string) => {
    setProductos(prev => prev.map(p =>
      p.categoria === nombreAnterior ? { ...p, categoria: nombreNuevo } : p
    ));
  };

  const handleBorrarCategoria = (nombre: string) => {
    setProductos(prev => prev.map(p =>
      p.categoria === nombre ? { ...p, categoria: 'General' } : p
    ));
  };

  const handleActualizarPreciosMasivos = (productosIds: string[], calculo: number | ((prev: number) => number)) => {
    setProductos(prev => prev.map(p => {
      if (productosIds.includes(p.id)) {
        const nuevoPrecioVenta = typeof calculo === 'function' ? calculo(p.precioVenta) : calculo;
        const utilidad = nuevoPrecioVenta - p.precioCompra;
        const porcentaje = p.precioCompra > 0 ? (utilidad / p.precioCompra) * 100 : 0;
        return {
          ...p,
          precioVenta: nuevoPrecioVenta,
          utilidad: Math.round(utilidad),
          porcentaje: Math.round(porcentaje)
        };
      }
      return p;
    }));
  };

  const handleEditar = (p: typeof productos[0]) => {
    setProductoEditando({
      codigo: p.codigo,
      descripcion: p.nombre,
      categoria: p.categoria,
      proveedor: p.proveedor,
      precioCompra: p.precioCompra.toString(),
      precioVenta: p.precioVenta.toString(),
      existencia: p.existencia.toString(),
      stockMinimo: "5"
    });
    setModalActivo('registro');
  };

  return (
    <div className="flex flex-col gap-[24px] font-sans">

      {/* BARRA DE HERRAMIENTAS PRINCIPAL */}
      <BarraHerramientas
        filtros={filtros}
        setFiltros={setFiltros}
        ordenamiento={ordenamiento}
        setOrdenamiento={setOrdenamiento}
        filtrosActivosCount={filtrosActivosCount}
        categoriasDisponibles={categoriasUnicas}
        proveedoresDisponibles={proveedoresUnicos}
        margenGananciaGlobal={margenGananciaGlobal}
        setMargenGananciaGlobal={setMargenGananciaGlobal}
        gananciaAutoActiva={gananciaAutoActiva}
        setGananciaAutoActiva={setGananciaAutoActiva}
        onNuevoProducto={() => setModalActivo('registro')}
        onAbrirCategorias={() => setModalActivo('categorias')}
        onAbrirActualizarPrecios={() => setModalActivo('actualizarPrecios')}
        onAbrirImprimirEtiquetas={() => setModalActivo('etiquetas')}
      />

      {/* CONTENEDOR DE LA TABLA */}
      <TablaProductos
        productos={productosFiltrados}
        seleccionados={seleccionados}
        onSeleccionarTodos={seleccionarTodos}
        onToggleSeleccion={toggleSeleccion}
        onEditar={handleEditar}
        ordenamiento={ordenamiento}
        filtros={filtros}
        setFiltros={setFiltros}
        categoriasUnicas={categoriasUnicas}
      />

      {/* Modales (lazy-loaded) */}
      <Suspense fallback={null}>
        <ModalRegistroProducto
          isOpen={modalActivo === 'registro'}
          onClose={() => { setModalActivo(null); setProductoEditando(null); }}
          margenGananciaGlobal={margenGananciaGlobal}
          productoAEditar={productoEditando}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalImprimirEtiquetas
          isOpen={modalActivo === 'etiquetas'}
          onClose={() => setModalActivo(null)}
          todosLosProductos={productos}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ModalGestionCategorias
          isOpen={modalActivo === 'categorias'}
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
          isOpen={modalActivo === 'actualizarPrecios'}
          onClose={() => setModalActivo(null)}
          todosLosProductos={productos}
          onActualizarPrecios={handleActualizarPreciosMasivos}
        />
      </Suspense>
    </div>
  );
}