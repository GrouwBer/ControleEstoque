import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="container-loja min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-lg">
        <div className="space-y-2">
          <h1 className="h1 text-text-primary">Projeto Loja</h1>
          <p className="body text-text-secondary">
            Sistema de controle de estoque e ponto de venda para lojas de
            antiguidades e colecionáveis.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-btn bg-accent px-6 py-3 text-white font-medium hover:bg-accent-hover transition-colors touch-target"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-btn border border-gray-300 dark:border-gray-700 px-6 py-3 text-text-primary font-medium hover:bg-card-hover transition-colors touch-target"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </main>
  );
}
