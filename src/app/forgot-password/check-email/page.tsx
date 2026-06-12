import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Página exibida após solicitação de recuperação de senha.
 */
export default function ForgotPasswordCheckEmailPage() {
  return (
    <main className="container-loja min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-text-primary hover:text-accent transition-colors"
          >
            Projeto Loja
          </Link>
          <h1 className="h2 text-text-primary mt-4">Email enviado</h1>
          <p className="body text-text-secondary mt-2">
            Verifique sua caixa de entrada.
          </p>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Mail className="size-7 text-accent" />
              </div>

              <div>
                <p className="body text-text-primary font-medium">
                  Link de redefinição enviado
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  Se o email informado estiver cadastrado, você receberá um link
                  para redefinir sua senha. O link expira em 1 hora.
                </p>
                <p className="text-sm text-text-secondary mt-2">
                  Não esqueça de verificar a pasta de spam.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para o login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center caption mt-6">
          Projeto Loja — Controle de Estoque
        </p>
      </div>
    </main>
  );
}
