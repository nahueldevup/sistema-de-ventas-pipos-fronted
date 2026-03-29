// Importamos getCategoriaColor desde el archivo central de tema.
// Ya no la duplicamos acá.
export { getCategoriaColor } from "@/theme";

// Formatea un número como precio en pesos argentinos.
// Ej: 1200 → "$1.200,00"
export function formatearPesos(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(monto);
}

// Color de fondo alternado para filas de tabla (efecto zebra).
// Ej: fila 0 → blanco, fila 1 → gris suave, fila 2 → blanco...
export function getRowBg(index: number): string {
  return index % 2 === 0
    ? "bg-white dark:bg-dark-card"
    : "bg-slate-100 dark:bg-slate-800/50";
}