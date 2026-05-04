import type { RowData } from '@tanstack/react-table';

/**
 * Module augmentation para extender el tipo `ColumnMeta` de TanStack Table.
 * Permite definir clases CSS personalizadas por columna sin recurrir a `as any`.
 *
 * Uso en columnHelper:
 *   meta: { className: 'py-3 px-2', headerClassName: 'py-4 px-2 text-center' }
 */
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Clase CSS aplicada al `<td>` de cada celda de la columna */
    className?: string;
    /** Clase CSS aplicada al `<th>` del header de la columna */
    headerClassName?: string;
  }
}
