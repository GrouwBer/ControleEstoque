"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CartRow, CartItemRow, ProductRow } from "@/types/database";

// ── Types ──────────────────────────────────────────────────────────

export interface CartState {
  cart: CartRow | null;
  items: (CartItemRow & { product: ProductRow })[];
}

interface CartContextValue {
  /** Whether the cart drawer is open */
  isOpen: boolean;
  /** Open the cart drawer */
  openCart: () => void;
  /** Close the cart drawer */
  closeCart: () => void;
  /** Toggle the cart drawer */
  toggleCart: () => void;
  /** Current cart state (cart + items) */
  cartState: CartState;
  /** Whether cart data is loading */
  loading: boolean;
  /** Refresh cart data from the server */
  refreshCart: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartState, setCartState] = useState<CartState>({
    cart: null,
    items: [],
  });
  const [loading, setLoading] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart/state");
      if (res.ok) {
        const data = await res.json();
        setCartState(data);
      }
    } catch (err) {
      console.error("Erro ao atualizar carrinho:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh when drawer opens
  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen, refreshCart]);

  return (
    <CartContext.Provider
      value={{ isOpen, openCart, closeCart, toggleCart, cartState, loading, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
