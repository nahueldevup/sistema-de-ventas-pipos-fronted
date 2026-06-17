import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { CarritoItem } from '../hooks/useCarrito';
import ItemCarrito from './ItemCarrito';
import SeccionCobro from './SeccionCobro';
import CarritoVacio from './CarritoVacio';

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
  confirmando,
}: CarritoVentaProps) {
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false);

  const handleVaciar = () => {
    if (confirmandoVaciar) {
      onVaciarCarrito();
      setConfirmandoVaciar(false);
    } else {
      setConfirmandoVaciar(true);
      // Auto-cancelar confirmación después de 3 segundos
      setTimeout(() => setConfirmandoVaciar(false), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
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
              text-[12px] font-semibold transition-all duration-200 cursor-pointer
              ${confirmandoVaciar
                ? 'bg-red-600 text-white'
                : 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }
            `}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmandoVaciar ? '¿Confirmar?' : 'Vaciar'}
          </button>
        )}
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
            confirmando={confirmando}
          />
        </>
      )}
    </div>
  );
}
