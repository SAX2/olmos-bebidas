"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { ReactNode } from "react";

type CartState = Map<string, number>;

type CartAction =
  | { type: "HYDRATE"; items: CartState }
  | { type: "ADD_ITEM"; id: string; maxQuantity: number }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "DELETE_ITEM"; id: string }
  | { type: "SET_QUANTITY"; id: string; quantity: number; maxQuantity: number }
  | { type: "CLEAR" };

const STORAGE_KEY = "olmos-cart-v2";

function loadCart(): CartState {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as { v: number; items: [string, number][] };
    if (parsed.v !== 2 || !Array.isArray(parsed.items)) return new Map();
    return new Map(parsed.items.filter(([, qty]) => qty > 0));
  } catch {
    return new Map();
  }
}

function saveCart(state: CartState) {
  try {
    const data = { v: 2, items: Array.from(state.entries()) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD_ITEM": {
      const next = new Map(state);
      const current = next.get(action.id) ?? 0;
      if (current < action.maxQuantity) {
        next.set(action.id, current + 1);
      }
      return next;
    }
    case "REMOVE_ITEM": {
      const next = new Map(state);
      const current = next.get(action.id) ?? 0;
      if (current <= 1) {
        next.delete(action.id);
      } else {
        next.set(action.id, current - 1);
      }
      return next;
    }
    case "DELETE_ITEM": {
      const next = new Map(state);
      next.delete(action.id);
      return next;
    }
    case "SET_QUANTITY": {
      const next = new Map(state);
      const clamped = Math.min(Math.max(0, action.quantity), action.maxQuantity);
      if (clamped === 0) {
        next.delete(action.id);
      } else {
        next.set(action.id, clamped);
      }
      return next;
    }
    case "CLEAR":
      return new Map();
  }
}

interface CartContextValue {
  items: CartState;
  addItem: (id: string, maxQuantity: number) => void;
  removeItem: (id: string) => void;
  deleteItem: (id: string) => void;
  setQuantity: (id: string, quantity: number, maxQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  getQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: CartState = new Map();

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, EMPTY_CART);

  useEffect(() => {
    const stored = loadCart();
    if (stored.size > 0) dispatch({ type: "HYDRATE", items: stored });
  }, []);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback(
    (id: string, maxQuantity: number) =>
      dispatch({ type: "ADD_ITEM", id, maxQuantity }),
    [],
  );

  const removeItem = useCallback(
    (id: string) => dispatch({ type: "REMOVE_ITEM", id }),
    [],
  );

  const deleteItem = useCallback(
    (id: string) => dispatch({ type: "DELETE_ITEM", id }),
    [],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number, maxQuantity: number) =>
      dispatch({ type: "SET_QUANTITY", id, quantity, maxQuantity }),
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const totalItems = useMemo(() => {
    let total = 0;
    for (const qty of items.values()) total += qty;
    return total;
  }, [items]);

  const getQuantity = useCallback(
    (id: string) => items.get(id) ?? 0,
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, deleteItem, setQuantity, clearCart, totalItems, getQuantity }),
    [items, addItem, removeItem, deleteItem, setQuantity, clearCart, totalItems, getQuantity],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
