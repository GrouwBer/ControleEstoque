import { Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ClipboardList,
  Calendar,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getSales } from "@/lib/services/sales";
import type { CartRow } from "@/types/database";

// ── Format currency ─────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ── Format date ────────────────────────────────────────────────
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

// ── Format date short ──────────────────────────────────────────
function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(dateStr));
}

// ── Loading skeleton ─────────────────────────────────────────────
function SalesTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-card bg-card">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-16">
      <ShoppingCart className="w-16 h-16 mx-auto text-text-muted mb-4" />
      <h3 className="h3 text-text-primary mb-2">Nenhuma venda encontrada</h3>
      <p className="body text-text-secondary">
        As vendas finalizadas aparecerão aqui.
      </p>
    </div>
  );
}

// ── Discount label ──────────────────────────────────────────────
function DiscountLabel({
  type,
  value,
  amount,
}: {
  type: string;
  value: number;
  amount: number;
}) {
  if (type === "none" || amount === 0) return null;
  const label =
    type === "percent" ? `${value}%` : formatCurrency(value);
  return (
    <span className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[12px] font-medium bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
      <DollarSign className="w-3 h-3" />
      Desc. {label}
    </span>
  );
}

// ── Filter bar (Client component for interactivity) ─────────────
function FilterBar({
  currentSearch,
  currentDateFrom,
  currentDateTo,
}: {
  currentSearch?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
}) {
  return (
    <form className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          name="search"
          placeholder="Buscar por nome do comprador..."
          defaultValue={currentSearch}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Input
            name="dateFrom"
            type="date"
            defaultValue={currentDateFrom}
            className="w-full sm:w-40"
            placeholder="De"
          />
        </div>
        <div className="relative flex-1 sm:flex-initial">
          <Input
            name="dateTo"
            type="date"
            defaultValue={currentDateTo}
            className="w-full sm:w-40"
            placeholder="Até"
          />
        </div>
      </div>
      <Button type="submit" variant="outline" className="touch-target">
        <Filter className="w-4 h-4 mr-2" />
        Filtrar
      </Button>
    </form>
  );
}

// ── Page Props ──────────────────────────────────────────────────
interface VendasPageProps {
  searchParams: Promise<{
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

// ── Page Component ──────────────────────────────────────────────
export default async function VendasPage({ searchParams }: VendasPageProps) {
  const params = await searchParams;

  const filters = {
    search: params.search || undefined,
    dateFrom: params.dateFrom ? new Date(params.dateFrom).toISOString() : undefined,
    dateTo: params.dateTo || undefined,
  };

  const { sales } = await getSales(filters);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="h1 text-text-primary">Vendas</h1>
          <p className="body text-text-secondary mt-1">
            {sales.length} {sales.length === 1 ? "venda" : "vendas"} registradas
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        currentSearch={params.search}
        currentDateFrom={params.dateFrom}
        currentDateTo={params.dateTo}
      />

      {/* Sales table */}
      <Suspense fallback={<SalesTableSkeleton />}>
        {sales.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="card-default overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">
                    Itens
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Desconto
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale: any) => {
                  const itemCount = sale.cart_items?.[0]?.count ?? 0;
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <Link
                          href={`/vendas/${sale.id}`}
                          className="micro text-text-muted hover:text-text-secondary"
                        >
                          #{sale.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/vendas/${sale.id}`}
                          className="body text-text-primary hover:text-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-text-muted" />
                            <span>{formatDate(sale.finalized_at)}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/vendas/${sale.id}`}
                          className="body text-text-primary hover:text-accent transition-colors"
                        >
                          {sale.buyer_name || "Anônimo"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <span className="small text-text-secondary">
                          {itemCount} {itemCount === 1 ? "item" : "itens"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="body font-semibold text-text-primary">
                          {formatCurrency(sale.final_total ?? 0)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <DiscountLabel
                          type={sale.discount_type}
                          value={sale.discount_value}
                          amount={sale.discount_amount}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Suspense>

      {/* Results count - mobile */}
      <p className="md:hidden mt-4 text-center small text-text-muted">
        Mostrando {sales.length} vendas
      </p>
    </div>
  );
}
