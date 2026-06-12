import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Calendar,
  ShoppingCart,
  Edit,
  Trash2,
  DollarSign,
  Tag,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { getProduct } from "@/lib/services/products";

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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    available: "badge-available",
    reserved: "badge-reserved",
    sold: "badge-sold",
  };
  const labels: Record<string, string> = {
    available: "Disponível",
    reserved: "Reservado",
    sold: "Vendido",
  };

  return (
    <span className={classes[status] ?? "badge-available"}>
      {labels[status] ?? status}
    </span>
  );
}

function ConditionLabel({ condition }: { condition: string }) {
  const labels: Record<string, string> = {
    New: "Novo",
    "Like New": "Como Novo",
    Good: "Bom",
    Fair: "Regular",
    Poor: "Ruim",
  };

  return <span>{labels[condition] ?? condition}</span>;
}

// ── Loading ─────────────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-btn" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-card lg:col-span-1" />
        <Skeleton className="h-80 rounded-card lg:col-span-2" />
      </div>
    </div>
  );
}

// ── Profit margin ───────────────────────────────────────────────
function ProfitBadge({ cost, list }: { cost: number; list: number }) {
  if (cost <= 0 || list <= 0) return null;

  const margin = ((list - cost) / list) * 100;
  const isGood = margin >= 50;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[13px] font-medium ${
        isGood
          ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-950/30"
          : "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/30"
      }`}
    >
      <DollarSign className="w-3.5 h-3.5" />
      Margem {margin.toFixed(0)}%
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────
interface ProductDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  let data: Awaited<ReturnType<typeof getProduct>>;
  try {
    data = await getProduct(productId);
  } catch {
    notFound();
  }

  const { product, reservations, sales } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/produtos"
            className="inline-flex items-center justify-center w-10 h-10 rounded-btn hover:bg-card-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="h2 text-text-primary">{product.name}</h1>
              <StatusBadge status={product.status} />
            </div>
            <p className="body text-text-muted mt-0.5">
              SKU: {product.sku} · Criado em{" "}
              {formatDate(product.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/produtos/${product.id}/editar`}>
            <Button variant="outline" className="touch-target">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          {/* Delete só aparece se disponível */}
          {product.status === "available" && (
            <form>
              <Button
                variant="outline"
                className="touch-target text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                type="submit"
                formAction={async () => {
                  "use server";
                  const { deleteProduct } = await import(
                    "@/lib/services/products"
                  );
                  try {
                    await deleteProduct(productId);
                  } catch (e: any) {
                    console.error(e);
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda — Imagem e dados rápidos */}
        <div className="space-y-6">
          {/* Imagem */}
          <Card>
            <CardContent className="p-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-64 lg:h-80 object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-64 lg:h-80 bg-input rounded-t-xl flex items-center justify-center">
                  <Package className="w-16 h-16 text-text-muted" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados rápidos */}
          <Card>
            <CardHeader>
              <CardTitle className="h4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Dados do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="small text-text-muted">Categoria</span>
                <span className="body font-medium text-text-primary">
                  {product.category || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="small text-text-muted">Condição</span>
                <span className="body font-medium text-text-primary">
                  <ConditionLabel condition={product.condition} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="small text-text-muted">Preço de Custo</span>
                <span className="body text-text-muted">
                  {formatCurrency(product.cost_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="small text-text-muted">Preço de Venda</span>
                <span className="body font-semibold text-text-primary">
                  {formatCurrency(product.list_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="small text-text-muted">Margem</span>
                <ProfitBadge
                  cost={product.cost_price}
                  list={product.list_price}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da direita — Descrição e Histórico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle className="h4">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              {product.description ? (
                <p className="body text-text-secondary whitespace-pre-wrap">
                  {product.description}
                </p>
              ) : (
                <p className="body text-text-muted italic">
                  Nenhuma descrição fornecida.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {product.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="h4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Observações Internas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="body text-text-secondary whitespace-pre-wrap">
                  {product.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tabs — Histórico */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="h4">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="sales">
                <TabsList>
                  <TabsTrigger value="sales" className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Vendas ({sales.length})
                  </TabsTrigger>
                  <TabsTrigger value="reservations" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Reservas ({reservations.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="mt-4">
                  {sales.length === 0 ? (
                    <p className="body text-text-muted text-center py-8">
                      Nenhuma venda registrada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sales.map((sale: any) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-3 rounded-btn bg-input"
                        >
                          <div>
                            <p className="body font-medium text-text-primary">
                              {sale.carts?.buyer_name || "Cliente"}
                            </p>
                            <p className="small text-text-muted">
                              Finalizado em{" "}
                              {formatDate(sale.carts?.finalized_at)}
                            </p>
                          </div>
                          <span className="body font-semibold text-text-primary">
                            {formatCurrency(sale.final_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reservations" className="mt-4">
                  {reservations.length === 0 ? (
                    <p className="body text-text-muted text-center py-8">
                      Nenhuma reserva registrada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reservations.map((res: any) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between p-3 rounded-btn bg-input"
                        >
                          <div>
                            <p className="body font-medium text-text-primary">
                              {res.customer_name}
                            </p>
                            <p className="small text-text-muted">
                              {res.customer_phone && `📞 ${res.customer_phone}`}
                              {res.customer_email &&
                                ` · ✉️ ${res.customer_email}`}
                            </p>
                            <p className="caption text-text-muted">
                              Reservado em {formatDate(res.reserved_at)}
                              {res.deadline &&
                                ` · Prazo: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(res.deadline))}`}
                            </p>
                          </div>
                          <Badge
                            variant={
                              res.status === "active"
                                ? "default"
                                : res.status === "converted"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {res.status === "active"
                              ? "Ativa"
                              : res.status === "converted"
                                ? "Convertida"
                                : "Cancelada"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
