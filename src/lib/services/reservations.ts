"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ReservationRow, ReservationInsert } from "@/types/database";

// ── Tipos ────────────────────────────────────────────────────────

export interface ReservationFilters {
  status?: "active" | "converted" | "cancelled";
}

export interface CustomerData {
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
}

// ── Helpers ──────────────────────────────────────────────────────

async function getSupabase() {
  return (await createServerSupabaseClient()) as any;
}

// ── Serviço ──────────────────────────────────────────────────────

export async function createReservation(
  productId: number,
  customerData: CustomerData,
  deadline?: string
): Promise<ReservationRow> {
  const supabase = await getSupabase();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Usuário não autenticado.");

  const { data: product, error: prodError } = await supabase
    .from("products")
    .select("status")
    .eq("id", productId)
    .single();

  if (prodError || !product) throw new Error("Produto não encontrado.");
  if (product.status !== "available")
    throw new Error(`Produto não está disponível (status: ${product.status}).`);

  const insert = {
    user_id: user.id,
    product_id: productId,
    customer_name: customerData.customer_name,
    customer_phone: customerData.customer_phone ?? "",
    customer_email: customerData.customer_email ?? "",
    deadline: deadline ?? null,
    status: "active",
  };

  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error("Falha ao criar reserva.");

  await supabase
    .from("products")
    .update({ status: "reserved" })
    .eq("id", productId);

  return reservation as ReservationRow;
}

export async function getReservations(filters?: ReservationFilters) {
  const supabase = await getSupabase();

  let query = supabase
    .from("reservations")
    .select(`*, product:products(id, sku, name, image_url, list_price, status)`)
    .order("reserved_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;

  if (error) throw new Error("Falha ao carregar reservas.");

  return { reservations: (data ?? []) as any[] };
}

export async function convertReservationToSale(
  reservationId: number,
  finalPrice?: number
) {
  const supabase = await getSupabase();

  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .single();

  if (resError || !reservation) throw new Error("Reserva não encontrada.");
  if (reservation.status !== "active") throw new Error("Reserva não está ativa.");

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", reservation.product_id)
    .single();

  if (!product) throw new Error("Produto não encontrado.");

  const { data: { user } } = await supabase.auth.getUser();

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .insert({
      user_id: user!.id,
      buyer_name: reservation.customer_name,
      buyer_phone: reservation.customer_phone,
      discount_type: "none",
      discount_value: 0,
      subtotal: 0,
      discount_amount: 0,
      final_total: 0,
      status: "active",
      notes: `Venda convertida da reserva #${reservationId}`,
      sale_notes: "",
    })
    .select()
    .single();

  if (cartError || !cart) throw new Error("Falha ao criar carrinho para a reserva.");

  const priceToUse = finalPrice ?? product.list_price;

  await supabase.from("cart_items").insert({
    cart_id: cart.id,
    product_id: product.id,
    list_price_at_time: product.list_price,
    final_price: priceToUse,
  });

  await supabase
    .from("carts")
    .update({ subtotal: priceToUse, discount_amount: 0, final_total: priceToUse })
    .eq("id", cart.id);

  await supabase
    .from("carts")
    .update({ status: "finalized", finalized_at: new Date().toISOString() })
    .eq("id", cart.id);

  await supabase
    .from("products")
    .update({ status: "sold" })
    .eq("id", product.id);

  await supabase
    .from("reservations")
    .update({ status: "converted" })
    .eq("id", reservationId);

  return { success: true, cartId: cart.id };
}

export async function cancelReservation(reservationId: number) {
  const supabase = await getSupabase();

  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", reservationId)
    .single();

  if (resError || !reservation) throw new Error("Reserva não encontrada.");
  if (reservation.status !== "active") throw new Error("Reserva não está ativa.");

  await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", reservationId);

  await supabase
    .from("products")
    .update({ status: "available" })
    .eq("id", reservation.product_id);

  return { success: true };
}
