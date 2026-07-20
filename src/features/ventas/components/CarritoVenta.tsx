import { useState } from 'react';
import { Trash2, ChevronDown, Search, Check, UserPlus } from 'lucide-react';
import type { CarritoItem } from '../hooks/useCarrito';
import ItemCarrito from './ItemCarrito';
import SeccionCobro from './SeccionCobro';
import CarritoVacio from './CarritoVacio';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Datos de clientes mock (se reemplazará por hook real) ───────────
const CLIENTES_MOCK = [
  { id: 'consumidor-final', nombre: 'Consumidor Final', cuit: null },
  { id: 'cliente-1', nombre: 'María González', cuit: '20-34567890-1' },
  { id: 'cliente-2', nombre: 'Juan Pérez', cuit: '23-12345678-9' },
  { id: 'cliente-3', nombre: 'Comercial Norte SRL', cuit: '30-71234567-4' },
  { id: 'cliente-4', nombre: 'Distribuidora Sur SA', cuit: '33-65432198-7' },
];

// ── Tipos de comprobante ────────────────────────────────────────────
const TIPOS_COMPROBANTE = [
  { id: 'factura-c', label: 'Factura C' },
  { id: 'factura-b', label: 'Factura B' },
  { id: 'factura-a', label: 'Factura A' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'recibo', label: 'Recibo' },
];

interface CarritoVentaProps {
  items: CarritoItem[];
  subtotal: number;
  descuentoGlobal: number;
  total: number;
  cantidadItems: number;
  onActualizarCantidad: (productId: string, cantidad: number) => void;
  onQuitarProducto: (productId: string) => void;
  onVaciarCarrito: () => void;
  onConfirmar: (montoPagado: number, metodoPago: string) => void;
  onSetDescuentoGlobal: (descuento: number) => void;
  confirmando: boolean;
}

