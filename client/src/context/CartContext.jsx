// client/src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react';

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find((i) => i.key === action.item.key);
      if (exists) {
        return state.map((i) => (i.key === action.item.key ? { ...i, qty: i.qty + action.item.qty } : i));
      }
      return [...state, action.item];
    }
    case 'QTY':
      return state.map((i) => (i.key === action.key ? { ...i, qty: Math.max(1, action.qty) } : i));
    case 'REMOVE':
      return state.filter((i) => i.key !== action.key);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

function load() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch (e) { return []; }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(items)); } catch (e) { /* ignore */ }
  }, [items]);

  const addItem = useCallback((item, { openDrawer = true } = {}) => {
    dispatch({ type: 'ADD', item: { ...item, key: `${item.productId}-${item.variantId}` } });
    if (openDrawer) setOpen(true);
  }, []);
  const setQty = useCallback((key, qty) => dispatch({ type: 'QTY', key, qty }), []);
  const removeItem = useCallback((key) => dispatch({ type: 'REMOVE', key }), []);
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);

  const value = useMemo(
    () => ({ items, count, subtotal, open, setOpen, addItem, setQty, removeItem, clear }),
    [items, count, subtotal, open, addItem, setQty, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);