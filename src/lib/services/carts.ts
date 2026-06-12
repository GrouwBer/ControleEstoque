"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CartRow, CartItemRow, ProductRow } from "@/types/database";

// ── Tipos ────────────────────────────────────────────────────────

export interface CartState {
  cart: CartRow | null;
  items: (CartItemRow & { product: ProductRow })[];
}

// ── Helpers ──────────────────────────────────────────────────────

/** Obtém o cliente Supabase com tipo any para evitar problemas de tipo em server actions */
async function getSupabase() {
  return (await createServerSupabaseClient()) as any;
}

/** Recalcula totais do carrinho baseado nos items atuais */
async function recalculateCartTotals(supabase: any, cartId: number) {
  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(`*, product:products(*)`)
    .eq("cart_id", cartId);

  if (itemsError) {
    console.error("Erro ao buscar items:", itemsError);
    return;
  }

  const subtotal =
    items?.reduce(
      (sum: number, item: any) => sum + (item.list_price_at_time ?? 0),
      0
    ) ?? 0;

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("discount_type, discount_value")
    .eq("id", cartId)
    .single();

  if (cartError || !cart) return;

  let discountAmount = 0;
  if (cart.discount_type === "percent") {
    discountAmount = subtotal * (cart.discount_value / 100);
  } else if (cart.discount_type === "fixed") {
    discountAmount = Math.min(cart.discount_value, subtotal);
  }

  const finalTotal = subtotal - discountAmount;

  await supabase
    .from("carts")
    .update({ subtotal, discount_amount: discountAmount, final_total: finalTotal })
    .eq("id", cartId);
}

// ── Serviço ──────────────────────────────────────────────────────

export async function getActiveCart(): Promise<CartRow> {
  const supabase = await getSupabase();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Usuário não autenticado.");

  const { data: existing, error: fetchError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchError) throw new Error("Falha ao buscar carrinho.");

  if (existing && existing.length > 0) return existing[0] as CartRow;

  const { data: created, error: createError } = await supabase
    .from("carts")
    .insert({
      user_id: user.id,
      status: "active",
      buyer_name: "",
      buyer_phone: "",
      discount_type: "none",
      discount_value: 0,
      subtotal: 0,
      discount_amount: 0,
      final_total: 0,
      notes: "",
      sale_notes: "",
    })
    .select()
    .single();

  if (createError || !created) throw new Error("Falha ao criar carrinho.");

  return created as CartRow;
}

export async function addToCart(productId: number) {
  const supabase = await getSupabase();
  const cart = await getActiveCart();

  const { data: product, error: prodError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (prodError || !product) throw new Error("Produto não encontrado.");
  if (product.status !== "available") throw new Error("Produto não está disponível.");

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id")
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (existing && existing.length > 0) throw new Error("Produto já está no carrinho.");

  const { data: item, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cart.id,
      product_id: productId,
      list_price_at_time: product.list_price,
      final_price: product.list_price,
    })
    .select()
    .single();

  if (error) throw new Error("Falha ao adicionar produto ao carrinho.");

  await recalculateCartTotals(supabase, cart.id);
  return item as CartItemRow;
}

export async function removeFromCart(itemId: number) {
  const supabase = await getSupabase();

  const { data: item, error: fetchError } = await supabase
    .from("cart_items")
    .select("cart_id")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) throw new Error("Item não encontrado.");

  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw new Error("Falha ao remover item do carrinho.");

  await recalculateCartTotals(supabase, item.cart_id);
  return { success: true };
}

export async function updateCartBuyer(name: string, phone: string) {
  const supabase = await getSupabase();
  const cart = await getActiveCart();

  const { data, error } = await supabase
    .from("carts")
    .update({ buyer_name: name, buyer_phone: phone })
    .eq("id", cart.id)
    .select()
    .single();

  if (error) throw new Error("Falha ao atualizar dados do comprador.");
  return data as CartRow;
}

export async function updateCartDiscount(type: "none" | "percent" | "fixed", value: number) {
  const supabase = await getSupabase();
  const cart = await getActiveCart();

  if (type === "percent" && (value < 0 || value > 100))
    throw new Error("Percentual de desconto deve estar entre 0 e 100.");
  if (type === "fixed" && value < 0)
    throw new Error("Valor de desconto não pode ser negativo.");

  const { error } = await supabase
    .from("carts")
    .update({ discount_type: type, discount_value: value })
    .eq("id", cart.id);

  if (error) throw new Error("Falha ao aplicar desconto.");

  await recalculateCartTotals(supabase, cart.id);

  const { data: updated } = await supabase
    .from("carts")
    .select("*")
    .eq("id", cart.id)
    .single();

  return updated as CartRow;
}

export async function getCartState(): Promise<CartState> {
  const supabase = await getSupabase();
  try {
    const cart = await getActiveCart();
    return getCartById(supabase, cart.id);
  } catch {
    return { cart: null, items: [] };
  }
}

async function getCartById(supabase: any, cartId: number): Promise<CartState> {
  const { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("id", cartId)
    .single();

  const { data: items } = await supabase
    .from("cart_items")
    .select(`*, product:products(*)`)
    .eq("cart_id", cartId);

  return { cart: cart as CartRow | null, items: (items ?? []) as any[] };
}

export async function finalizeCart() {
  const supabase = await getSupabase();
  const cart = await getActiveCart();

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cart.id);

  if (itemsError) throw new Error("Erro ao buscar itens do carrinho.");
  if (!items || items.length === 0) throw new Error("Carrinho vazio.");

  await recalculateCartTotals(supabase, cart.id);

  const productIds = items.map((i: any) => i.product_id);
  const { error: updateError } = await supabase
    .from("products")
    .update({ status: "sold" })
    .in("id", productIds);

  if (updateError) throw new Error("Falha ao finalizar venda.");

  const { error: finalizeError } = await supabase
    .from("carts")
    .update({ status: "finalized", finalized_at: new Date().toISOString() })
    .eq("id", cart.id);

  if (finalizeError) throw new Error("Falha ao finalizar carrinho.");

  await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .in("product_id", productIds)
    .eq("status", "active");

  return { success: true, cartId: cart.id };
}

export async function cancelCart() {
  const supabase = await getSupabase();
  const cart = await getActiveCart();

  const { data: items } = await supabase
    .from("cart_items")
    .select("product_id")
    .eq("cart_id", cart.id);

  if (items && items.length > 0) {
    const productIds = items.map((i: any) => i.product_id);
    await supabase
      .from("products")
      .update({ status: "available" })
      .in("id", productIds)
      .eq("status", "available");
  }

  const { error } = await supabase
    .from("carts")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", cart.id);

  if (error) throw new Error("Falha ao cancelar carrinho.");
  return { success: true };
}
