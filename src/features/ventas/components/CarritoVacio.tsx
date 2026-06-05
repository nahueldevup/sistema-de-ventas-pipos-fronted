import { ShoppingCart } from 'lucide-react';

export default function CarritoVacio() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 px-6">
      <div className="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
        <ShoppingCart className="w-10 h-10 text-brand-400 dark:text-brand-500" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-300">
          Carrito vacío
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Escaneá o buscá un producto para empezar
        </p>
      </div>
    </div>
  );
}
