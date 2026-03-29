import { useState, useRef, useEffect } from "react";
import ModalRegistroProducto, { type ProductoDatos } from "@/components/ModalRegistroProducto";
import ModalImprimirEtiquetas from "@/components/ModalImprimirEtiquetas";
import BarraFiltros, { type FiltrosPOS, type Ordenamiento, MultiSelectDropdown } from "@/components/BarraFiltros";
import ModalGestionCategorias from "@/components/ModalGestionarCategorias";
import ModalActualizarPrecios from "@/components/ModalActualizarPrecios";
import {
  Search, Filter, Plus,
  Trash2, Edit2, Minus, Upload, Download, ChevronLeft, ChevronRight, ChevronDown, X,
  Printer, LayoutGrid, BadgePercent, ListTodo, ArrowUpRight, ImageOff, AlertCircle, XCircle, Tag, MoreVertical
} from "lucide-react";

const productosEjemplo = [
  {
    id: '1',
    nombre: 'Avon sweet honesty',
    codigo: '#7909189182596',
    categoria: 'Higiene Personal',
    proveedor: 'Avon',
    precioCompra: 3000,
    precioVenta: 4200,
    existencia: 12,
    utilidad: 1200,
    porcentaje: 40,
    ventasTotales: 87,
    fechaCreacion: '2025-02-15',
    fechaModificacion: '2025-03-10',
    ultimaActividad: '2026-03-19',
    tipoActividad: 'precio',
  },
  {
    id: '2',
    nombre: 'Agua mineral Villavicencio',
    codigo: '#7790580120149',
    categoria: 'Bebidas',
    proveedor: 'Danone',
    precioCompra: 700,
    precioVenta: 980,
    existencia: 40,
    utilidad: 280,
    porcentaje: 40,
    ventasTotales: 234,
    fechaCreacion: '2025-01-20',
    fechaModificacion: '2025-02-28',
    ultimaActividad: '2026-03-20',
    tipoActividad: 'stock',
  },
  {
    id: '3',
    nombre: 'Detergente Magistral',
    codigo: '#7791234567890',
    categoria: 'Limpieza',
    proveedor: 'Unilever',
    precioCompra: 1500,
    precioVenta: 2100,
    existencia: 3,
    utilidad: 600,
    porcentaje: 40,
    ventasTotales: 45,
    fechaCreacion: '2025-03-01',
    fechaModificacion: '2025-03-15',
    ultimaActividad: '2026-03-18',
    tipoActividad: 'edicion',
  },
  {
    id: '4',
    nombre: 'Leche La Serenísima',
    codigo: '#7790580120149',
    categoria: 'Lácteos',
    proveedor: 'Mastellone',
    precioCompra: 800,
    precioVenta: 1120,
    existencia: 0,
    utilidad: 320,
    porcentaje: 40,
    ventasTotales: 312,
    fechaCreacion: '2025-02-10',
    fechaModificacion: '2025-03-05',
    ultimaActividad: '2026-03-20',
    tipoActividad: 'stock',
  },
  {
    id: '5',
    nombre: 'Coca-Cola 2.25L',
    codigo: '#7790895000058',
    categoria: 'Bebidas',
    proveedor: 'Coca-Cola',
    precioCompra: 1200,
    precioVenta: 1700,
    existencia: 25,
    utilidad: 500,
    porcentaje: 42,
    ventasTotales: 520,
    fechaCreacion: '2025-01-05',
    fechaModificacion: '2025-03-18',
    ultimaActividad: '2026-03-19',
    tipoActividad: 'precio',
  },
  {
    id: '6',
    nombre: 'Jabón en polvo Ala',
    codigo: '#7791234000111',
    categoria: 'Limpieza',
    proveedor: 'Unilever',
    precioCompra: 2200,
    precioVenta: 3100,
    existencia: 8,
    utilidad: 900,
    porcentaje: 41,
    ventasTotales: 67,
    fechaCreacion: '2025-02-20',
    fechaModificacion: '2025-03-12',
    ultimaActividad: '2026-03-15',
    tipoActividad: 'edicion',
  },
  {
    id: '7',
    nombre: 'Galletitas Oreo',
    codigo: '#7790580003456',
    categoria: 'Alimentos',
    proveedor: 'Arcor',
    precioCompra: 600,
    precioVenta: 850,
    existencia: 0,
    utilidad: 250,
    porcentaje: 42,
    ventasTotales: 189,
    fechaCreacion: '2025-01-15',
    fechaModificacion: '2025-03-01',
    ultimaActividad: '2026-03-10',
    tipoActividad: 'stock',
  },
  {
    id: '8',
    nombre: 'Fideos Matarazzo',
    codigo: '#7790570007890',
    categoria: 'Alimentos',
    proveedor: 'Molinos Río de la Plata',
    precioCompra: 450,
    precioVenta: 650,
    existencia: 15,
    utilidad: 200,
    porcentaje: 44,
    ventasTotales: 156,
    fechaCreacion: '2025-03-20',
    fechaModificacion: '2025-03-20',
    ultimaActividad: '2026-03-20',
    tipoActividad: 'nuevo',
  },
];

