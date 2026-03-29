import { useState, useCallback } from 'react';

interface ConId {
  id: string;
}

export default function useSeleccionProductos<T extends ConId>(productosFiltrados: T[]) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const seleccionarTodos = useCallback((checked: boolean) => {
    if (checked) {
      setSeleccionados(productosFiltrados.map(p => p.id));
    } else {
      setSeleccionados([]);
    }
  }, [productosFiltrados]);

  const toggleSeleccion = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSeleccionados(prev => [...prev, id]);
    } else {
      setSeleccionados(prev => prev.filter(pid => pid !== id));
    }
  }, []);

  const limpiarSeleccion = useCallback(() => {
    setSeleccionados([]);
  }, []);

  return {
    seleccionados,
    seleccionarTodos,
    toggleSeleccion,
    limpiarSeleccion,
  };
}
