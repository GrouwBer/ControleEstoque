import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";
import { CartProvider } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Projeto Loja — Controle de Estoque",
  description:
    "Sistema de controle de estoque e ponto de venda para lojas de antiguidades e colecionáveis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(inter.variable, jetbrainsMono.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: "var(--bg-canvas)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: "17px",
          lineHeight: 1.55,
        }}
      >
        <TooltipProvider delay={300}>
          <ToastProvider>
            <CartProvider>
              <Navbar />
              <main className="container-loja py-6">{children}</main>
              <CartDrawer />
              <ToastContainer />
            </CartProvider>
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
