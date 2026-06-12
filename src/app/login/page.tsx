"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const redirectTo = searchParams.get("redirectTo");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push(redirectTo || result.success);
        router.refresh();
      }
    });
  }

  return (
    <main className="container-loja min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Cabeçalho da página */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-text-primary hover:text-accent transition-colors"
          >
            Projeto Loja
          </Link>
          <h1 className="h2 text-text-primary mt-4">Entrar na sua conta</h1>
          <p className="body text-text-secondary mt-2">
            Acesse seu estoque, carrinhos e reservas.
          </p>
        </div>

        {/* Card do formulário */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Acessar</CardTitle>
            <CardDescription>
              Informe seu email e senha para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Campo: Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  required
                  className="h-touch text-base"
                />
              </div>

              {/* Campo: Senha */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-accent hover:text-accent-hover transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    required
                    className="h-touch text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors touch-target inline-flex items-center justify-center"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mensagem de erro */}
              {error && (
                <div
                  className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  <p>{error}</p>
                </div>
              )}

              {/* Botão */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-touch text-base font-semibold"
                style={{ backgroundColor: "#b26d2a" }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="size-5" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Link para cadastro */}
            <p className="text-center text-sm text-text-secondary mt-5">
              Ainda não tem conta?{" "}
              <Link
                href="/signup"
                className="text-accent hover:text-accent-hover font-medium transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Rodapé informativo */}
        <p className="text-center caption mt-6">
          Projeto Loja — Controle de Estoque
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