const getCategoriaColor = (categoria: string) => {
  const map: Record<string, string> = {
    'Higiene Personal': 'bg-sky-400',
    'Bebidas': 'bg-blue-400',
    'Limpieza': 'bg-amber-400',
    'Lácteos': 'bg-orange-400',
    'Alimentos': 'bg-emerald-400',
    'Farmacia': 'bg-teal-400',
    'Snacks': 'bg-teal-400',
    'Cigarrillos': 'bg-teal-400',
    'Ferreteria': 'bg-teal-400',
  };
  return map[categoria] || 'bg-slate-400';
};

const formatearPesos = (monto: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto);
};

// ── Color de fila según index (zebra) ──────────────────────────────────────
const getRowBg = (index: number) =>
  index % 2 === 0
    ? 'bg-white dark:bg-dark-card'
    : 'bg-slate-100 dark:bg-slate-800/50';

const BotonOpciones = ({ abierto, onOpen, onClose, onEdit }: { abierto: boolean; onOpen: () => void; onClose: () => void; onEdit: () => void }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [ubicarArriba, setUbicarArriba] = useState(false);

  useEffect(() => {
    if (abierto && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const container = menuRef.current.closest('.overflow-x-auto');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const spaceBelow = containerRect.bottom - rect.bottom;
        setUbicarArriba(spaceBelow < 180);
      } else {
        const spaceBelow = window.innerHeight - rect.bottom;
        setUbicarArriba(spaceBelow < 180);
      }
    }
  }, [abierto]);

  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (abierto) onClose();
      }
    };
    if (abierto) {
      document.addEventListener("mousedown", handleClickFuera);
    }
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [abierto, onClose]);

  return (
    <div
      className="relative flex justify-center"
      ref={menuRef}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        onClick={() => abierto ? onClose() : onOpen()}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all border shadow-sm active:scale-95 ${abierto
            ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700/50 dark:text-brand-300'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {abierto && (
        <div className={`absolute right-0 ${ubicarArriba ? 'bottom-full pb-2' : 'top-full pt-2'} z-50 animate-in fade-in ${ubicarArriba ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} duration-200`}>
          <div className="w-48 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-lg overflow-hidden py-1">
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => { onClose(); onEdit(); }}
            >
              <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-md text-blue-600 dark:text-blue-400">
                <Edit2 className="w-3.5 h-3.5" />
              </div>
              Editar producto
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => { onClose(); }}
            >
              <div className="bg-green-50 dark:bg-green-900/30 p-1.5 rounded-md text-green-600 dark:text-green-400">
                <Printer className="w-3.5 h-3.5" />
              </div>
              Imprimir etiqueta
            </button>

            <div className="h-px bg-gray-100 dark:bg-dark-border my-1 mx-3"></div>

            <button
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={() => {
                onClose();
                if (confirm('¿Borrar este producto? Esta acción no se puede deshacer.')) {
                  // Lógica de borrado
                }
              }}
            >
              <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-md text-red-700 dark:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              Borrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Productos() {
  const [productos, setProductos] = useState(productosEjemplo);
  const [productoEditando, setProductoEditando] = useState<ProductoDatos | null>(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [filtrosAbierto, setFiltrosAbierto] = useState(false);
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);
  const [modalActualizarAbierto, setModalActualizarAbierto] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>("relevancia");
  const [margenGananciaGlobal, setMargenGananciaGlobal] = useState(40);
  const [gananciaAutoActiva, setGananciaAutoActiva] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosPOS>({
    busqueda: '',
    categorias: [],
    proveedores: [],
    estadoStock: 'todos',
    precioMin: '',
    precioMax: '',
    fechaCampo: 'actividad',
    fechaDesde: '',
    fechaHasta: '',
  });

  const categoriasConConteo = productos.reduce((acc, p) => {
    const cat = acc.find(c => c.nombre === p.categoria);
    if (cat) {
      cat.cantidad++;
    } else {
      acc.push({ nombre: p.categoria, cantidad: 1 });
    }
    return acc;
  }, [] as { nombre: string; cantidad: number }[]);

  const categoriasUnicas = Array.from(new Set(productos.map(p => p.categoria)));
  const proveedoresUnicos = Array.from(new Set(productos.map(p => p.proveedor)));

  const handleVerCategoria = (nombre: string) => {
    setFiltros({ ...filtros, categorias: [nombre], busqueda: '' });
    setModalCategoriasAbierto(false);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(productosFiltrados.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, id]);
    } else {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    }
  };

  const handleAplicarActualizacionPrecios = (actualizados: { id: string; nuevoPrecioVenta: number }[]) => {
    setProductos(prev => prev.map(p => {
      const act = actualizados.find(a => a.id === p.id);
      if (act) {
        const utilidad = act.nuevoPrecioVenta - p.precioCompra;
        const porcentaje = p.precioCompra > 0 ? (utilidad / p.precioCompra) * 100 : 0;
        return {
          ...p,
          precioVenta: act.nuevoPrecioVenta,
          utilidad: Math.round(utilidad),
          porcentaje: Math.round(porcentaje)
        };
      }
      return p;
    }));
  };

  const productosFiltrados = productos
    .filter(producto => {
      if (filtros.busqueda) {
        const term = filtros.busqueda.toLowerCase();
        if (!producto.nombre.toLowerCase().includes(term) && !(producto.codigo || '').toLowerCase().includes(term)) {
          return false;
        }
      }
      if (filtros.categorias.length > 0 && !filtros.categorias.includes(producto.categoria)) return false;
      if (filtros.proveedores.length > 0 && !filtros.proveedores.includes(producto.proveedor)) return false;
      if (filtros.estadoStock === 'enStock' && producto.existencia <= 0) return false;
      if (filtros.estadoStock === 'stockBajo' && (producto.existencia > 5 || producto.existencia === 0)) return false;
      if (filtros.estadoStock === 'agotados' && producto.existencia > 0) return false;
      if (filtros.precioMin && producto.precioVenta < Number(filtros.precioMin)) return false;
      if (filtros.precioMax && producto.precioVenta > Number(filtros.precioMax)) return false;
      if (filtros.fechaDesde || filtros.fechaHasta) {
        if (filtros.fechaCampo === 'actividad') {
          const act = producto.ultimaActividad || producto.fechaModificacion || producto.fechaCreacion;
          const pasaAct = (!filtros.fechaDesde || act >= filtros.fechaDesde) && (!filtros.fechaHasta || act <= filtros.fechaHasta);
          if (!pasaAct) return false;
        } else {
          const fechaProducto = filtros.fechaCampo === 'creacion' ? producto.fechaCreacion : producto.fechaModificacion;
          if (filtros.fechaDesde && fechaProducto < filtros.fechaDesde) return false;
          if (filtros.fechaHasta && fechaProducto > filtros.fechaHasta) return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case 'masVendidos': return b.ventasTotales - a.ventasTotales;
        case 'menosVendidos': return a.ventasTotales - b.ventasTotales;
        case 'actividadReciente': return (b.ultimaActividad || '').localeCompare(a.ultimaActividad || '');
        default: return 0;
      }
    });

  const filtrosActivosCount = [
    filtros.categorias.length > 0,
    filtros.proveedores.length > 0,
    filtros.estadoStock !== 'todos',
    filtros.precioMin !== '',
    filtros.precioMax !== '',
    filtros.fechaDesde !== '',
    filtros.fechaHasta !== '',
    ordenamiento !== 'relevancia',
  ].filter(Boolean).length;

  const chipsActivos: { label: React.ReactNode; onRemove: () => void }[] = [];

  if (ordenamiento !== "relevancia") {
    const labels: Record<string, string> = {
      masVendidos: "Más vendidos",
      menosVendidos: "Menos vendidos",
      actividadReciente: "Actividad reciente",
    };
    chipsActivos.push({
      label: <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">Orden: <strong className="font-bold">{labels[ordenamiento]}</strong></span>,
      onRemove: () => setOrdenamiento("relevancia"),
    });
  }
  if (filtros.estadoStock !== "todos") {
    const labels: Record<string, string> = { enStock: "En stock", stockBajo: "Stock bajo", agotados: "Agotados" };
    chipsActivos.push({
      label: <span className="flex items-center gap-1 font-bold text-orange-700 dark:text-orange-300">{labels[filtros.estadoStock]}</span>,
      onRemove: () => setFiltros({ ...filtros, estadoStock: "todos" }),
    });
  }
  filtros.categorias.forEach((cat) => {
    chipsActivos.push({
      label: <span className="flex items-center gap-1 text-brand-700 dark:text-brand-300 font-medium">Categoría: <strong className="font-bold">{cat}</strong></span>,
      onRemove: () => setFiltros({ ...filtros, categorias: filtros.categorias.filter((c) => c !== cat) }),
    });
  });
  filtros.proveedores.forEach((prov) => {
    chipsActivos.push({
      label: <span className="flex items-center gap-1 text-brand-700 dark:text-brand-300 font-medium">Proveedor: <strong className="font-bold">{prov}</strong></span>,
      onRemove: () => setFiltros({ ...filtros, proveedores: filtros.proveedores.filter((p) => p !== prov) }),
    });
  });
  if (filtros.precioMin) {
    chipsActivos.push({
      label: <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">Precio ≥ <strong>${filtros.precioMin}</strong></span>,
      onRemove: () => setFiltros({ ...filtros, precioMin: "" }),
    });
  }
  if (filtros.precioMax) {
    chipsActivos.push({
      label: <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">Precio ≤ <strong>${filtros.precioMax}</strong></span>,
      onRemove: () => setFiltros({ ...filtros, precioMax: "" }),
    });
  }
  if (filtros.fechaDesde || filtros.fechaHasta) {
    chipsActivos.push({
      label: <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">Fecha: <strong>{filtros.fechaDesde || "..."} → {filtros.fechaHasta || "..."}</strong></span>,
      onRemove: () => setFiltros({ ...filtros, fechaDesde: "", fechaHasta: "" }),
    });
  }

  const handleLimpiarFiltrosNav = () => {
    setFiltros({
      ...filtros,
      categorias: [],
      proveedores: [],
      estadoStock: "todos",
      precioMin: "",
      precioMax: "",
      fechaCampo: "actividad",
      fechaDesde: "",
      fechaHasta: "",
    });
    setOrdenamiento("relevancia");
  };

  const renderBotonesAccion = () => (
    <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">

      <div className="flex items-center h-[38px] border border-slate-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card shadow-sm px-1">
        <div className="flex items-center h-full px-1.5 gap-1">
          <BadgePercent className="w-4 h-4 text-brand-600 dark:text-brand-400 ml-1" />
          <button
            onClick={() => gananciaAutoActiva && setMargenGananciaGlobal(Math.max(0, margenGananciaGlobal - 5))}
            className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="relative h-[24px] flex items-center justify-center">
            <input
              type="text"
              value={margenGananciaGlobal}
              onChange={(e) => {
                if (gananciaAutoActiva) {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setMargenGananciaGlobal(val === '' ? 0 : Math.min(999, parseInt(val, 10)));
                }
              }}
              className="w-[42px] h-full text-center pr-2 text-[14px] font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none focus:bg-slate-50 dark:focus:bg-slate-800 rounded"
              disabled={!gananciaAutoActiva}
            />
            <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-800 dark:text-slate-100 pointer-events-none">%</span>
          </div>
          <button
            onClick={() => gananciaAutoActiva && setMargenGananciaGlobal(margenGananciaGlobal + 5)}
            className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-dark-border mx-1"></div>
        <button
          onClick={() => setGananciaAutoActiva(!gananciaAutoActiva)}
          className="relative flex items-center h-full px-2 gap-2 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 ${gananciaAutoActiva ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
            <div className={`absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-200 ${gananciaAutoActiva ? 'translate-x-[16px]' : 'translate-x-[2px]'
              }`}></div>
          </div>
          <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 pr-1">
            Ganancia por defecto
          </span>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
            <div className="bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl leading-relaxed">
              {gananciaAutoActiva
                ? "El precio de venta se calcula solo al cargar un producto nuevo."
                : "El precio de venta no se calcula automáticamente. Lo ingresás vos a mano."}
              {/* Flecha del tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
            </div>
          </div>
        </button>
      </div>

      <button
        onClick={() => setModalActualizarAbierto(true)}
        className="px-3 h-[38px] border border-slate-200 hover:border-slate-300 dark:border-dark-border rounded-xl text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm active:scale-95"
      >
        <ListTodo size={18} /> <span className="hidden sm:inline">Ajustar precios por inflación</span>
      </button>
      <button
        onClick={() => setModalCategoriasAbierto(true)}
        className="px-3 h-[38px] border border-slate-200 hover:border-slate-300 dark:border-dark-border rounded-xl text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursorAju-pointer transition-all shadow-sm active:scale-95"
      >
        <LayoutGrid size={18} strokeWidth={2} /> <span className="hidden sm:inline">Categorías</span>
      </button>

      <button
        disabled={selectedProducts.length === 0}
        onClick={() => setShowPrintModal(true)}
        className={`px-3 h-[38px] rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${selectedProducts.length > 0
            ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md cursor-pointer'
            : 'bg-gray-100 dark:bg-dark-elevated text-gray-400 dark:text-slate-500 cursor-not-allowed border border-gray-200 dark:border-dark-border'
          }`}
      >
        <Printer size={18} />
        <span className="hidden sm:inline">Imprimir etiquetas</span> {selectedProducts.length > 0 && `(${selectedProducts.length})`}
      </button>

      <button
        onClick={() => setModalRegistroAbierto(true)}
        className="px-4 h-[38px] bg-brand-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-700 shadow-md cursor-pointer transition-transform hover:-translate-y-0.5 whitespace-nowrap"
      >
        <Plus size={18} /> Nuevo Producto
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-[24px] font-sans">

      {/* BARRA DE HERRAMIENTAS PRINCIPAL */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft transition-colors duration-300">
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center flex-1 min-w-[240px] border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-elevated focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-100 dark:focus-within:ring-brand-900 transition-all p-1.5 shadow-sm">
            <div className="pl-2.5 text-slate-400 dark:text-slate-500 flex items-center pr-2">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar por producto, código..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="flex-1 py-1.5 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent min-w-0"
            />

            <div
              className="relative shrink-0 ml-2"
              ref={(node) => {
                if (node && typeof document !== "undefined") {
                  const onClick = (e: MouseEvent) => {
                    if (filtrosAbierto && !node.contains(e.target as Node)) {
                      setFiltrosAbierto(false);
                    }
                  };
                  document.addEventListener("mousedown", onClick);
                  return () => document.removeEventListener("mousedown", onClick);
                }
              }}
            >
              <button
                onClick={() => setFiltrosAbierto(!filtrosAbierto)}
                aria-expanded={filtrosAbierto}
                aria-haspopup="dialog"
                className={`px-3 py-1.5 border rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95 ${filtrosAbierto
                    ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 hover:border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700'
                  }`}
              >
                <Filter className="w-4 h-4" /> Filtrar
                <ChevronDown className={`w-3.5 h-3.5 ml-0.5 text-slate-400 transition-transform ${filtrosAbierto ? 'rotate-180' : ''}`} />
                {filtrosActivosCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border border-white dark:border-dark-card">
                    {filtrosActivosCount}
                  </span>
                )}
              </button>

              <BarraFiltros
                isOpen={filtrosAbierto}
                onClose={() => setFiltrosAbierto(false)}
                filtros={filtros}
                setFiltros={setFiltros}
                ordenamiento={ordenamiento}
                setOrdenamiento={setOrdenamiento}
                categoriasDisponibles={categoriasUnicas}
                proveedoresDisponibles={proveedoresUnicos}
              />
            </div>
          </div>

          {renderBotonesAccion()}
        </div>

        {chipsActivos.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-dark-border">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Filtros Activos:</span>
            {chipsActivos.map((chip, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-50/50 dark:bg-brand-900/30 text-[13px] shadow-sm border border-brand-100 dark:border-brand-800/60"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="hover:bg-brand-200 dark:hover:bg-brand-800 rounded-full p-0.5 ml-1 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <button
              onClick={handleLimpiarFiltrosNav}
              className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline hover:text-brand-700 dark:hover:text-brand-300 ml-2 cursor-pointer transition-colors"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>


      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-soft overflow-hidden flex flex-col transition-colors duration-300">

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{productosFiltrados.length} productos</span>
            {ordenamiento !== 'relevancia' && (
              <>
                <div className="w-px h-4 bg-gray-200 dark:bg-dark-border"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ordenado por: <strong className="text-brand-600 dark:text-brand-400">{
                    ordenamiento === 'masVendidos' ? 'Más vendidos' :
                      ordenamiento === 'menosVendidos' ? 'Menos vendidos' :
                        'Actividad reciente'
                  }</strong>
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 xl:flex-none justify-start xl:justify-center">
            <MultiSelectDropdown
              label="Categoría"
              icon={Tag}
              opciones={categoriasUnicas}
              seleccionadas={filtros.categorias}
              onChange={(cats) => setFiltros({ ...filtros, categorias: cats })}
              variant="small"
            />

            <button
              title="Filtrar stock bajo"
              onClick={() => setFiltros({ ...filtros, estadoStock: filtros.estadoStock === 'stockBajo' ? 'todos' : 'stockBajo' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${filtros.estadoStock === 'stockBajo'
                  ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
            >
              <AlertCircle size={14} className={filtros.estadoStock === 'stockBajo' ? '' : 'text-slate-400 dark:text-slate-500'} /> Stock Bajo
            </button>
            <button
              title="Filtrar agotados"
              onClick={() => setFiltros({ ...filtros, estadoStock: filtros.estadoStock === 'agotados' ? 'todos' : 'agotados' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm cursor-pointer ${filtros.estadoStock === 'agotados'
                  ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-dark-elevated dark:border-dark-border dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
            >
              <XCircle size={14} className={filtros.estadoStock === 'agotados' ? '' : 'text-slate-400 dark:text-slate-500'} /> Agotados
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 dark:border-dark-border rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm active:scale-95">
              <Upload size={16} /> Cargar
            </button>
            <button className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 dark:border-dark-border rounded-lg text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm active:scale-95">
              <Download size={16} /> Descargar
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b-2 border-gray-200 dark:border-dark-border tracking-wider">
              <tr>
                <th className="py-4 pl-6 pr-2">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los productos"
                    className="rounded border-gray-300 dark:border-slate-600 w-4 h-4 cursor-pointer accent-brand-600"
                    checked={selectedProducts.length === productosFiltrados.length && productosFiltrados.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="py-4 px-2 min-w-[280px]">PRODUCTO</th>
                <th className="py-4 px-2 text-center">STOCK ACTUAL</th>
                <th className="py-4 px-2 text-center">PRECIO FINAL</th>
                <th className="py-4 px-2 text-center">COSTO</th>
                <th className="py-4 px-2">GANANCIA</th>
                <th className="py-4 px-2">CATEGORÍA</th>
                <th className="py-4 pl-2 pr-8 min-w-[140px]">PROVEEDOR</th>
                <th className="py-4 px-6 text-center sticky right-0 bg-slate-50 dark:bg-slate-800/50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] z-20 border-b-2 border-gray-200 dark:border-dark-border">OPCIONES</th>
              </tr>
            </thead>

            <tbody className="relative">
              {productosFiltrados.map((producto, index) => (
                <tr
                  key={producto.id}
                  className={`${getRowBg(index)} hover:[background-color:rgba(14,138,114,0.08)] dark:hover:[background-color:rgba(14,138,114,0.12)] transition-colors duration-150 group cursor-pointer`}
                >
                  <td className="py-3 pl-6 pr-2">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar producto ${producto.nombre}`}
                      className="rounded border-gray-300 dark:border-slate-600 w-4 h-4 cursor-pointer accent-brand-600"
                      checked={selectedProducts.includes(producto.id)}
                      onChange={(e) => handleSelectProduct(producto.id, e.target.checked)}
                    />
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-lg cursor-zoom-in hover:scale-150 transition-transform origin-left z-10 border border-slate-200 dark:border-slate-700/60 shrink-0">
                        <ImageOff className="w-5 h-5 opacity-50" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-slate-900 dark:text-slate-50">{producto.nombre}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-bold tracking-wide">{producto.codigo}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex flex-col items-center justify-center relative">
                      <div className="relative group/stock">
                        <input
                          key={producto.existencia}
                          type="number"
                          title="Clic para editar stock"
                          aria-label={`Cantidad en stock de ${producto.nombre}`}
                          defaultValue={producto.existencia}
                          className={`w-14 h-9 text-center font-bold outline-none text-sm rounded-lg border shadow-sm transition-all bg-white dark:bg-dark-card cursor-text hover:bg-gray-50 dark:hover:bg-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${producto.existencia <= 0
                              ? 'border-red-300 hover:border-red-400 dark:border-red-500/50 text-red-600 dark:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                              : producto.existencia <= 5
                                ? 'border-amber-300 hover:border-amber-400 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                : 'border-gray-200 hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                            }`}
                        />
                        <div className={`absolute -right-2 -top-2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-card shadow-sm z-10 ${producto.existencia <= 0
                            ? 'bg-red-500 animate-pulse'
                            : producto.existencia <= 5
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`} title={producto.existencia <= 0 ? 'Stock agotado' : producto.existencia <= 5 ? 'Nivel de stock bajo' : 'Stock en nivel normal'} />
                        {producto.existencia <= 5 && (
                          <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${producto.existencia <= 0
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-amber-500 dark:text-amber-400'
                            }`}>
                            {producto.existencia <= 0 ? 'Agotado' : 'Bajo'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2 text-center">
                    <input
                      key={producto.precioVenta}
                      type="text"
                      title="Clic para editar precio final"
                      aria-label={`Precio de venta de ${producto.nombre}`}
                      defaultValue={formatearPesos(producto.precioVenta)}
                      className="w-[105px] h-9 text-center px-1.5 font-bold outline-none text-[14px] rounded-lg border shadow-sm transition-all bg-white dark:bg-dark-card cursor-text hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </td>

                  <td className="py-3 px-2 text-center">
                    <input
                      key={producto.precioCompra}
                      type="text"
                      title="Clic para editar costo"
                      aria-label={`Precio de compra de ${producto.nombre}`}
                      defaultValue={formatearPesos(producto.precioCompra)}
                      className="w-[105px] h-9 text-center px-1.5 font-bold outline-none text-[14px] rounded-lg border shadow-sm transition-all bg-white dark:bg-dark-card cursor-text hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 hover:border-gray-300 dark:border-dark-border dark:hover:border-slate-500 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="font-bold text-green-700 dark:text-green-500 text-[14px] flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{formatearPesos(producto.utilidad)}
                      </span>
                      <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                        ({producto.porcentaje}%)
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getCategoriaColor(producto.categoria)}`}></div>
                      <span className="text-[14px] text-slate-600 dark:text-slate-300 font-medium">{producto.categoria}</span>
                    </div>
                  </td>

                  <td className="py-3 pl-2 pr-8">
                    <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">{producto.proveedor}</span>
                  </td>

                  <td className={`
                    py-3 px-6 sticky right-0 transition-colors duration-150
                    shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]
                    dark:shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)]
                    ${menuAbiertoId === producto.id ? 'z-50' : 'z-10'}
                    ${getRowBg(index)}
                    group-hover:[background-color:rgba(14,138,114,0.08)]
                    dark:group-hover:[background-color:rgba(14,138,114,0.12)]
                  `}>
                    <BotonOpciones
                      abierto={menuAbiertoId === producto.id}
                      onOpen={() => setMenuAbiertoId(producto.id)}
                      onClose={() => setMenuAbiertoId(null)}
                      onEdit={() => {
                        setProductoEditando({
                          codigo: producto.codigo,
                          descripcion: producto.nombre,
                          categoria: producto.categoria,
                          proveedor: producto.proveedor,
                          precioCompra: producto.precioCompra.toString(),
                          precioVenta: producto.precioVenta.toString(),
                          existencia: producto.existencia.toString(),
                          stockMinimo: "5"
                        });
                        setModalRegistroAbierto(true);
                      }}
                    />
                  </td>
                </tr>
              ))}

              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-base text-slate-600 dark:text-slate-300">
                    No se encontraron productos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PIE DE PÁGINA: Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50/30 dark:bg-dark-surface/50 gap-4">
          <div className="flex items-center gap-2">
            <button aria-label="Página anterior" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-dark-border text-slate-400 bg-gray-50 dark:bg-dark-card cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button aria-current="page" aria-label="Página 1" className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-600 text-white font-bold shadow-sm">
              1
            </button>
            <button aria-label="Página siguiente" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-dark-elevated dark:hover:bg-slate-700 cursor-pointer transition-all shadow-sm active:scale-95">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <select aria-label="Productos por página" className="border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1.5 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 outline-none focus:border-brand-500 cursor-pointer">
                <option>10 por página</option>
                <option>20 por página</option>
                <option>50 por página</option>
              </select>
            </div>
            <span>Mostrando 1 - {productosFiltrados.length} de {productosFiltrados.length} productos</span>
          </div>
        </div>

      </div>

      {/* Modales */}
      <ModalRegistroProducto
        isOpen={modalRegistroAbierto}
        onClose={() => { setModalRegistroAbierto(false); setProductoEditando(null); }}
        margenGananciaGlobal={margenGananciaGlobal}
        productoAEditar={productoEditando}
      />

      <ModalImprimirEtiquetas
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        productos={productos.filter(p => selectedProducts.includes(p.id))}
      />

      <ModalGestionCategorias
        isOpen={modalCategoriasAbierto}
        onClose={() => setModalCategoriasAbierto(false)}
        categorias={categoriasConConteo}
        onVerCategoria={handleVerCategoria}
        onAgregarCategoria={handleAgregarCategoria}
        onEditarCategoria={handleEditarCategoria}
        onBorrarCategoria={handleBorrarCategoria}
      />

      <ModalActualizarPrecios
        isOpen={modalActualizarAbierto}
        onClose={() => setModalActualizarAbierto(false)}
        productos={productos}
        categoriasDisponibles={categoriasUnicas}
        productosSeleccionadosIds={selectedProducts}
        onAplicar={handleAplicarActualizacionPrecios}
      />
    </div>
  );
}