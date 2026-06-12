import { NextResponse } from "next/server";
import { finalizeCart } from "@/lib/services/carts";

export async function POST() {
  try {
    const result = await finalizeCart();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao finalizar venda.";
    const status =
      message === "Usuário não autenticado." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
