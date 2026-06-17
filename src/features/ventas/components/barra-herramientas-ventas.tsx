import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Coins,
  HelpCircle,
  X,
  Check,
  ImageOff,
  LockOpen,
  Lock,
  ChevronDown,
  CircleArrowDown,
  CircleArrowUp,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/schemas/product.schema';
import { formatearPesos } from '@/lib/ventaUtils';

// ── Configuración de visibilidad de botones ─────────────────────────────
const TOOLBAR_CONFIG_KEY = 'pipos_toolbar_ventas_config';

interface ToolbarVisibilityConfig {
  aperturaCaja: boolean;
  consultarPrecio: boolean;
  montoManual: boolean;
  devolucion: boolean;
  gastosIngresos: boolean;
}

const TOOLBAR_DEFAULTS: ToolbarVisibilityConfig = {
  aperturaCaja: true,
  consultarPrecio: true,
  montoManual: true,
  devolucion: true,
  gastosIngresos: true,
};

// Labels legibles para cada botón
const TOOLBAR_LABELS: Record<keyof ToolbarVisibilityConfig, string> = {
  aperturaCaja: 'Apertura / Cierre de Caja',
  consultarPrecio: 'Consultar Precio',
  montoManual: 'Monto Manual',
  devolucion: 'Devolución',
  gastosIngresos: 'Gastos e Ingresos',
};

