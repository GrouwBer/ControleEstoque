import { Suspense } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
  ShoppingCart,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Package,
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

import { getReservations } from "@/lib/services/reservations";

// ── Helpers ──────────────────────────────────────────────────────
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(dateStr));
}

// ── Deadline status ─────────────────────────────────────────────
function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    // Overdue
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12px] font-medium bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
        <AlertTriangle className="w-3.5 h-3.5" />
        Vencida ({Math.abs(diffDays)} {Math.abs(diffDays) === 1 ? "dia" : "dias"})
      </span>
    );
  }

  if (diffDays <= 3) {
    // Warning — due soon
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
        <Clock className="w-3.5 h-3.5" />
        {diffDays === 0 ? "Hoje" : `${diffDays} ${diffDays === 1 ? "dia" : "dias"}`}
      </span>
    );
  }

  // Future
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12px] font-medium bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
      <CheckCircle2 className="w-3.5 h-3.5" />
      {diffDays} dias
    </span>
  );
}

// ── Status badge ────────────────────────────────────────────────
function ReservationStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    active: "Ativa",
    converted: "Convertida",
    cancelled: "Cancelada",
  };

  const variantMap: Record<string, "default" | "secondary" | "outline"> = {
    active: "default",
    converted: "secondary",
    cancelled: "outline",
  };

  return (
    <Badge variant={variantMap[status] ?? "outline"}>
      {labels[status] ?? status}
    </Badge>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────
function ReservationCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 rounded-card bg-card">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-12 h-12 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-48 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; description: string }> = {
    active: {
      title: "Nenhuma reserva ativa",
      description:
        "Reservas ativas aparecerão aqui. Crie uma nova reserva para começar.",
    },
    converted: {
      title: "Nenhuma reserva convertida",
      description: "Reservas convertidas em vendas aparecerão aqui.",
    },
    cancelled: {
      title: "Nenhuma reserva cancelada",
      description: "Reservas canceladas aparecerão aqui.",
    },
  };

  const msg = messages[tab] ?? messages.active;

  return (
    <div className="text-center py-16">
      <Calendar className="w-16 h-16 mx-auto text-text-muted mb-4" />
      <h3 className="h3 text-text-primary mb-2">{msg.title}</h3>
      <p className="body text-text-secondary mb-6">{msg.description}</p>
      {tab === "active" && (
        <Link href="/reservas/nova">
          <Button className="touch-target">
            <Plus className="w-4 h-4 mr-2" />
            Nova Reserva
          </Button>
        </Link>
      )}
    </div>
  );
}

// ── Action buttons (Client component for interactivity) ─────────
function ConvertButton({ reservationId }: { reservationId: number }) {
  return (
    <form className="inline">
      <Button
        variant="outline"
        size="sm"
        className="touch-target text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
        formAction={async () => {
          "use server";
          const { convertReservationToSale } = await import(
            "@/lib/services/reservations"
          );
          try {
            await convertReservationToSale(reservationId);
          } catch (e: any) {
            console.error(e);
          }
        }}
      >
        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
        Converter em Venda
      </Button>
    </form>
  );
}

function CancelReservationButton({ reservationId }: { reservationId: number }) {
  return (
    <form className="inline">
      <Button
        variant="outline"
        size="sm"
        className="touch-target text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
        formAction={async () => {
          "use server";
          const { cancelReservation } = await import(
            "@/lib/services/reservations"
          );
          try {
            await cancelReservation(reservationId);
          } catch (e: any) {
            console.error(e);
          }
        }}
      >
        <XCircle className="w-3.5 h-3.5 mr-1.5" />
        Cancelar Reserva
      </Button>
    </form>
  );
}

// ── Reservation card ────────────────────────────────────────────
function ReservationCard({ reservation }: { reservation: any }) {
  const product = reservation.product;

  return (
    <Card
      key={reservation.id}
      className="card-default hover:shadow-card-hover transition-shadow duration-200"
    >
      <CardContent className="p-4">
        {/* Product info */}
        <div className="flex items-center gap-3 mb-3">
          {product?.image_url ? (
            <img
              src={product.image_url}
              alt={product.name ?? "Produto"}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-input flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-text-muted" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/produtos/${product?.id ?? reservation.product_id}`}
              className="body font-medium text-text-primary hover:text-accent transition-colors truncate block"
            >
              {product?.name ?? `Produto #${reservation.product_id}`}
            </Link>
            {product?.sku && (
              <p className="micro text-text-muted">{product.sku}</p>
            )}
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>

        {/* Customer info */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 small text-text-primary">
            <User className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <span className="font-medium truncate">
              {reservation.customer_name}
            </span>
          </div>
          {reservation.customer_phone && (
            <div className="flex items-center gap-1.5 small text-text-muted">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{reservation.customer_phone}</span>
            </div>
          )}
          {reservation.customer_email && (
            <div className="flex items-center gap-1.5 small text-text-muted">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{reservation.customer_email}</span>
            </div>
          )}
        </div>

        {/* Dates and deadline */}
        <div className="flex items-center justify-between mb-3 text-[13px] text-text-muted">
          <span>
            {formatDateShort(reservation.reserved_at)}
          </span>
          {reservation.deadline && reservation.status === "active" && (
            <DeadlineBadge deadline={reservation.deadline} />
          )}
          {reservation.deadline && reservation.status !== "active" && (
            <span className="text-[13px] text-text-muted">
              Prazo: {formatDateShort(reservation.deadline)}
            </span>
          )}
        </div>

        {/* Actions — only for active reservations */}
        {reservation.status === "active" && (
          <div className="flex gap-2 flex-wrap">
            <ConvertButton reservationId={reservation.id} />
            <CancelReservationButton reservationId={reservation.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page Props ──────────────────────────────────────────────────
interface ReservasPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

// ── Page Component ──────────────────────────────────────────────
export default async function ReservasPage({
  searchParams,
}: ReservasPageProps) {
  const params = await searchParams;
  const activeTab = params.status ?? "active";

  // Fetch all reservation types
  const [
    { reservations: activeReservations },
    { reservations: convertedReservations },
    { reservations: cancelledReservations },
  ] = await Promise.all([
    getReservations({ status: "active" }),
    getReservations({ status: "converted" }),
    getReservations({ status: "cancelled" }),
  ]);

  const tabs = [
    {
      value: "active",
      label: "Ativas",
      count: activeReservations.length,
      reservations: activeReservations,
    },
    {
      value: "converted",
      label: "Convertidas",
      count: convertedReservations.length,
      reservations: convertedReservations,
    },
    {
      value: "cancelled",
      label: "Canceladas",
      count: cancelledReservations.length,
      reservations: cancelledReservations,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="h1 text-text-primary">Reservas</h1>
          <p className="body text-text-secondary mt-1">
            Gerencie as reservas de produtos
          </p>
        </div>
        <Link href="/reservas/nova">
          <Button className="touch-target">
            <Plus className="w-4 h-4 mr-2" />
            Nova Reserva
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} asChild>
                <Link
                  href={`/reservas?status=${tab.value}`}
                  className="flex items-center gap-2"
                >
                  {tab.label}
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-pill text-[11px] font-semibold bg-input text-text-secondary">
                    {tab.count}
                  </span>
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            <Suspense fallback={<ReservationCardsSkeleton />}>
              {tab.reservations.length === 0 ? (
                <EmptyState tab={tab.value} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tab.reservations.map((reservation: any) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                    />
                  ))}
                </div>
              )}
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
