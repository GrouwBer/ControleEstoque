import { NextRequest, NextResponse } from "next/server";
import { updateCartDiscount } from "@/lib/services/carts";

export async function PATCH(req: NextRequest) {
  try {
    const { type, value } = await req.json();

    if (
      !["none", "percent", "fixed"].includes(type) ||
      typeof value !== "number"
    ) {
      return NextResponse.json(
        { error: "type ('none' | 'percent' | 'fixed') e value (número) são obrigatórios." },
        { status: 400 }
      );
    }

    const cart = await updateCartDiscount(type as "none" | "percent" | "fixed", value);
    return NextResponse.json(cart);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao aplicar desconto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
