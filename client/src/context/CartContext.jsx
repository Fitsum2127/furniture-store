import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { api } from '../lib/api.js';

const CartContext = createContext(null);
const keyOf = (i) => `${i.productId}-${i.variantId || 0}`;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const found = state.find((i) => i.key === action.item.key);
      if (found) {
        const cap = found.maxQty || 100;
        return state.map((i) => (i.key === found.key ? { ...i, qty: Math.min(cap, i.qty + action.item.qty) } : i));
      }
      return [...state, action.item];
    }
    case 'QTY':
      return state.map((i) => (i.key === action.key ? { ...i, qty: Math.max(1, Math.min(action.qty, i.maxQty || 100)) } : i));
    case 'REMOVE':
      return state.filter((i) => i.key !== action.key);
    case 'CLEAR':
      return [];
    case 'SYNC':
      return state.map((i) => {
        const r = action.results.find((x) => x.productId === i.productId && (x.variantId || 0) === (i.variantId || 0));
        if (!r) return i;
        if (r.price === undefined) return { ...i, issue: r.issue, maxQty: 0 };
        return {
          ...i,
          price: r.price,
          name: r.name || i.name,
          variantName: r.variantName === undefined ? i.variantName : r.variantName,
          image: r.image || i.image,
          issue: r.issue || null,
          maxQty: r.maxQty,
          qty: r.ok ? Math.max(1, Math.min(i.qty, r.maxQty)) : i.qty,
        };
      });
    default:
      return state;
  }
}

function load() {
  try {
    const list = JSON.parse(localStorage.getItem('cart') || '[]');
    return Array.isArray(list) ? list.map((i) => ({ ...i, variantId: i.variantId || 0, key: keyOf(i), issue: null })) : [];
  } catch (e) {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);
  const [open, setOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const ref = useRef(items);
  ref.current = items;

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (e) {
      /* ignore */
    }
  }, [items]);

  // Asks the server for the real price and stock of every line.
  const validate = useCallback(async () => {
    const list = ref.current;
    if (!list.length) return true;
    setValidating(true);
    try {
      const res = await api('/cart/validate', {
        method: 'POST',
        body: JSON.stringify({ items: list.map((i) => ({ productId: i.productId, variantId: i.variantId || 0 })) }),
      });
      dispatch({ type: 'SYNC', results: res.items });
      return res.items.every((r) => r.ok);
    } catch (e) {
      return false;
    } finally {
      setValidating(false);
    }
  }, []);

  const sig = items.map((i) => i.key).join('|');
  useEffect(() => {
    const id = setTimeout(validate, 300);
    return () => clearTimeout(id);
  }, [sig, validate]);
  useEffect(() => {
    if (open) validate();
  }, [open, validate]);

  const addItem = useCallback((item, { openDrawer = true } = {}) => {
    const variantId = item.variantId || 0;
    dispatch({ type: 'ADD', item: { ...item, variantId, key: keyOf({ productId: item.productId, variantId }), qty: Math.max(1, item.qty || 1), issue: null } });
    if (openDrawer) setOpen(true);
  }, []);
  const setQty = useCallback((key, qty) => dispatch({ type: 'QTY', key, qty }), []);
  const removeItem = useCallback((key) => dispatch({ type: 'REMOVE', key }), []);
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const hasIssues = items.some((i) => i.issue);

  const value = useMemo(
    () => ({ items, count, subtotal, hasIssues, open, setOpen, addItem, setQty, removeItem, clear, validate, validating }),
    [items, count, subtotal, hasIssues, open, addItem, setQty, removeItem, clear, validate, validating]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);