import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /auth/confirm
 *
 * Manipula a confirmação de email.
 * Quando o usuário clica no link enviado por email (signUp com emailRedirectTo),
 * o Supabase inclui ?token_hash=...&type=signup na URL.
 *
 * Esta rota verifica o token e redireciona o usuário.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (error) {
      console.error("Email confirmation error:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Falha ao confirmar email. O link pode ter expirado.")}`
      );
    }

    // Email confirmado com sucesso — redireciona
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Parâmetros ausentes
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link de confirmação inválido.")}`
  );
}
