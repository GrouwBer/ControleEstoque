import { Suspense } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Clock,
  Tag,
  User,
  AlertCircle,
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

import { getDashboardStats } from "@/lib/services/sales";
import DashboardChart from "./chart";

// ── Format currency ─────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  if (value >= 10000) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return formatCurrency(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(dateStr));
}

// ── Stat card ───────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  href,
  trend,
  colorClass,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  trend?: number | null;
  colorClass?: string;
}) {
  return (
    <Link href={href}>
      <Card className="card-clickable h-full">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <p className="small text-text-muted">{title}</p>
              <p className="h3 text-text-primary">{value}</p>
            </div>
            <div
              className={`w-11 h-11 rounded-card flex items-center justify-center ${
                colorClass ?? "bg-input"
              }`}
            >
              <Icon className="w-5 h-5 text-text-secondary" />
            </div>
          </div>
          {trend !== undefined && trend !== null && (
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="small text-green-600 font-medium">
                    +{trend.toFixed(0)}%
                  </span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="small text-red-600 font-medium">
                    {trend.toFixed(0)}%
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 text-text-muted" />
                  <span className="small text-text-muted">Estável</span>
                </>
              )}
              <span className="caption text-text-muted ml-1">
                vs. mês anterior
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Activity event icon ─────────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "sale":
      return (
        <div className="w-9 h-9 rounded-pill bg-green-100 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="w-4 h-4 text-green-700 dark:text-green-400" />
        </div>
      );
    case "reservation":
      return (
        <div className="w-9 h-9 rounded-pill bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
        </div>
      );
    case "new_product":
      return (
        <div className="w-9 h-9 rounded-pill bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-blue-700 dark:text-blue-400" />
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-pill bg-input flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-text-muted" />
        </div>
      );
  }
}

// ── Loading skeleton ─────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-card lg:col-span-2" />
        <Skeleton className="h-80 rounded-card" />
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-16">
      <BarChart3 className="w-16 h-16 mx-auto text-text-muted mb-4" />
      <h3 className="h3 text-text-primary mb-2">
        Comece adicionando produtos ao seu catálogo
      </h3>
      <p className="body text-text-secondary mb-6">
        O painel mostrará estatísticas assim que você tiver produtos e vendas
        registradas.
      </p>
      <Link href="/produtos/novo">
        <Button className="touch-target">
          <Package className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </Link>
    </div>
  );
}

// ── Error state ─────────────────────────────────────────────────
function ErrorState() {
  return (
    <div className="text-center py-16">
      <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
      <h3 className="h3 text-text-primary mb-2">
        Erro ao carregar dados do painel
      </h3>
      <p className="body text-text-secondary mb-6">
        Tente novamente em alguns instantes.
      </p>
    </div>
  );
}

// ── Page Component (Server) ─────────────────────────────────────
export default async function DashboardPage() {
  let stats;
  let error = false;

  try {
    stats = await getDashboardStats();
  } catch (e) {
    console.error("Dashboard error:", e);
    error = true;
  }

  if (error || !stats) {
    return <ErrorState />;
  }

  const {
    availableCount,
    reservedCount,
    monthlySalesCount,
    monthlyRevenue,
    chartData,
    activityFeed,
    salesTrend,
    revenueTrend,
  } = stats;

  // Check if there is any data at all
  const hasData =
    availableCount > 0 ||
    reservedCount > 0 ||
    monthlySalesCount > 0 ||
    activityFeed.length > 0;

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="h1 text-text-primary">Painel</h1>
        <p className="body text-text-secondary mt-1">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Produtos Disponíveis"
          value={String(availableCount)}
          icon={Package}
          href="/produtos?status=available"
          colorClass="bg-green-100 dark:bg-green-950/30"
        />
        <StatCard
          title="Reservados"
          value={String(reservedCount)}
          icon={Calendar}
          href="/reservas?status=active"
          colorClass="bg-amber-100 dark:bg-amber-950/30"
        />
        <StatCard
          title="Vendidos este mês"
          value={String(monthlySalesCount)}
          icon={ShoppingCart}
          href="/vendas"
          trend={salesTrend}
          colorClass="bg-blue-100 dark:bg-blue-950/30"
        />
        <StatCard
          title="Receita do mês"
          value={formatCompactCurrency(monthlyRevenue)}
          icon={DollarSign}
          href="/vendas"
          trend={revenueTrend}
          colorClass="bg-purple-100 dark:bg-purple-950/30"
        />
      </div>

      {/* Chart + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="h4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Receita nos Últimos 30 Dias
            </CardTitle>
            <CardDescription>
              Total de vendas finalizadas por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <Skeleton className="h-64 w-full rounded-card" />
              }
            >
              {chartData.length > 0 ? (
                <DashboardChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="body text-text-muted">
                    Nenhuma venda nos últimos 30 dias.
                  </p>
                </div>
              )}
            </Suspense>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader>
            <CardTitle className="h4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Atividade Recente
            </CardTitle>
            <CardDescription>Últimos eventos registrados</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activityFeed.length === 0 ? (
              <div className="p-6 text-center">
                <p className="body text-text-muted">
                  Nenhuma atividade recente.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activityFeed.map((event: any, idx: number) => (
                  <div
                    key={`${event.type}-${event.id}-${idx}`}
                    className="flex items-start gap-3 p-4 hover:bg-card-hover transition-colors"
                  >
                    <ActivityIcon type={event.type} />
                    <div className="flex-1 min-w-0">
                      <p className="body font-medium text-text-primary truncate">
                        {event.label}
                      </p>
                      {event.description && (
                        <p className="small text-text-secondary truncate">
                          {event.description}
                        </p>
                      )}
                      <p className="caption text-text-muted mt-0.5">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
