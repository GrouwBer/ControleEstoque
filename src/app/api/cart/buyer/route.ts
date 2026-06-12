import { NextRequest, NextResponse } from "next/server";
import { updateCartBuyer } from "@/lib/services/carts";

export async function PATCH(req: NextRequest) {
  try {
    const { name, phone } = await req.json();

    if (typeof name !== "string" || typeof phone !== "string") {
      return NextResponse.json(
        { error: "name e phone (strings) são obrigatórios." },
        { status: 400 }
      );
    }

    const cart = await updateCartBuyer(name, phone);
    return NextResponse.json(cart);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao atualizar comprador.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
