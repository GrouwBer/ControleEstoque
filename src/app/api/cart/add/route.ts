import { NextRequest, NextResponse } from "next/server";
import { addToCart } from "@/lib/services/carts";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId || typeof productId !== "number") {
      return NextResponse.json(
        { error: "productId (número) é obrigatório." },
        { status: 400 }
      );
    }

    const item = await addToCart(productId);
    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao adicionar ao carrinho.";
    const status =
      message === "Usuário não autenticado." ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
