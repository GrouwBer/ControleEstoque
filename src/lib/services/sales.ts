"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CartRow, CartItemRow, ProductRow } from "@/types/database";

// ── Tipos ────────────────────────────────────────────────────────

export interface SalesFilters {
  search?: string; // buyer name
  dateFrom?: string;
  dateTo?: string;
}

export interface SaleWithItems {
  cart: CartRow;
  items: (CartItemRow & { product: ProductRow })[];
}

// ── Helpers ──────────────────────────────────────────────────────

async function getSupabase() {
  return (await createServerSupabaseClient()) as any;
}

// ── Serviço ──────────────────────────────────────────────────────

export async function getSales(filters?: SalesFilters) {
  const supabase = await getSupabase();

  let query = supabase
    .from("carts")
    .select(`*, cart_items(count)`)
    .eq("status", "finalized")
    .order("finalized_at", { ascending: false });

  if (filters?.search) {
    query = query.ilike("buyer_name", `%${filters.search}%`);
  }
  if (filters?.dateFrom) {
    query = query.gte("finalized_at", filters.dateFrom);
  }
  if (filters?.dateTo) {
    // Add 1 day to include the end date fully
    const endDate = new Date(filters.dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("finalized_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw new Error("Falha ao carregar vendas.");

  return {
    sales: (data ?? []) as (CartRow & { cart_items: { count: number }[] })[],
  };
}

export async function getSaleById(id: number): Promise<SaleWithItems> {
  const supabase = await getSupabase();

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("id", id)
    .eq("status", "finalized")
    .single();

  if (cartError || !cart) throw new Error("Venda não encontrada.");

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(`*, product:products(*)`)
    .eq("cart_id", id);

  if (itemsError) throw new Error("Falha ao carregar itens da venda.");

  return {
    cart: cart as CartRow,
    items: (items ?? []) as (CartItemRow & { product: ProductRow })[],
  };
}

export async function cancelSale(saleId: number) {
  const supabase = await getSupabase();

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("id", saleId)
    .eq("status", "finalized")
    .single();

  if (cartError || !cart) throw new Error("Venda não encontrada.");

  // Check if sale is recent (within 24 hours)
  const finalizedAt = new Date(cart.finalized_at);
  const now = new Date();
  const hoursSinceFinalized =
    (now.getTime() - finalizedAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceFinalized > 24) {
    throw new Error(
      "Só é possível cancelar vendas finalizadas nas últimas 24 horas."
    );
  }

  // Get items to restore product status
  const { data: items } = await supabase
    .from("cart_items")
    .select("product_id")
    .eq("cart_id", saleId);

  // Restore product statuses to available
  if (items && items.length > 0) {
    const productIds = items.map((i: any) => i.product_id);
    await supabase
      .from("products")
      .update({ status: "available" })
      .in("id", productIds);
  }

  // Cancel the cart
  const { error: cancelError } = await supabase
    .from("carts")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", saleId);

  if (cancelError) throw new Error("Falha ao cancelar venda.");

  return { success: true };
}

export async function getDashboardStats() {
  const supabase = await getSupabase();

  // Products available count
  const { count: availableCount, error: availError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "available");

  if (availError) throw new Error("Falha ao carregar estatísticas.");

  // Reserved count
  const { count: reservedCount, error: resError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("status", "reserved");

  if (resError) throw new Error("Falha ao carregar estatísticas.");

  // Current month date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Sales this month count
  const { count: monthlySalesCount, error: countError } = await supabase
    .from("carts")
    .select("*", { count: "exact", head: true })
    .eq("status", "finalized")
    .gte("finalized_at", startOfMonth.toISOString());

  if (countError) throw new Error("Falha ao carregar estatísticas.");

  // Previous month sales count (for trend)
  const { count: prevMonthSalesCount } = await supabase
    .from("carts")
    .select("*", { count: "exact", head: true })
    .eq("status", "finalized")
    .gte("finalized_at", lastMonthStart.toISOString())
    .lt("finalized_at", startOfMonth.toISOString());

  // Revenue this month
  const { data: monthlyCarts, error: revError } = await supabase
    .from("carts")
    .select("final_total")
    .eq("status", "finalized")
    .gte("finalized_at", startOfMonth.toISOString());

  if (revError) throw new Error("Falha ao carregar estatísticas.");

  const monthlyRevenue =
    monthlyCarts?.reduce((sum: number, c: any) => sum + (c.final_total || 0), 0) ?? 0;

  // Previous month revenue
  const { data: prevMonthCarts } = await supabase
    .from("carts")
    .select("final_total")
    .eq("status", "finalized")
    .gte("finalized_at", lastMonthStart.toISOString())
    .lt("finalized_at", startOfMonth.toISOString());

  const prevMonthRevenue =
    prevMonthCarts?.reduce((sum: number, c: any) => sum + (c.final_total || 0), 0) ?? 0;

  // Last 30 days daily revenue for chart
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const { data: dailySales } = await supabase
    .from("carts")
    .select("finalized_at, final_total")
    .eq("status", "finalized")
    .gte("finalized_at", thirtyDaysAgo.toISOString())
    .order("finalized_at", { ascending: true });

  // Aggregate by day
  const dailyMap = new Map<string, number>();
  // Initialize all 30 days with 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, 0);
  }

  if (dailySales) {
    for (const sale of dailySales) {
      if (sale.finalized_at) {
        const key = sale.finalized_at.split("T")[0];
        dailyMap.set(key, (dailyMap.get(key) || 0) + (sale.final_total || 0));
      }
    }
  }

  const chartData = Array.from(dailyMap.entries()).map(([date, value]) => ({
    date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
      new Date(date + "T00:00:00")
    ),
    receita: value,
  }));

  // Activity feed — last 20 events combined
  const { data: recentSales } = await supabase
    .from("carts")
    .select("id, buyer_name, final_total, finalized_at")
    .eq("status", "finalized")
    .order("finalized_at", { ascending: false })
    .limit(15);

  const { data: recentReservations } = await supabase
    .from("reservations")
    .select("id, customer_name, product_id, status, reserved_at, product:products(name)")
    .order("reserved_at", { ascending: false })
    .limit(15);

  const { data: recentProducts } = await supabase
    .from("products")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  // Combine and sort all events
  interface ActivityEvent {
    type: "sale" | "reservation" | "new_product";
    date: string;
    label: string;
    description?: string;
    id: number;
  }

  const events: ActivityEvent[] = [];

  for (const s of recentSales ?? []) {
    events.push({
      type: "sale",
      date: s.finalized_at,
      label: `Venda #${s.id}`,
      description: s.buyer_name
        ? `${s.buyer_name} — ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(s.final_total ?? 0)}`
        : `Anônimo — ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(s.final_total ?? 0)}`,
      id: s.id,
    });
  }

  for (const r of recentReservations ?? []) {
    const productName = (r as any).product?.name ?? `Produto #${r.product_id}`;
    events.push({
      type: "reservation",
      date: r.reserved_at,
      label: r.status === "active" ? "Nova Reserva" : r.status === "converted" ? "Reserva Convertida" : "Reserva Cancelada",
      description: `${r.customer_name} reservou ${productName}`,
      id: r.id,
    });
  }

  for (const p of recentProducts ?? []) {
    events.push({
      type: "new_product",
      date: p.created_at,
      label: "Novo Produto",
      description: p.name,
      id: p.id,
    });
  }

  // Sort by date descending, take top 15
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const activityFeed = events.slice(0, 15);

  // Trend calculation helpers
  const salesTrend =
    prevMonthSalesCount && prevMonthSalesCount > 0
      ? (((monthlySalesCount ?? 0) - prevMonthSalesCount) / prevMonthSalesCount) * 100
      : null;

  const revenueTrend =
    prevMonthRevenue > 0
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : null;

  return {
    availableCount: availableCount ?? 0,
    reservedCount: reservedCount ?? 0,
    monthlySalesCount: monthlySalesCount ?? 0,
    monthlyRevenue,
    chartData,
    activityFeed,
    salesTrend,
    revenueTrend,
  };
}