/** Lee la config de localStorage y la mergea con defaults (try/catch seguro) */
function loadToolbarConfig(): ToolbarVisibilityConfig {
  try {
    const raw = localStorage.getItem(TOOLBAR_CONFIG_KEY);
    if (!raw) return { ...TOOLBAR_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ToolbarVisibilityConfig>;
    // Merge: defaults + lo guardado (así claves nuevas arrancan en true)
    return { ...TOOLBAR_DEFAULTS, ...parsed };
  } catch {
    return { ...TOOLBAR_DEFAULTS };
  }
}

function saveToolbarConfig(config: ToolbarVisibilityConfig): void {
  localStorage.setItem(TOOLBAR_CONFIG_KEY, JSON.stringify(config));
}

interface Categoria {
  id: string;
  nombre: string;
}

interface BarraHerramientasVentasProps {
  // Buscador
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  productos: Product[];

  // Categorías
  categorias: Categoria[];
  categoriasSeleccionadas: string[];
  onToggleCategoria: (id: string) => void;
  onLimpiarCategorias: () => void;

  // Modos de vista
  vista: 'grilla' | 'fila';
  onVistaChange: (vista: 'grilla' | 'fila') => void;

  // Acciones
  onNuevoProductoClick: () => void;
  onDevolucionClick: () => void;
  onGastosIngresosClick: () => void;
  onMontoManualClick: () => void;

  // Control de Caja
  isCajaAbierta: boolean;
  onAbrirCajaClick: () => void;
  onCerrarCajaClick: () => void;
}

export const BarraHerramientasVentas: React.FC<BarraHerramientasVentasProps> = ({
  busqueda,
  onBusquedaChange,
  productos,
  categorias,
  categoriasSeleccionadas,
  onToggleCategoria,
  onLimpiarCategorias,
  vista,
  onVistaChange,
  onNuevoProductoClick,
  onDevolucionClick,
  onGastosIngresosClick,
  onMontoManualClick,
  isCajaAbierta,
  onAbrirCajaClick,
  onCerrarCajaClick,
}) => {
  const buscadorRef = useRef<HTMLInputElement>(null);
  const consultaPrecioRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Estado de visibilidad de botones de la fila inferior ─────────────
  const [toolbarConfig, setToolbarConfig] = useState<ToolbarVisibilityConfig>(loadToolbarConfig);

  const toggleButtonVisibility = useCallback((key: keyof ToolbarVisibilityConfig) => {
    setToolbarConfig(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveToolbarConfig(next);
      return next;
    });
  }, []);

  // ── Escalado proporcional al expandir sidebar ────────────────────────
  // Detecta cambios de ancho del <aside> (sidebar) vía ResizeObserver.
  // Cuando el sidebar se expande (>100px), calcula un factor de escala
  // para que la barra mantenga el layout sin wrap.
  const SIDEBAR_COLLAPSED_WIDTH = 80;
  const [scaleFactor, setScaleFactor] = useState(1);
  const [barHeight, setBarHeight] = useState(0);

  const recalcScale = useCallback(() => {
    const aside = document.querySelector('aside');
    if (!aside || !containerRef.current) return;

    // Medir la altura original de la barra (offsetHeight no se ve afectado por transform)
    setBarHeight(containerRef.current.offsetHeight);

    const sidebarWidth = aside.getBoundingClientRect().width;
    const isExpanded = sidebarWidth > SIDEBAR_COLLAPSED_WIDTH + 20;

    if (isExpanded) {
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      const availableWidth = parent.clientWidth;
      const extraWidth = sidebarWidth - SIDEBAR_COLLAPSED_WIDTH;
      const baseWidth = availableWidth + extraWidth;
      const factor = Math.min(1, availableWidth / baseWidth);
      setScaleFactor(factor);
    } else {
      setScaleFactor(1);
    }
  }, []);

  useEffect(() => {
    const aside = document.querySelector('aside');
    if (!aside) return;

    const observer = new ResizeObserver(() => {
      recalcScale();
    });

    observer.observe(aside);
    // También recalcular si cambia el tamaño de la ventana
    window.addEventListener('resize', recalcScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recalcScale);
    };
  }, [recalcScale]);

  // Estados locales para filtros y consulta de precios
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [isConsultarPrecioOpen, setIsConsultarPrecioOpen] = useState(false);
  const [codigoConsulta, setCodigoConsulta] = useState('');
  const [precioConsultado, setPrecioConsultado] = useState<Product | null | 'NOT_FOUND'>(null);

  // Manejo de atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Si el usuario está escribiendo en cualquier input o textarea, ignorar atajos globales
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      // Atajo 'F' para enfocar el buscador principal
      if (key === 'f') {
        e.preventDefault();
        buscadorRef.current?.focus();
      }

      // Atajo 'M' para activar monto manual
      if (key === 'm') {
        e.preventDefault();
        onMontoManualClick();
      }

      // Atajo 'C' para abrir la consulta de precio
      if (key === 'c') {
        e.preventDefault();
        setIsConsultarPrecioOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConsultarPrecioOpen, onMontoManualClick]);

  // Auto-enfocar el input de consulta de precio al abrirse
  useEffect(() => {
    if (isConsultarPrecioOpen) {
      setTimeout(() => {
        consultaPrecioRef.current?.focus();
      }, 100);
    }
  }, [isConsultarPrecioOpen]);

  // Filtrar la lista de categorías en el dropdown según el input de búsqueda interno
  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase())
  );

  // Búsqueda real de precio
  const handleConsultaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = codigoConsulta.trim().toLowerCase();
    if (!query) return;

    const producto = productos.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === query) ||
        (p.sku && p.sku.toLowerCase() === query) ||
        p.name.toLowerCase().includes(query)
    );

    if (producto) {
      setPrecioConsultado(producto);
    } else {
      setPrecioConsultado('NOT_FOUND');
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 bg-card p-3 rounded-xl border border-border shadow-sm"
      style={{
        transformOrigin: 'top left',
        transform: scaleFactor < 1 ? `scale(${scaleFactor})` : undefined,
        width: scaleFactor < 1 ? `calc(100% / ${scaleFactor})` : '100%',
        // Compensar el espacio sobrante que deja el scale en el flujo del DOM
        marginBottom: scaleFactor < 1 ? `${-(barHeight * (1 - scaleFactor))}px` : undefined,
        transition: 'transform 200ms ease-in-out, width 200ms ease-in-out, margin-bottom 200ms ease-in-out',
      }}
    >
      {/* FILA SUPERIOR: Búsqueda, Filtros y Gestión */}
      <div className="flex items-center gap-2">

        {/* BUSCADOR PRINCIPAL (Atajo F) */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={buscadorRef}
            type="text"
            placeholder="Buscar producto... (Presione 'F')"
            value={busqueda}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onBusquedaChange(e.target.value)}
            className="pl-9 pr-8"
          />
          {busqueda && (
            <button
              onClick={() => onBusquedaChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* FILTRO POR CATEGORÍA (Buscable con inputs) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[180px] group">
              <span className="truncate">
                {categoriasSeleccionadas.length === 0
                  ? 'Todas las categorías'
                  : `Categorías (${categoriasSeleccionadas.length})`}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-2 bg-card dark:bg-slate-900 border border-border shadow-md z-50" align="start">
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Buscar categoría..."
                value={busquedaCategoria}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusquedaCategoria(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1 pr-1">
                {categoriasFiltradas.length === 0 ? (
                  <span className="text-xs text-muted-foreground text-center py-2">
                    No se encontraron resultados
                  </span>
                ) : (
                  categoriasFiltradas.map((cat) => {
                    const isSelected = categoriasSeleccionadas.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => onToggleCategoria(cat.id)}
                        className={cn(
                          "flex items-center gap-2.5 w-full text-sm px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800",
                          isSelected && "bg-slate-100/60 dark:bg-slate-800/60 font-medium"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          tabIndex={-1}
                          className="pointer-events-none"
                        />
                        <span>{cat.nombre}</span>
                      </div>
                    );
                  })
                )}
              </div>
              {categoriasSeleccionadas.length > 0 && (
                <>
                  <div className="h-px bg-border mt-1" />
                  <Button
                    variant="outline"
                    onClick={onLimpiarCategorias}
                    className="text-xs h-8 w-full text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50"
                  >
                    Limpiar todo
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* NUEVO PRODUCTO */}
        <Button
          variant="outline"
          onClick={onNuevoProductoClick}
          className="gap-2 text-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Producto</span>
        </Button>

        {/* TOGGLE VISTA (Grilla / Fila) */}
        <div className="flex items-center h-8 rounded-lg border border-input bg-background shrink-0 overflow-hidden">
          <button
            type="button"
            onClick={() => onVistaChange('grilla')}
            title="Vista de Grilla"
            className={cn(
              "flex items-center justify-center h-full w-8 transition-colors duration-150",
              vista === 'grilla'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <div className="w-[1px] h-full bg-border" />
          <button
            type="button"
            onClick={() => onVistaChange('fila')}
            title="Vista de Lista/Fila"
            className={cn(
              "flex items-center justify-center h-full w-8 transition-colors duration-150",
              vista === 'fila'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* FILA INFERIOR: Acciones Operativas */}
      <div className="flex items-center gap-2">

        {/* CONTROL DE CAJA DINÁMICO */}
        {toolbarConfig.aperturaCaja && (
          !isCajaAbierta ? (
            <Button
              variant="outline"
              onClick={onAbrirCajaClick}
              className="gap-2 text-sm shrink-0"
            >
              <LockOpen className="h-4 w-4 text-emerald-600" />
              <span>Apertura de Caja</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onCerrarCajaClick}
              className="gap-2 text-sm shrink-0"
            >
              <Lock className="h-4 w-4 text-red-500" />
              <span>Cierre de caja</span>
            </Button>
          )
        )}

        {/* CONSULTAR PRECIO (Atajo C) — Trigger condicional */}
        {toolbarConfig.consultarPrecio && (
          <Button
            variant="outline"
            onClick={() => setIsConsultarPrecioOpen(true)}
            className="gap-2 text-sm bg-background shrink-0"
          >
            <HelpCircle className="h-4 w-4 text-blue-500" />
            <span>Consultar el Precio</span>
            <kbd className="hidden sm:inline-block pointer-events-none bg-muted px-1.5 py-0.5 text-[10px] font-mono border rounded text-muted-foreground ml-1">C</kbd>
          </Button>
        )}

        {/* Dialog de consulta de precio — siempre montado para ser abierto desde acciones rápidas */}
        <Dialog open={isConsultarPrecioOpen} onOpenChange={setIsConsultarPrecioOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Consultar Precio de Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleConsultaSubmit} className="flex flex-col gap-4 py-2">
              <div className="relative">
                <Input
                  ref={consultaPrecioRef}
                  type="text"
                  placeholder="Escanee código o escriba nombre..."
                  value={codigoConsulta}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCodigoConsulta(e.target.value);
                    if (!e.target.value) setPrecioConsultado(null);
                  }}
                  className="pr-8 h-12 text-base"
                />
                {codigoConsulta && (
                  <button
                    type="button"
                    onClick={() => { setCodigoConsulta(''); setPrecioConsultado(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <PrecioConsultadoView resultado={precioConsultado} codigo={codigoConsulta} />
            </form>
          </DialogContent>
        </Dialog>

        {/* MONTO MANUAL (Atajo M) */}
        {toolbarConfig.montoManual && (
          <Button
            variant="outline"
            onClick={onMontoManualClick}
            className="gap-2 text-sm shrink-0"
          >
            <Coins className="h-4 w-4 text-amber-500" />
            <span>Monto Manual</span>
            <kbd className="hidden sm:inline-block pointer-events-none bg-muted px-1.5 py-0.5 text-[10px] font-mono border rounded text-muted-foreground ml-1">M</kbd>
          </Button>
        )}

        {/* DEVOLUCIÓN */}
        {toolbarConfig.devolucion && (
          <Button
            variant="outline"
            onClick={onDevolucionClick}
            className="gap-2 text-sm hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 shrink-0"
          >
            <RotateCcw className="h-4 w-4 text-destructive" />
            <span>Devolución</span>
          </Button>
        )}

        {/* GASTOS E INGRESOS */}
        {toolbarConfig.gastosIngresos && (
          <Button
            variant="outline"
            onClick={onGastosIngresosClick}
            className="gap-2 text-sm shrink-0"
          >
            <div className="flex gap-0.5">
              <CircleArrowDown className="h-4 w-4 text-emerald-500" />
              <CircleArrowUp className="h-4 w-4 text-red-500" />
            </div>
            <span>Gastos</span>
            <kbd className="hidden sm:inline-block pointer-events-none bg-muted px-1.5 py-0.5 text-[10px] font-mono border rounded text-muted-foreground ml-1">G</kbd>
          </Button>
        )}

        {/* BOTÓN ENGRANAJE: Configuración de visibilidad */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto shrink-0 px-2">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-0 bg-card dark:bg-slate-900 border border-border shadow-md z-50" align="end">
            {/* Sección: Configurar barra */}
            <div className="px-3 pt-3 pb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configurar barra</h4>
              <div className="flex flex-col gap-1">
                {(Object.keys(TOOLBAR_DEFAULTS) as Array<keyof ToolbarVisibilityConfig>).map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      checked={toolbarConfig[key]}
                      onCheckedChange={() => toggleButtonVisibility(key)}
                    />
                    <span className="text-sm select-none">{TOOLBAR_LABELS[key]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sección: Acciones rápidas (solo si hay botones ocultos) */}
            {Object.values(toolbarConfig).some(v => !v) && (
              <>
                <div className="h-px bg-border" />
                <div className="px-3 pt-2 pb-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Acciones rápidas</h4>
                  <div className="flex flex-col gap-0.5">
                    {!toolbarConfig.aperturaCaja && (
                      <button
                        type="button"
                        onClick={isCajaAbierta ? onCerrarCajaClick : onAbrirCajaClick}
                        className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground active:bg-slate-200 dark:active:bg-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          {isCajaAbierta
                            ? <><Lock className="h-4 w-4 text-red-500" /><span>Cierre de caja</span></>
                            : <><LockOpen className="h-4 w-4 text-emerald-600" /><span>Apertura de Caja</span></>
                          }
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {!toolbarConfig.consultarPrecio && (
                      <button
                        type="button"
                        onClick={() => setIsConsultarPrecioOpen(true)}
                        className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground active:bg-slate-200 dark:active:bg-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-blue-500" />
                          <span>Consultar Precio</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {!toolbarConfig.montoManual && (
                      <button
                        type="button"
                        onClick={onMontoManualClick}
                        className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground active:bg-slate-200 dark:active:bg-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span>Monto Manual</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {!toolbarConfig.devolucion && (
                      <button
                        type="button"
                        onClick={onDevolucionClick}
                        className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground active:bg-slate-200 dark:active:bg-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-destructive" />
                          <span>Devolución</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {!toolbarConfig.gastosIngresos && (
                      <button
                        type="button"
                        onClick={onGastosIngresosClick}
                        className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground active:bg-slate-200 dark:active:bg-slate-700"
                      >
                        <span className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            <CircleArrowDown className="h-4 w-4 text-emerald-500" />
                            <CircleArrowUp className="h-4 w-4 text-red-500" />
                          </div>
                          <span>Gastos e Ingresos</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>

      </div>
    </div>
  );
};

// Componente auxiliar para la consulta rápida de precios
const PrecioConsultadoView = ({ resultado, codigo }: { resultado: Product | null | 'NOT_FOUND', codigo: string }) => {
  const [imgError, setImgError] = useState(false);

  if (!codigo) return null;

  if (resultado === 'NOT_FOUND') {
    return (
      <div className="mt-2 p-4 bg-destructive/10 rounded-xl border border-destructive/20 flex items-center justify-center min-h-[100px]">
        <span className="text-sm font-medium text-destructive">No se encontró ningún producto con ese código.</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-4 bg-muted/40 rounded-xl border border-border flex items-center gap-4 min-h-[100px] shadow-sm">
      {resultado ? (
        <>
          {/* Imagen */}
          <div className="relative w-20 h-20 shrink-0 bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-border/50">
            {resultado.image && !imgError ? (
              <img
                src={resultado.image}
                alt={resultado.name}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              </div>
            )}
          </div>

          {/* Info Principal */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="text-[15px] font-bold text-foreground leading-tight line-clamp-2" title={resultado.name}>
              {resultado.name}
            </h4>
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <span className="text-muted-foreground font-mono bg-background px-1.5 py-0.5 rounded border border-border/50 shadow-sm">
                {resultado.barcode || resultado.sku || 'Sin cód.'}
              </span>
              <span className={`font-semibold ${resultado.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                Stock: {resultado.stock}
              </span>
            </div>
          </div>

          {/* Precio */}
          <div className="flex flex-col items-end shrink-0 pl-4 border-l border-border/50">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Precio</span>
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400 leading-none">
              {formatearPesos(resultado.salePrice)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex w-full items-center justify-center h-[80px]">
          <span className="text-sm text-muted-foreground animate-pulse">Presione Enter para buscar...</span>
        </div>
      )}
    </div>
  );
};
