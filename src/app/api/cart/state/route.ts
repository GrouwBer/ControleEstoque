import { NextResponse } from "next/server";
import { getCartState } from "@/lib/services/carts";

export async function GET() {
  try {
    const state = await getCartState();
    return NextResponse.json(state);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao buscar carrinho.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
