import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Manipula callbacks de autenticação do Supabase:
 * - OAuth (Google, GitHub, etc.) via parâmetro ?code=
 * - Redefinição de senha via parâmetro ?code= (após usuário clicar no link)
 *
 * O Supabase redireciona para esta rota com um código que trocamos
 * por uma sessão válida.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Falha na autenticação. Tente novamente.")}`
      );
    }

    // Sucesso — redireciona para a página solicitada
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Sem código — redireciona para login
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link de autenticação inválido.")}`
  );
}
