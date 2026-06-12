import { NextRequest, NextResponse } from "next/server";
import { removeFromCart } from "@/lib/services/carts";

export async function DELETE(req: NextRequest) {
  try {
    const { itemId } = await req.json();

    if (!itemId || typeof itemId !== "number") {
      return NextResponse.json(
        { error: "itemId (número) é obrigatório." },
        { status: 400 }
      );
    }

    const result = await removeFromCart(itemId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao remover do carrinho.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
