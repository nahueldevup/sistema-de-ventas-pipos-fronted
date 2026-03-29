export const getCategoriaColor = (categoria: string) => {
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

export const formatearPesos = (monto: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto);
};

// ── Color de fila según index (zebra) ──────────────────────────────────────
export const getRowBg = (index: number) =>
  index % 2 === 0
    ? 'bg-white dark:bg-dark-card'
    : 'bg-slate-100 dark:bg-slate-800/50';
