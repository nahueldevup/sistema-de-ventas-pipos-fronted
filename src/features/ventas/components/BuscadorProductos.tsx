import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ScanBarcode, X } from 'lucide-react';
import Fuse from 'fuse.js';
import type { Product } from '@/schemas/product.schema';

interface BuscadorProductosProps {
  productos: Product[];
  onResultados: (resultados: Product[]) => void;
  onAgregarDirecto: (producto: Product) => void;
}

export default function BuscadorProductos({ productos, onResultados, onAgregarDirecto }: BuscadorProductosProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fuse.js para búsqueda fuzzy
  const fuse = useMemo(
    () =>
      new Fuse(productos, {
        keys: [
          { name: 'name', weight: 0.5 },
          { name: 'barcode', weight: 0.35 },
          { name: 'sku', weight: 0.15 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [productos]
  );

  // Focus automático al montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      onResultados(productos);
      return;
    }

    debounceRef.current = setTimeout(() => {
      // Primero intentar match exacto de código de barras
      const matchExacto = productos.find(
        (p) => p.barcode === query.trim() || p.sku === query.trim()
      );

      if (matchExacto) {
        // Si hay match exacto (escáner), agregar directo al carrito
        onAgregarDirecto(matchExacto);
        setQuery('');
        inputRef.current?.focus();
        return;
      }

      // Si no, buscar fuzzy
      const resultados = fuse.search(query.trim()).map((r) => r.item);
      onResultados(resultados.length > 0 ? resultados : []);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, productos, fuse, onResultados, onAgregarDirecto]);

  const limpiar = () => {
    setQuery('');
    onResultados(productos);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') limpiar();
          }}
          placeholder="Escaneá o buscá un producto..."
          className="
            w-full h-12 pl-12 pr-20 rounded-xl
            bg-card border border-border
            text-[15px] font-medium text-foreground
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            outline-none
            focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
            transition-all duration-200
          "
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={limpiar}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Limpiar búsqueda (Escape)"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ScanBarcode className="w-5 h-5 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
    </div>
  );
}