export default function CarritoVenta({
  items,
  subtotal,
  descuentoGlobal,
  total,
  cantidadItems,
  onActualizarCantidad,
  onQuitarProducto,
  onVaciarCarrito,
  onConfirmar,
  onSetDescuentoGlobal,
  confirmando,
}: CarritoVentaProps) {
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false);

  // Estado de los popovers
  const [clienteSeleccionado, setClienteSeleccionado] = useState('consumidor-final');
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState('factura-c');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientePopoverOpen, setClientePopoverOpen] = useState(false);
  const [comprobantePopoverOpen, setComprobantePopoverOpen] = useState(false);

  const handleVaciar = () => {
    if (confirmandoVaciar) {
      onVaciarCarrito();
      setConfirmandoVaciar(false);
    } else {
      setConfirmandoVaciar(true);
      setTimeout(() => setConfirmandoVaciar(false), 3000);
    }
  };

  // Cliente seleccionado para mostrar en el trigger
  const clienteActual = CLIENTES_MOCK.find((c) => c.id === clienteSeleccionado);
  const comprobanteActual = TIPOS_COMPROBANTE.find((c) => c.id === comprobanteSeleccionado);

  // Filtrar clientes por búsqueda
  const clientesFiltrados = CLIENTES_MOCK.filter((c) =>
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    (c.cuit && c.cuit.includes(busquedaCliente))
  );

  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <h2 className="text-[16px] font-bold text-slate-800 dark:text-slate-100">
          Carrito
          {cantidadItems > 0 && (
            <span className="ml-1.5 text-[13px] font-semibold text-slate-400 dark:text-slate-500">
              ({cantidadItems})
            </span>
          )}
        </h2>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleVaciar}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              text-[12px] font-semibold transition-colors duration-150 cursor-pointer
              ${confirmandoVaciar
                ? 'bg-red-600 text-white'
                : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }
            `}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmandoVaciar ? '¿Confirmar?' : 'Limpiar todo'}
          </button>
        )}
      </div>

      {/* Metadatos de venta — popovers buscables (mismo patrón que categorías) */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/60 shrink-0">

        {/* Selector de Cliente — con buscador */}
        <Popover open={clientePopoverOpen} onOpenChange={(open) => {
          setClientePopoverOpen(open);
          if (!open) setBusquedaCliente('');
        }}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center justify-between gap-1 flex-1 min-w-0',
                'h-7 px-2 rounded-lg border border-input bg-transparent',
                'text-[11px] whitespace-nowrap transition-colors outline-none select-none cursor-pointer',
                'hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50',
                'group',
              )}
            >
              <span className="truncate">{clienteActual?.nombre || 'Cliente'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 transition-transform duration-150 ease-linear group-data-[state=open]:rotate-180" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-2 bg-card dark:bg-slate-900 border border-border shadow-md z-50" align="start">
            <div className="flex flex-col gap-2">
              {/* Buscador de clientes */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busquedaCliente}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusquedaCliente(e.target.value)}
                  className="h-7 text-xs pl-8"
                  autoFocus
                />
              </div>

              {/* Lista de clientes */}
              <div className="max-h-[180px] overflow-y-auto flex flex-col gap-0.5 scrollbar-thin">
                {clientesFiltrados.length === 0 ? (
                  <span className="text-xs text-muted-foreground text-center py-2">
                    No se encontraron clientes
                  </span>
                ) : (
                  clientesFiltrados.map((cliente) => {
                    const isSelected = clienteSeleccionado === cliente.id;
                    return (
                      <div
                        key={cliente.id}
                        onClick={() => {
                          setClienteSeleccionado(cliente.id);
                          setClientePopoverOpen(false);
                          setBusquedaCliente('');
                        }}
                        className={cn(
                          'flex items-center gap-2 w-full text-xs px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150',
                          'hover:bg-slate-100 dark:hover:bg-slate-800',
                          isSelected && 'bg-slate-100/60 dark:bg-slate-800/60 font-medium',
                        )}
                      >
                        <Check className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'opacity-100 text-brand-600' : 'opacity-0')} />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{cliente.nombre}</span>
                          {cliente.cuit && (
                            <span className="text-[10px] text-muted-foreground">{cliente.cuit}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Separador + Nuevo cliente */}
              <div className="h-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  // TODO: abrir modal de nuevo cliente
                  setClientePopoverOpen(false);
                }}
                className="flex items-center gap-2 w-full text-xs px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold"
              >
                <UserPlus className="h-3.5 w-3.5 shrink-0" />
                <span>Nuevo cliente</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Selector de Comprobante — sin buscador */}
        <Popover open={comprobantePopoverOpen} onOpenChange={setComprobantePopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center justify-between gap-1 flex-1 min-w-0',
                'h-7 px-2 rounded-lg border border-input bg-transparent',
                'text-[11px] whitespace-nowrap transition-colors outline-none select-none cursor-pointer',
                'hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50',
                'group',
              )}
            >
              <span className="truncate">{comprobanteActual?.label || 'Comprobante'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 transition-transform duration-150 ease-linear group-data-[state=open]:rotate-180" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[160px] p-1.5 bg-card dark:bg-slate-900 border border-border shadow-md z-50" align="end">
            <div className="flex flex-col gap-0.5">
              {TIPOS_COMPROBANTE.map((comp) => {
                const isSelected = comprobanteSeleccionado === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setComprobanteSeleccionado(comp.id);
                      setComprobantePopoverOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2 w-full text-xs px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      isSelected && 'bg-slate-100/60 dark:bg-slate-800/60 font-medium',
                    )}
                  >
                    <Check className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'opacity-100 text-brand-600' : 'opacity-0')} />
                    <span>{comp.label}</span>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Lista de items o estado vacío */}
      {items.length === 0 ? (
        <CarritoVacio />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {items.map((item) => (
              <ItemCarrito
                key={item.productId}
                item={item}
                onActualizarCantidad={onActualizarCantidad}
                onQuitar={onQuitarProducto}
              />
            ))}
          </div>

          {/* Sección de cobro sticky */}
          <SeccionCobro
            subtotal={subtotal}
            descuentoGlobal={descuentoGlobal}
            total={total}
            cantidadItems={cantidadItems}
            onConfirmar={onConfirmar}
            onSetDescuentoGlobal={onSetDescuentoGlobal}
            confirmando={confirmando}
          />
        </>
      )}
    </div>
  );
}
