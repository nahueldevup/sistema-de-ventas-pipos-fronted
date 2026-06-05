import { useReducer, useMemo, useCallback } from 'react';
import type { Product } from '@/schemas/product.schema';

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────
export interface CarritoItem {
  productId: string;
  productName: string;
  productBarcode: string | null;
  productImage: string | null;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discountAmount: number;
  maxStock: number; // Para validación visual
}

interface CarritoState {
  items: CarritoItem[];
  descuentoGlobal: number;
  nota: string;
}

// ─────────────────────────────────────────
// ACCIONES
// ─────────────────────────────────────────
type CarritoAction =
  | { type: 'AGREGAR_PRODUCTO'; payload: Product }
  | { type: 'QUITAR_PRODUCTO'; payload: string }
  | { type: 'ACTUALIZAR_CANTIDAD'; payload: { productId: string; cantidad: number } }
  | { type: 'SET_DESCUENTO_GLOBAL'; payload: number }
  | { type: 'SET_NOTA'; payload: string }
  | { type: 'VACIAR_CARRITO' };

// ─────────────────────────────────────────
// ESTADO INICIAL
// ─────────────────────────────────────────
const estadoInicial: CarritoState = {
  items: [],
  descuentoGlobal: 0,
  nota: '',
};

// ─────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────
function carritoReducer(state: CarritoState, action: CarritoAction): CarritoState {
  switch (action.type) {
    case 'AGREGAR_PRODUCTO': {
      const producto = action.payload;
      const existente = state.items.find((item) => item.productId === producto.id);

      if (existente) {
        // Incrementar cantidad si ya está en el carrito
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === producto.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      // Agregar nuevo item
      const nuevoItem: CarritoItem = {
        productId: producto.id!,
        productName: producto.name,
        productBarcode: producto.barcode || null,
        productImage: producto.image || null,
        unitPrice: producto.salePrice,
        costPrice: producto.costPrice,
        quantity: 1,
        discountAmount: 0,
        maxStock: producto.stock,
      };

      return { ...state, items: [...state.items, nuevoItem] };
    }

    case 'QUITAR_PRODUCTO':
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.payload),
      };

    case 'ACTUALIZAR_CANTIDAD': {
      const { productId, cantidad } = action.payload;
      if (cantidad <= 0) {
        // Si la cantidad llega a 0 o menos, eliminar el item
        return {
          ...state,
          items: state.items.filter((item) => item.productId !== productId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: cantidad }
            : item
        ),
      };
    }

    case 'SET_DESCUENTO_GLOBAL':
      return { ...state, descuentoGlobal: Math.max(0, action.payload) };

    case 'SET_NOTA':
      return { ...state, nota: action.payload };

    case 'VACIAR_CARRITO':
      return estadoInicial;

    default:
      return state;
  }
}

// ─────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────
export function useCarrito() {
  const [state, dispatch] = useReducer(carritoReducer, estadoInicial);

  // Valores calculados
  const subtotal = useMemo(
    () => state.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity - item.discountAmount), 0),
    [state.items]
  );

  const totalDescuentos = useMemo(
    () => state.items.reduce((acc, item) => acc + item.discountAmount, 0) + state.descuentoGlobal,
    [state.items, state.descuentoGlobal]
  );

  const total = useMemo(
    () => Math.max(0, subtotal - state.descuentoGlobal),
    [subtotal, state.descuentoGlobal]
  );

  const cantidadItems = useMemo(
    () => state.items.reduce((acc, item) => acc + item.quantity, 0),
    [state.items]
  );

  // Acciones memorizadas
  const agregarProducto = useCallback(
    (producto: Product) => dispatch({ type: 'AGREGAR_PRODUCTO', payload: producto }),
    []
  );

  const quitarProducto = useCallback(
    (productId: string) => dispatch({ type: 'QUITAR_PRODUCTO', payload: productId }),
    []
  );

  const actualizarCantidad = useCallback(
    (productId: string, cantidad: number) =>
      dispatch({ type: 'ACTUALIZAR_CANTIDAD', payload: { productId, cantidad } }),
    []
  );

  const setDescuentoGlobal = useCallback(
    (descuento: number) => dispatch({ type: 'SET_DESCUENTO_GLOBAL', payload: descuento }),
    []
  );

  const setNota = useCallback(
    (nota: string) => dispatch({ type: 'SET_NOTA', payload: nota }),
    []
  );

  const vaciarCarrito = useCallback(() => dispatch({ type: 'VACIAR_CARRITO' }), []);

  return {
    // Estado
    items: state.items,
    descuentoGlobal: state.descuentoGlobal,
    nota: state.nota,

    // Calculados
    subtotal,
    totalDescuentos,
    total,
    cantidadItems,

    // Acciones
    agregarProducto,
    quitarProducto,
    actualizarCantidad,
    setDescuentoGlobal,
    setNota,
    vaciarCarrito,
  };
}
