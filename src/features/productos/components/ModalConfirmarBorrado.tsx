import { AlertTriangle } from "lucide-react";
import { ModalAccion } from "@/components/ui/modal-wrappers";

interface ModalConfirmarBorradoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  nombreProducto: string;
  isPending?: boolean;
}

/**
 * Modal de confirmación para borrar (soft delete) un producto.
 * Muestra el nombre del producto y botones Cancelar / Confirmar.
 */
export default function ModalConfirmarBorrado({
  isOpen,
  onClose,
  onConfirmar,
  nombreProducto,
  isPending = false,
}: ModalConfirmarBorradoProps) {
  return (
    <ModalAccion
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Borrar producto"
      onCancelar={onClose}
      onAccion={onConfirmar}
      accionLabel={isPending ? "Borrando..." : "Borrar producto"}
      accionDisabled={isPending}
      accionIcon={<AlertTriangle className="w-4 h-4" />}
      className="sm:max-w-md"
    >
      <div className="flex flex-col items-center text-center gap-4 py-6 px-6">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            ¿Estás seguro de que querés borrar el producto?
          </p>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {nombreProducto}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            El producto será desactivado y no aparecerá en las listas.
            Esta acción se puede revertir.
          </p>
        </div>
      </div>
    </ModalAccion>
  );
}
