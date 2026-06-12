"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-actions";
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
import { Mail, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resetPassword(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSent(true);
      }
    });
  }

  return (
    <main className="container-loja min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-text-primary hover:text-accent transition-colors"
          >
            Projeto Loja
          </Link>
          <h1 className="h2 text-text-primary mt-4">Recuperar senha</h1>
          <p className="body text-text-secondary mt-2">
            {sent
              ? "Enviamos um link para seu email."
              : "Informe seu email para receber um link de redefinição."}
          </p>
        </div>

        {sent ? (
          /* Tela de sucesso — email enviado */
          <Card className="shadow-card">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-color-available/10 flex items-center justify-center">
                  <Mail className="size-7 text-color-available" />
                </div>
                <div>
                  <p className="body text-text-primary font-medium">
                    Verifique sua caixa de entrada
                  </p>
                  <p className="text-sm text-text-secondary mt-2">
                    Se o email informado estiver cadastrado, você receberá um link
                    para redefinir sua senha. O link expira em 1 hora.
                  </p>
                  <p className="text-sm text-text-secondary mt-2">
                    Não recebeu? Verifique a pasta de spam.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors mt-4"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para o login
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Formulário de recuperação */
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Esqueceu sua senha?</CardTitle>
              <CardDescription>
                Digite o email da sua conta e enviaremos um link seguro.
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="size-5" />
                      Enviar link de recuperação
                    </>
                  )}
                </Button>
              </form>

              {/* Link para login */}
              <p className="text-center text-sm text-text-secondary mt-5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-accent hover:text-accent-hover font-medium transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para o login
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center caption mt-6">
          Projeto Loja — Controle de Estoque
        </p>
      </div>
    </main>
  );
}
