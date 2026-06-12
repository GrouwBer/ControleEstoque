"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  X,
  ShoppingCart,
  Search,
  Trash2,
  Loader2,
  PackageOpen,
  User,
  Phone,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ProductRow } from "@/types/database";

// ── Types ──────────────────────────────────────────────────────────

interface SearchResult {
  id: number;
  sku: string;
  name: string;
  image_url: string | null;
  status: string;
  list_price: number;
}

// ── CartDrawer ─────────────────────────────────────────────────────

export function CartDrawer() {
  const { isOpen, closeCart, cartState, loading, refreshCart } = useCart();
  const { showToast } = useToast();
  const { cart, items } = cartState;

  // Buyer fields
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [savingBuyer, setSavingBuyer] = useState(false);
  const buyerInitialized = useRef(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Discount
  const [discountType, setDiscountType] = useState<"none" | "percent" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const discountInitialized = useRef(false);

  // Operations
  const [finalizing, setFinalizing] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // ── Init buyer fields from cart ──────────────────────────────────

  useEffect(() => {
    if (cart && !buyerInitialized.current) {
      setBuyerName(cart.buyer_name ?? "");
      setBuyerPhone(cart.buyer_phone ?? "");
      buyerInitialized.current = true;
    }
    if (!cart) {
      buyerInitialized.current = false;
    }
  }, [cart]);

  // ── Init discount from cart ──────────────────────────────────────

  useEffect(() => {
    if (cart && !discountInitialized.current) {
      setDiscountType(cart.discount_type ?? "none");
      setDiscountValue(cart.discount_value ?? 0);
      discountInitialized.current = true;
    }
    if (!cart) {
      discountInitialized.current = false;
    }
  }, [cart]);

  // ── Lock body scroll when open ───────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ── Click outside search results ─────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Debounced search ─────────────────────────────────────────────

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        // Only show available products
        const available = (data.products ?? []).filter(
          (p: SearchResult) => p.status === "available"
        );
        setSearchResults(available);
        setShowSearchResults(true);
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(searchQuery);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, doSearch]);

  // ── Add to cart ──────────────────────────────────────────────────

  const handleAdd = useCallback(
    async (productId: number, productName: string) => {
      setAddingId(productId);
      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          showToast("Adicionado", `${productName} adicionado ao carrinho.`, "success");
          await refreshCart();
          setSearchQuery("");
          setSearchResults([]);
          setShowSearchResults(false);
        } else {
          const data = await res.json();
          showToast("Erro", data.error ?? "Falha ao adicionar.", "error");
        }
      } catch {
        showToast("Erro", "Falha de conexão.", "error");
      } finally {
        setAddingId(null);
      }
    },
    [refreshCart, showToast]
  );

  // ── Remove from cart ─────────────────────────────────────────────

  const handleRemove = useCallback(
    async (itemId: number, productName: string) => {
      try {
        const res = await fetch("/api/cart/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        });
        if (res.ok) {
          showToast("Removido", `${productName} removido do carrinho.`, "success");
          await refreshCart();
        } else {
          const data = await res.json();
          showToast("Erro", data.error ?? "Falha ao remover.", "error");
        }
      } catch {
        showToast("Erro", "Falha de conexão.", "error");
      }
    },
    [refreshCart, showToast]
  );

  // ── Update buyer (auto-save on blur) ─────────────────────────────

  const handleBuyerBlur = useCallback(async () => {
    if (!cart) return;
    if (buyerName === (cart.buyer_name ?? "") && buyerPhone === (cart.buyer_phone ?? "")) return;
    setSavingBuyer(true);
    try {
      const res = await fetch("/api/cart/buyer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: buyerName, phone: buyerPhone }),
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch {
      // silently fail
    } finally {
      setSavingBuyer(false);
    }
  }, [cart, buyerName, buyerPhone, refreshCart]);

  // ── Update discount ──────────────────────────────────────────────

  const handleDiscountChange = useCallback(
    async (newType?: "none" | "percent" | "fixed", newValue?: number) => {
      const type = newType ?? discountType;
      const value = newValue ?? discountValue;
      if (!cart) return;
      setSavingDiscount(true);
      try {
        const res = await fetch("/api/cart/discount", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, value }),
        });
        if (res.ok) {
          await refreshCart();
        } else {
          const data = await res.json();
          showToast("Erro", data.error ?? "Falha ao aplicar desconto.", "error");
        }
      } catch {
        showToast("Erro", "Falha de conexão.", "error");
      } finally {
        setSavingDiscount(false);
      }
    },
    [cart, discountType, discountValue, refreshCart, showToast]
  );

  // ── Finalize ─────────────────────────────────────────────────────

  const handleFinalize = useCallback(async () => {
    if (!cart || items.length === 0) {
      showToast("Aviso", "Adicione produtos ao carrinho antes de finalizar.", "warning");
      return;
    }
    setFinalizing(true);
    try {
      const res = await fetch("/api/cart/finalize", { method: "POST" });
      if (res.ok) {
        showToast("Venda finalizada!", "A venda foi concluída com sucesso.", "success");
        await refreshCart();
        closeCart();
      } else {
        const data = await res.json();
        showToast("Erro", data.error ?? "Falha ao finalizar.", "error");
      }
    } catch {
      showToast("Erro", "Falha de conexão.", "error");
    } finally {
      setFinalizing(false);
    }
  }, [cart, items.length, refreshCart, closeCart, showToast]);

  // ── Cancel ───────────────────────────────────────────────────────

  const handleCancel = useCallback(async () => {
    if (!cart) return;
    setCanceling(true);
    try {
      const res = await fetch("/api/cart/cancel", { method: "POST" });
      if (res.ok) {
        showToast("Cancelado", "Carrinho cancelado.", "info");
        await refreshCart();
        closeCart();
      } else {
        const data = await res.json();
        showToast("Erro", data.error ?? "Falha ao cancelar.", "error");
      }
    } catch {
      showToast("Erro", "Falha de conexão.", "error");
    } finally {
      setCanceling(false);
    }
  }, [cart, refreshCart, closeCart, showToast]);

  // ── Format currency ──────────────────────────────────────────────

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  // ── Computed totals ──────────────────────────────────────────────

  const subtotal = items.reduce((sum, item) => sum + (item.list_price_at_time ?? 0), 0);
  const hasDiscount = discountType !== "none";
  let discountAmount = 0;
  if (discountType === "percent") {
    discountAmount = subtotal * (discountValue / 100);
  } else if (discountType === "fixed") {
    discountAmount = Math.min(discountValue, subtotal);
  }
  const finalTotal = subtotal - discountAmount;
  const itemCount = items.length;

  // ── Render ───────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-full max-w-[480px]",
          "bg-[#faf7f0] dark:bg-[#1a1a1c]",
          "border-l border-border/60",
          "flex flex-col",
          "shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
          <h2 className="h3 flex items-center gap-2">
            <ShoppingCart className="size-5 text-accent" />
            Carrinho de Vendas
            {itemCount > 0 && (
              <span className="text-sm font-normal text-text-muted ml-1">
                ({itemCount} {itemCount === 1 ? "item" : "itens"})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target"
            aria-label="Fechar carrinho"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── Buyer section ───────────────────────────────────────── */}
        <div className="px-5 py-3 border-b border-border/60 shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-8"
                placeholder="Nome do comprador (opcional)"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                onBlur={handleBuyerBlur}
              />
            </div>
            <div className="flex-1 relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-8"
                placeholder="Telefone (opcional)"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                onBlur={handleBuyerBlur}
              />
            </div>
            {savingBuyer && (
              <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>
        </div>

        {/* ── Quick search ────────────────────────────────────────── */}
        <div className="px-5 py-3 border-b border-border/60 shrink-0" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 pr-8"
              placeholder="Buscar produtos para adicionar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
            />
            {searching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
            )}
            {!searching && searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground touch-target inline-flex items-center justify-center size-6"
                aria-label="Limpar busca"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-5 right-5 mt-1 z-[102] bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAdd(product.id, product.name)}
                  disabled={addingId === product.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors border-b border-border/30 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{product.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{product.sku}</span>
                      <span className="text-xs font-semibold text-accent">
                        {fmt(product.list_price)}
                      </span>
                    </div>
                  </div>
                  {addingId === product.id ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
                  ) : (
                    <span className="text-xs text-accent font-medium shrink-0">Adicionar</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {showSearchResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching && (
            <div className="absolute left-5 right-5 mt-1 z-[102] bg-card border border-border rounded-lg shadow-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Nenhum produto disponível encontrado.</p>
            </div>
          )}
        </div>

        {/* ── Items list ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="size-12 text-muted-foreground/50 mb-3" />
              <p className="text-lg font-medium text-muted-foreground">Carrinho vazio</p>
              <p className="text-sm text-muted-foreground mt-1">
                Busque produtos para adicionar
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60 hover:border-border transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product?.name ?? `Produto #${item.product_id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {item.product?.sku ?? "—"}
                      </span>
                      <span className="text-sm font-semibold text-accent">
                        {fmt(item.list_price_at_time ?? 0)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleRemove(item.id, item.product?.name ?? `Item #${item.id}`)
                    }
                    className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors touch-target shrink-0"
                    aria-label={`Remover ${item.product?.name ?? "item"}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="border-t border-border/60 px-5 py-4 shrink-0 space-y-3">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{fmt(subtotal)}</span>
          </div>

          {/* Discount */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Desconto</span>
              <select
                value={discountType}
                onChange={(e) => {
                  const newType = e.target.value as "none" | "percent" | "fixed";
                  setDiscountType(newType);
                  if (newType === "none") {
                    setDiscountValue(0);
                    handleDiscountChange(newType, 0);
                  }
                }}
                className="text-sm border border-input rounded-md bg-transparent px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="none">Sem desconto</option>
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            {discountType !== "none" && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={discountType === "percent" ? 100 : undefined}
                  step={discountType === "percent" ? 1 : 0.01}
                  placeholder={discountType === "percent" ? "%" : "R$"}
                  value={discountValue || ""}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setDiscountValue(v);
                  }}
                  onBlur={() => handleDiscountChange()}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  = -{fmt(discountAmount)}
                </span>
                {savingDiscount && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Final total */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-base font-semibold">Total</span>
            <span className="text-xl font-bold text-accent">{fmt(finalTotal)}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleFinalize}
              disabled={finalizing || items.length === 0}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all",
                "min-h-[44px]",
                "bg-[#b26d2a] hover:bg-[#925720]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "active:translate-y-px"
              )}
            >
              {finalizing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                "Finalizar Venda"
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={canceling || !cart}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-all",
                "min-h-[44px]",
                "bg-background hover:bg-muted text-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "active:translate-y-px"
              )}
            >
              {canceling ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
