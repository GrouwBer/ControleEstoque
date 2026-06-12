import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/services/products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";

  try {
    const result = await searchProducts(query);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro na busca de produtos.";
    return NextResponse.json({ error: message, products: [] }, { status: 500 });
  }
}
