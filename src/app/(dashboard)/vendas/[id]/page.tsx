import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  User,
  Phone,
  FileText,
  DollarSign,
  Percent,
  XCircle,
  Printer,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getSaleById, cancelSale } from "@/lib/services/sales";
import { PrintStyles } from "@/components/PrintStyles";

// ── Helpers ──────────────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(dateStr));
}

// ── Loading ─────────────────────────────────────────────────────
function SaleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-btn" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-60 rounded-card" />
        <Skeleton className="h-60 rounded-card lg:col-span-2" />
      </div>
    </div>
  );
}

// ── Cancel Sale Button (Client component for interactivity) ────
function CancelSaleButton({ saleId }: { saleId: number }) {
  return (
    <form>
      <Button
        variant="outline"
        className="touch-target text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
        type="submit"
        formAction={async () => {
          "use server";
          try {
            await cancelSale(saleId);
          } catch (e: any) {
            console.error(e);
          }
        }}
      >
        <XCircle className="w-4 h-4 mr-2" />
        Cancelar Venda
      </Button>
    </form>
  );
}

// ── Page ────────────────────────────────────────────────────────
interface SaleDetailProps {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: SaleDetailProps) {
  const { id } = await params;
  const saleId = parseInt(id, 10);

  if (isNaN(saleId)) {
    notFound();
  }

  let data: Awaited<ReturnType<typeof getSaleById>>;
  try {
    data = await getSaleById(saleId);
  } catch {
    notFound();
  }

  const { cart, items } = data;

  // Determine if the sale can be cancelled (within 24 hours)
  const finalizedAt = new Date(cart.finalized_at!);
  const now = new Date();
  const hoursSinceFinalized =
    (now.getTime() - finalizedAt.getTime()) / (1000 * 60 * 60);
  const canCancel = hoursSinceFinalized <= 24;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/vendas"
            className="inline-flex items-center justify-center w-10 h-10 rounded-btn hover:bg-card-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="h2 text-text-primary">
              Venda #{cart.id}
            </h1>
            <p className="body text-text-muted mt-0.5">
              Finalizada em {formatDate(cart.finalized_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print button */}
          <Button
            variant="outline"
            className="touch-target"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>

          {/* Cancel button — only for recent sales */}
          {canCancel && <CancelSaleButton saleId={cart.id} />}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-2">
        {/* Left column — Buyer info and notes */}
        <div className="space-y-6 print:col-span-1">
          {/* Buyer info */}
          <Card>
            <CardHeader>
              <CardTitle className="h4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Dados do Comprador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-pill bg-input flex items-center justify-center">
                  <User className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <p className="body font-medium text-text-primary">
                    {cart.buyer_name || "Anônimo"}
                  </p>
                  {cart.buyer_phone && (
                    <p className="small text-text-muted flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {cart.buyer_phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(cart.notes || cart.sale_notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="h4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.notes && (
                  <div>
                    <p className="small text-text-muted mb-1">Notas do carrinho</p>
                    <p className="body text-text-secondary whitespace-pre-wrap">
                      {cart.notes}
                    </p>
                  </div>
                )}
                {cart.sale_notes && (
                  <div>
                    <p className="small text-text-muted mb-1">Notas da venda</p>
                    <p className="body text-text-secondary whitespace-pre-wrap">
                      {cart.sale_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — Items and totals */}
        <div className="lg:col-span-2 space-y-6 print:col-span-1">
          {/* Items table */}
          <Card>
            <CardHeader>
              <CardTitle className="h4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Itens ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="body text-text-muted text-center py-8">
                  Nenhum item nesta venda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">
                        Preço de Lista
                      </TableHead>
                      <TableHead className="text-right">
                        Preço Final
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any, idx: number) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="small text-text-muted">
                            {idx + 1}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-input flex items-center justify-center">
                                <Package className="w-5 h-5 text-text-muted" />
                              </div>
                            )}
                            <div>
                              <Link
                                href={`/produtos/${item.product_id}`}
                                className="body font-medium text-text-primary hover:text-accent transition-colors"
                              >
                                {item.product?.name ?? `Produto #${item.product_id}`}
                              </Link>
                              {item.product?.sku && (
                                <p className="micro text-text-muted">
                                  {item.product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          <span className="small text-text-muted">
                            {formatCurrency(item.list_price_at_time ?? 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="body font-semibold text-text-primary">
                            {formatCurrency(item.final_price ?? 0)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Totals summary */}
          <Card>
            <CardHeader>
              <CardTitle className="h4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="body text-text-secondary">Subtotal</span>
                  <span className="body text-text-primary">
                    {formatCurrency(cart.subtotal ?? 0)}
                  </span>
                </div>

                {cart.discount_type !== "none" && cart.discount_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="body text-text-secondary flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-green-600" />
                      Desconto
                      {cart.discount_type === "percent" &&
                        ` (${cart.discount_value}%)`}
                    </span>
                    <span className="body text-green-600 dark:text-green-400 font-medium">
                      -{formatCurrency(cart.discount_amount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="h4 text-text-primary">Total</span>
                  <span className="h3 text-text-primary">
                    {formatCurrency(cart.final_total ?? 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print styles */}
      <PrintStyles />
    </div>
  );
}
