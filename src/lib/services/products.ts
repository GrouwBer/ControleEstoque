"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductRow, ProductInsert, ProductUpdate } from "@/types/database";

// ── Tipos de filtro ──────────────────────────────────────────────
export interface ProductFilters {
  search?: string;
  category?: string;
  condition?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// ── Helpers ──────────────────────────────────────────────────────

async function getSupabase() {
  return (await createServerSupabaseClient()) as any;
}

/** Gera um SKU automático no formato REL-XXXX */
async function generateSKU(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("products")
    .select("sku")
    .order("id", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return "REL-0001";

  const lastSKU = data[0].sku;
  const match = lastSKU.match(/REL-(\d{4})/);
  if (!match) return "REL-0001";

  const nextNumber = parseInt(match[1], 10) + 1;
  return `REL-${String(nextNumber).padStart(4, "0")}`;
}

// ── CRUD ─────────────────────────────────────────────────────────

export async function getProducts(filters?: ProductFilters) {
  const supabase = await getSupabase();

  let query = supabase.from("products").select("*", { count: "exact" });

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.condition) query = query.eq("condition", filters.condition);
  if (filters?.status) query = query.eq("status", filters.status);

  query = query
    .order("updated_at", { ascending: false })
    .range(
      filters?.offset ?? 0,
      (filters?.offset ?? 0) + (filters?.limit ?? 50) - 1
    );

  const { data, error, count } = await query;

  if (error) throw new Error("Falha ao carregar produtos.");

  return { products: (data ?? []) as ProductRow[], total: count ?? 0 };
}

export async function getProduct(id: number) {
  const supabase = await getSupabase();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) throw new Error("Produto não encontrado.");

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*")
    .eq("product_id", id)
    .order("reserved_at", { ascending: false });

  const { data: sales } = await supabase
    .from("cart_items")
    .select(`id, final_price, list_price_at_time, cart_id, carts!inner(id, finalized_at, buyer_name, buyer_phone, status)`)
    .eq("product_id", id)
    .eq("carts.status", "finalized")
    .order("cart_id", { ascending: false });

  return {
    product: product as ProductRow,
    reservations: (reservations ?? []) as any[],
    sales: (sales ?? []) as any[],
  };
}

export async function createProduct(
  data: Omit<ProductInsert, "user_id" | "sku">
) {
  const supabase = await getSupabase();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Usuário não autenticado.");

  const sku = await generateSKU(supabase);

  const insert = {
    ...data,
    user_id: user.id,
    sku,
    status: data.status ?? "available",
    description: data.description ?? "",
    category: data.category ?? "",
    cost_price: data.cost_price ?? 0,
    list_price: data.list_price ?? 0,
    image_url: data.image_url ?? "",
    notes: data.notes ?? "",
  };

  const { data: created, error } = await supabase
    .from("products")
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error("Falha ao criar produto.");

  return created as ProductRow;
}

export async function updateProduct(id: number, data: ProductUpdate) {
  const supabase = await getSupabase();

  const { data: updated, error } = await supabase
    .from("products")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Falha ao atualizar produto.");

  return updated as ProductRow;
}

export async function deleteProduct(id: number) {
  const supabase = await getSupabase();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !product) throw new Error("Produto não encontrado.");
  if (product.status === "sold") throw new Error("Não é possível excluir um produto que já foi vendido.");

  const { count, error: salesError } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  if (count && count > 0) throw new Error("Não é possível excluir um produto com histórico de vendas.");

  await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("product_id", id)
    .eq("status", "active");

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw new Error("Falha ao excluir produto.");

  return { success: true };
}

export async function searchProducts(query: string) {
  const supabase = await getSupabase();

  if (!query || query.trim().length < 2) return { products: [] };

  const { data, error } = await supabase
    .from("products")
    .select("id, sku, name, image_url, status, list_price")
    .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) return { products: [] };

  return { products: (data ?? []) as Partial<ProductRow>[] };
}

export async function getCategories(): Promise<{ categories: string[] }> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null)
    .order("category");

  if (error || !data) return { categories: [] };

  const categorySet = new Set<string>();
  for (const d of data) {
    if (d.category) categorySet.add(d.category);
  }

  return { categories: Array.from(categorySet) };
}
