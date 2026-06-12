"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthResult = {
  error: string | null;
  success: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Traduz mensagens de erro comuns do Supabase para português. */
function translateError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid login"))
    return "Email ou senha inválidos.";
  if (lower.includes("email not confirmed"))
    return "Email ainda não confirmado. Verifique sua caixa de entrada.";
  if (lower.includes("user already registered") || lower.includes("already registered") || lower.includes("already exists"))
    return "Já existe uma conta com este email.";
  if (lower.includes("password") && lower.includes("weak"))
    return "A senha é muito fraca. Use pelo menos 6 caracteres.";
  if (lower.includes("rate limit") || lower.includes("too many requests"))
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  if (lower.includes("email"))
    return "Email inválido. Verifique e tente novamente.";

  return message;
}

/** Obtém a origem da requisição para montar URLs absolutas. */
function getOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Ação de login.
 * Recebe FormData com "email" e "password".
 * Retorna { error: string | null, success: string | null }.
 */
export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios.", success: null };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: translateError(error.message), success: null };
  }

  revalidatePath("/", "layout");
  return { error: null, success: "/dashboard" };
}

/**
 * Ação de cadastro.
 * Recebe FormData com "email", "password" e "confirmPassword".
 */
export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios.", success: null };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres.", success: null };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não conferem.", success: null };
  }

  const origin = getOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { error: translateError(error.message), success: null };
  }

  return {
    error: null,
    success: "/signup/check-email",
  };
}

/**
 * Ação de logout.
 */
export async function logout(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: "Erro ao sair. Tente novamente.", success: null };
  }

  revalidatePath("/", "layout");
  return { error: null, success: "/" };
}

/**
 * Ação de recuperação de senha.
 */
export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();

  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Informe seu email para continuar.", success: null };
  }

  const origin = getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/dashboard`,
  });

  if (error) {
    return { error: translateError(error.message), success: null };
  }

  return {
    error: null,
    success: "/forgot-password/check-email",
  };
}
