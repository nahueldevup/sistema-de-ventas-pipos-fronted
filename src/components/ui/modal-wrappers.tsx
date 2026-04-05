import * as React from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────────────────────────
// Helpers internos compartidos por los tres wrappers
// ─────────────────────────────────────────────────────────────────

/** Header estandarizado SaaS */
function ModalHeader({
  title,
  subtitle,
  titleIcon,
  onClose,
}: {
  title: string
  subtitle?: string
  titleIcon?: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-[#E5E7EB] dark:border-dark-border bg-[#F6F7F8] dark:bg-dark-elevated shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-[#1F2937] dark:text-slate-100 flex items-center gap-2">
          {titleIcon}
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-[#6B7280] hover:text-[#1F2937] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-[#F3F4F6] dark:hover:bg-dark-elevated p-1.5 rounded-lg transition-colors"
        title="Cerrar"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

/** Estilos base compartidos por el botón Cancelar / Cerrar del footer */
const cancelButtonClass =
  "px-5 py-2.5 h-auto text-sm font-semibold text-[#1F2937] dark:text-slate-300 border-[#E5E7EB] dark:border-slate-600 hover:bg-[#F3F4F6] dark:hover:bg-dark-elevated cursor-pointer"

/** Estilos base compartidos por el botón primario habilitado del footer */
const primaryEnabledClass =
  "px-6 py-2.5 h-auto bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold cursor-pointer active:scale-95 flex items-center gap-2"

/** Estilos del botón primario deshabilitado */
const primaryDisabledClass =
  "px-6 py-2.5 h-auto bg-gray-200 dark:bg-dark-elevated text-gray-400 dark:text-slate-500 cursor-not-allowed text-sm font-semibold flex items-center gap-2"

// ─────────────────────────────────────────────────────────────────
// Tipo A — ModalFormulario (Cancelar + Guardar)
// ─────────────────────────────────────────────────────────────────

interface ModalFormularioProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  titleIcon?: React.ReactNode
  children: React.ReactNode
  onCancelar: () => void
  onGuardar: () => void
  guardarDisabled?: boolean
  guardarLabel?: string
  className?: string
}

function ModalFormulario({
  open,
  onOpenChange,
  title,
  subtitle,
  titleIcon,
  children,
  onCancelar,
  onGuardar,
  guardarDisabled = false,
  guardarLabel = "GUARDAR",
  className,
}: ModalFormularioProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-[calc(100%-2rem)] sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border shadow-lg rounded-2xl ${className ?? ""}`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative flex flex-col w-full max-h-[90vh]">
          <ModalHeader
            title={title}
            subtitle={subtitle}
            titleIcon={titleIcon}
            onClose={onCancelar}
          />

          {/* Cuerpo */}
          {children}

          {/* Footer: Cancelar + Guardar */}
          <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-dark-border bg-[#F6F7F8] dark:bg-dark-elevated/80 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onCancelar}
              title="Cancelar y cerrar"
              aria-label="Cancelar"
              className={cancelButtonClass}
            >
              CANCELAR
            </Button>
            <Button
              onClick={onGuardar}
              disabled={guardarDisabled}
              title={guardarLabel}
              aria-label={guardarLabel}
              className={guardarDisabled ? primaryDisabledClass : primaryEnabledClass}
            >
              {guardarLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────
// Tipo B — ModalAccion (Cancelar + Botón primario con ícono + count)
// ─────────────────────────────────────────────────────────────────

interface ModalAccionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  titleIcon?: React.ReactNode
  children: React.ReactNode
  onCancelar: () => void
  onAccion: () => void
  accionLabel: string
  accionIcon?: React.ReactNode
  accionCount?: number
  accionDisabled?: boolean
  className?: string
}

function ModalAccion({
  open,
  onOpenChange,
  title,
  subtitle,
  titleIcon,
  children,
  onCancelar,
  onAccion,
  accionLabel,
  accionIcon,
  accionCount,
  accionDisabled = false,
  className,
}: ModalAccionProps) {
  const labelConCount =
    accionCount && accionCount > 0
      ? `${accionLabel} (${accionCount})`
      : accionLabel

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-[calc(100%-2rem)] sm:max-w-5xl p-0 gap-0 overflow-hidden bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border shadow-lg rounded-2xl ${className ?? ""}`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col w-full max-h-[85vh]">
          <ModalHeader
            title={title}
            subtitle={subtitle}
            titleIcon={titleIcon}
            onClose={onCancelar}
          />

          {/* Cuerpo */}
          {children}

          {/* Footer: Cancelar + Acción primaria */}
          <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-dark-border bg-[#F6F7F8] dark:bg-dark-elevated/50 flex justify-end gap-3 mt-auto">
            <Button
              variant="outline"
              onClick={onCancelar}
              className={cancelButtonClass}
            >
              CANCELAR
            </Button>
            <Button
              onClick={onAccion}
              disabled={accionDisabled}
              className={accionDisabled ? primaryDisabledClass : primaryEnabledClass}
            >
              {accionIcon}
              {labelConCount}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────
// Tipo C — ModalGestion (Cerrar, o Cerrar + acción secundaria)
// ─────────────────────────────────────────────────────────────────

interface ModalGestionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  titleIcon?: React.ReactNode
  children: React.ReactNode
  onCerrar: () => void
  footerLeft?: React.ReactNode
  accionSecundaria?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

function ModalGestion({
  open,
  onOpenChange,
  title,
  subtitle,
  titleIcon,
  children,
  onCerrar,
  footerLeft,
  accionSecundaria,
  className,
}: ModalGestionProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-[calc(100%-2rem)] sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-dark-card border border-[#E5E7EB] dark:border-dark-border shadow-lg rounded-2xl ${className ?? ""}`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative flex flex-col w-full max-h-[85vh]">
          <ModalHeader
            title={title}
            subtitle={subtitle}
            titleIcon={titleIcon}
            onClose={onCerrar}
          />

          {/* Cuerpo */}
          {children}

          {/* Footer: izquierda opcional + Cerrar (+ acción secundaria) */}
          <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-dark-border bg-[#F6F7F8] dark:bg-dark-elevated/50 flex justify-between items-center">
            {footerLeft ?? <div />}
            <div className="flex gap-3">
              {accionSecundaria && (
                <Button
                  onClick={accionSecundaria.onClick}
                  className={primaryEnabledClass}
                >
                  {accionSecundaria.icon}
                  {accionSecundaria.label}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCerrar}
                className={cancelButtonClass}
              >
                CERRAR
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ModalFormulario, ModalAccion, ModalGestion }
