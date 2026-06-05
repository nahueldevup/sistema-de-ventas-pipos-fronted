import { useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';
import { useGetProductos } from '@/features/productos/hooks/useProductos';
import { useCarrito } from '@/features/ventas/hooks/useCarrito';
import { useCreateVenta } from '@/features/ventas/hooks/useVentas';
import { useGetCajaAbierta } from '@/features/ventas/hooks/useCaja';
import GrillaProductosVenta from '@/features/ventas/components/GrillaProductosVenta';
import CarritoVenta from '@/features/ventas/components/CarritoVenta';
import ModalAbrirCaja from '@/features/ventas/components/ModalAbrirCaja';
import ModalCerrarCaja from '@/features/ventas/components/ModalCerrarCaja';
import { MOCK_STORE_ID, MOCK_USER_ID } from '@/config/mock.config';

export default function Vender() {
  const { data: productos = [], isLoading: cargandoProductos } = useGetProductos();
  const { data: cajaAbierta, isLoading: cargandoCaja } = useGetCajaAbierta();
  const carrito = useCarrito();
  const crearVenta = useCreateVenta();

  // Modales de caja
  const [modalAbrirOpen, setModalAbrirOpen] = useState(false);
  const [modalCerrarOpen, setModalCerrarOpen] = useState(false);

  // Toast de feedback
  const [toast, setToast] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mostrarToast = useCallback((tipo: 'exito' | 'error', mensaje: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ tipo, mensaje });
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const hayCajaAbierta = !!cajaAbierta;

  const handleConfirmarVenta = useCallback(
    async (montoPagado: number, metodoPago: string) => {
      if (!cajaAbierta?.id) {
        setModalAbrirOpen(true);
        return;
      }
      if (carrito.items.length === 0) return;

      try {
        await crearVenta.mutateAsync({
          storeId: MOCK_STORE_ID,
          cashRegisterId: cajaAbierta.id,
          userId: MOCK_USER_ID,
          customerId: null,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          subtotal: carrito.subtotal,
          discountAmount: carrito.descuentoGlobal,
          total: carrito.total,
          totalPaid: montoPagado,
          change: Math.max(0, montoPagado - carrito.total),
          pendingAmount: 0,
          note: carrito.nota || null,
          items: carrito.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productBarcode: item.productBarcode,
            productImage: item.productImage,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice,
            quantity: item.quantity,
            quantityReturned: 0,
            discountAmount: item.discountAmount,
            subtotal: item.unitPrice * item.quantity - item.discountAmount,
            status: 'SOLD' as const,
            isCredited: false,
            isDeleted: false,
          })),
          payments: [
            {
              method: metodoPago as 'CASH',
              amount: montoPagado,
              reference: null,
              isDeleted: false,
            },
          ],
          isDeleted: false,
        });

        carrito.vaciarCarrito();
        mostrarToast('exito', '¡Venta registrada con éxito!');
      } catch {
        mostrarToast('error', 'Error al registrar la venta. Intentá de nuevo.');
      }
    },
    [carrito, crearVenta, mostrarToast, cajaAbierta]
  );

  // Loading inicial
  if (cargandoProductos || cargandoCaja) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4 -m-6 p-4">
      {/* Header con estado de caja */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 sr-only">
            Vender
          </h1>

          {/* Chip dinámico de estado de caja */}
          {hayCajaAbierta ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">
                Caja abierta
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setModalAbrirOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-800/40 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[12px] font-bold text-brand-700 dark:text-brand-400">
                Abrir caja
              </span>
            </button>
          )}
        </div>

        {/* Botón cerrar caja */}
        {hayCajaAbierta && (
          <button
            type="button"
            onClick={() => setModalCerrarOpen(true)}
            className="
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
              text-[12px] font-semibold
              text-red-600 dark:text-red-400
              border border-red-200 dark:border-red-800/40
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors cursor-pointer
            "
          >
            <Lock className="w-3.5 h-3.5" />
            Cerrar caja
          </button>
        )}
      </div>

      {/* Layout split */}
      <div className="flex-1 grid grid-cols-[1fr_380px] gap-4 min-h-0">
        {/* Panel izquierdo — Productos */}
        <div className="min-h-0 overflow-hidden flex flex-col">
          <GrillaProductosVenta
            productos={productos}
            carritoItems={carrito.items}
            onAgregarProducto={carrito.agregarProducto}
          />
        </div>

        {/* Panel derecho — Carrito */}
        <div className="min-h-0">
          <CarritoVenta
            items={carrito.items}
            subtotal={carrito.subtotal}
            descuentoGlobal={carrito.descuentoGlobal}
            total={carrito.total}
            cantidadItems={carrito.cantidadItems}
            onActualizarCantidad={carrito.actualizarCantidad}
            onQuitarProducto={carrito.quitarProducto}
            onVaciarCarrito={carrito.vaciarCarrito}
            onConfirmar={handleConfirmarVenta}
            confirmando={crearVenta.isPending}
          />
        </div>
      </div>

      {/* Modal abrir caja — ya no es bloqueante de entrada */}
      <ModalAbrirCaja
        open={modalAbrirOpen}
        onOpenChange={setModalAbrirOpen}
      />

      {/* Modal cerrar caja */}
      {cajaAbierta?.id && (
        <ModalCerrarCaja
          open={modalCerrarOpen}
          onOpenChange={setModalCerrarOpen}
          cashRegisterId={cajaAbierta.id}
        />
      )}

      {/* Toast de feedback */}
      {toast && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg
            text-[14px] font-semibold
            animate-in fade-in slide-in-from-bottom-4 duration-300
            ${toast.tipo === 'exito'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
            }
          `}
        >
          {toast.tipo === 'exito' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}
