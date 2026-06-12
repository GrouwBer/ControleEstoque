"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/auth-actions";
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
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from "lucide-react";

/** Regras de validação visual da senha. */
const passwordRules = [
  { test: (p: string) => p.length >= 6, label: "Pelo menos 6 caracteres" },
  {
    test: (p: string) => /[A-Z]/.test(p),
    label: "Pelo menos 1 letra maiúscula",
  },
  {
    test: (p: string) => /[0-9]/.test(p),
    label: "Pelo menos 1 número",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Erro de validação local
  const passwordMismatch =
    touched && confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setError(null);

    // Validações locais antes de enviar
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signup(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push(result.success);
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
          <h1 className="h2 text-text-primary mt-4">Criar sua conta</h1>
          <p className="body text-text-secondary mt-2">
            Comece a gerenciar seu estoque em segundos.
          </p>
        </div>

        {/* Card do formulário */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Cadastro</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para criar sua conta gratuita.
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
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Crie uma senha forte"
                    required
                    className="h-touch text-base pr-10"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setTouched(true);
                    }}
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

                {/* Indicadores de força da senha */}
                {password.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {passwordRules.map((rule, idx) => {
                      const passed = rule.test(password);
                      return (
                        <li
                          key={idx}
                          className={`flex items-center gap-2 text-sm ${
                            passed ? "text-color-available" : "text-text-muted"
                          }`}
                        >
                          {passed ? (
                            <Check className="size-4 shrink-0" />
                          ) : (
                            <X className="size-4 shrink-0" />
                          )}
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Campo: Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    required
                    className="h-touch text-base pr-10"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setTouched(true);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors touch-target inline-flex items-center justify-center"
                    aria-label={
                      showConfirm ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>

                {/* Erro local: senhas não conferem */}
                {passwordMismatch && (
                  <p className="text-sm text-destructive mt-1" role="alert">
                    As senhas não conferem.
                  </p>
                )}
              </div>

              {/* Mensagem de erro do servidor */}
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-5" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>

            {/* Link para login */}
            <p className="text-center text-sm text-text-secondary mt-5">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="text-accent hover:text-accent-hover font-medium transition-colors"
              >
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center caption mt-6">
          Projeto Loja — Controle de Estoque
        </p>
      </div>
    </main>
  );
}
