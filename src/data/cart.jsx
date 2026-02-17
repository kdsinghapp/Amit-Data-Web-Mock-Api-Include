import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "data_platform_cart_v1";

function safeParse(jsonStr) {
  try { return JSON.parse(jsonStr); } catch { return null; }
}

function loadInitial() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw || "");
  return Array.isArray(parsed) ? parsed : [];
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
    }
  }, [items]);

  const api = useMemo(() => {
    function add(item) {
      setItems((prev) => {
        const existing = prev.find((x) => x.id === item.id);
        if (existing) return prev;
        return [...prev, { ...item, qty: 1 }];
      });
    }
    function remove(id) {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }
    function clear() {
      setItems([]);
    }
    function setQty(id, qty) {
      const q = Number(qty);
      if (!Number.isFinite(q) || q < 1) return;
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, qty: Math.floor(q) } : x)));
    }
    function upsert(item) {
      setItems((prev) => {
        const existing = prev.find((x) => x.id === item.id);
        if (existing) {
          return prev.map((x) => (x.id === item.id ? { ...x, qty: (x.qty || 1) + (item.qty || 1) } : x));
        }
        return [...prev, { ...item, qty: item.qty || 1 }];
      });
    }

    const count = items.reduce((a, b) => a + (b.qty || 1), 0);
    const subtotal = items.reduce((a, b) => a + (Number(b.priceMonthly || 0) * (b.qty || 1)), 0);

    return { items, add, remove, clear, setQty, upsert, count, subtotal };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
