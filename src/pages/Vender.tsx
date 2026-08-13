import { useState, useCallback, useRef, useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useGetProductos } from '@/features/productos/hooks/useProductos';
import { useCarrito } from '@/features/ventas/hooks/useCarrito';
import { useCreateVenta } from '@/features/ventas/hooks/useVentas';
import { useGetCajaAbierta } from '@/features/ventas/hooks/useCaja';
import GrillaProductosVenta from '@/features/ventas/components/GrillaProductosVenta';
import CarritoVenta, { CLIENTES_MOCK } from '@/features/ventas/components/CarritoVenta';
import ModalPago from '@/features/ventas/components/ModalPago';
import type { PagoData } from '@/features/ventas/components/ModalPago';
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
  const [modalPagoOpen, setModalPagoOpen] = useState(false);

  // ── Cliente elevado desde CarritoVenta ─────────────────────────────
  const [clienteSeleccionado, setClienteSeleccionado] = useState('consumidor-final');

  const clienteActual = useMemo(
    () => CLIENTES_MOCK.find((c) => c.id === clienteSeleccionado),
    [clienteSeleccionado]
  );
  const clienteEsConsumidorFinal = clienteSeleccionado === 'consumidor-final';
  const nombreClienteFiado = clienteActual && !clienteEsConsumidorFinal
    ? clienteActual.nombre
    : undefined;

  // Toast de feedback
  const [toast, setToast] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const mostrarToast = useCallback((tipo: 'exito' | 'error', mensaje: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ tipo, mensaje });
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const hayCajaAbierta = !!cajaAbierta;

  // Abrir modal de pago (valida caja abierta primero)
  const handleAbrirModalPago = useCallback(() => {
    if (!cajaAbierta?.id) {
      setModalAbrirOpen(true);
      return;
    }
    if (carrito.items.length === 0) return;
    setModalPagoOpen(true);
  }, [cajaAbierta, carrito.items.length]);

  // Confirmar venta desde el modal de pago
  const handleConfirmarVenta = useCallback(
    async (pagos: PagoData[]) => {
      if (!cajaAbierta?.id) return;
      if (carrito.items.length === 0) return;

      const totalPagado = pagos.reduce((acc, p) => acc + p.amount, 0);

      // Separar ítems fiados
      const itemsFiados = carrito.items.filter((i) => i.fiado);

      // TODO: [CUENTA CORRIENTE] Integración con backend pendiente.
      // Cuando el backend de cuenta corriente esté listo, enviar los ítems fiados
      // en una llamada separada (o como parte del payload de la venta):
      //
      //   {
      //     clienteId: clienteSeleccionado,
      //     clienteNombre: clienteActual?.nombre,
      //     items: itemsFiados.map(item => ({
      //       productId: item.productId,
      //       productName: item.productName,
      //       unitPrice: item.unitPrice,
      //       quantity: item.quantity,
      //       subtotal: item.unitPrice * item.quantity - item.discountAmount,
      //     })),
      //     total: carrito.totalFiado,
      //     fecha: new Date().toISOString(),
      //   }
      //
      // Por ahora los ítems fiados se omiten del payload de la venta.
      // El stock SÍ se descuenta igualmente (el backend de ventas ya lo hace
      // para todos los ítems, pero cuando se separe habrá que manejarlo).

      if (itemsFiados.length > 0) {
        console.info(
          '[FIADO] Ítems fiados pendientes de enviar a cuenta corriente:',
          { cliente: clienteActual?.nombre, items: itemsFiados, total: carrito.totalFiado }
        );
      }

      try {
        await crearVenta.mutateAsync({
          storeId: MOCK_STORE_ID,
          cashRegisterId: cajaAbierta.id,
          userId: MOCK_USER_ID,
          customerId: clienteEsConsumidorFinal ? null : clienteSeleccionado,
          status: 'COMPLETED',
          paymentStatus: itemsFiados.length > 0 ? 'PARTIALLY_PAID' : 'PAID',
          subtotal: carrito.subtotal,
          discountAmount: carrito.descuentoGlobal,
          total: carrito.total,
          totalPaid: totalPagado,
          change: Math.max(0, totalPagado - carrito.totalAPagar),
          pendingAmount: carrito.totalFiado,
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
            isCredited: item.fiado,
            isDeleted: false,
          })),
          payments: pagos.map((p) => ({
            method: p.method as 'CASH',
            amount: p.amount,
            reference: p.reference || null,
            isDeleted: false,
          })),
          isDeleted: false,
        });

        setModalPagoOpen(false);
        carrito.vaciarCarrito();
        setClienteSeleccionado('consumidor-final');

        const mensajeFiado = itemsFiados.length > 0
          ? ` (${itemsFiados.length} fiado${itemsFiados.length > 1 ? 's' : ''})`
          : '';
        mostrarToast('exito', `¡Venta registrada con éxito!${mensajeFiado}`);
      } catch {
        mostrarToast('error', 'Error al registrar la venta. Intentá de nuevo.');
      }
    },
    [carrito, crearVenta, mostrarToast, cajaAbierta, clienteSeleccionado, clienteActual, clienteEsConsumidorFinal]
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
    <div className="h-[100vh] flex flex-col gap-3 -m-6 p-3">
      {/* Layout split */}
      <div className="flex-1 grid grid-cols-[1fr_429px] gap-3 min-h-0">
        {/* Panel izquierdo — Productos */}
        <div className="min-h-0 overflow-visible flex flex-col">
          <GrillaProductosVenta
            productos={productos}
            carritoItems={carrito.items}
            onAgregarProducto={carrito.agregarProducto}
            isCajaAbierta={hayCajaAbierta}
            onAbrirCajaClick={() => setModalAbrirOpen(true)}
            onCerrarCajaClick={() => setModalCerrarOpen(true)}
          />
        </div>

        {/* Panel derecho — Carrito */}
        <div className="min-h-0">
          <CarritoVenta
            items={carrito.items}
            subtotal={carrito.subtotal}
            descuentoGlobal={carrito.descuentoGlobal}
            total={carrito.total}
            totalFiado={carrito.totalFiado}
            totalAPagar={carrito.totalAPagar}
            cantidadItems={carrito.cantidadItems}
            onActualizarCantidad={carrito.actualizarCantidad}
            onQuitarProducto={carrito.quitarProducto}
            onToggleFiado={carrito.toggleFiado}
            onSetAllFiado={carrito.setAllFiado}
            onVaciarCarrito={carrito.vaciarCarrito}
            onAbrirModalPago={handleAbrirModalPago}
            onSetDescuentoGlobal={carrito.setDescuentoGlobal}
            clienteSeleccionado={clienteSeleccionado}
            onClienteChange={setClienteSeleccionado}
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

      {/* Modal de pago — recibe totalAPagar (sin lo fiado) */}
      <ModalPago
        open={modalPagoOpen}
        onOpenChange={setModalPagoOpen}
        total={carrito.totalAPagar}
        montoFiado={carrito.totalFiado}
        nombreClienteFiado={nombreClienteFiado}
        onConfirmar={handleConfirmarVenta}
        confirmando={crearVenta.isPending}
      />

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
