import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

import { getProducts, getCategories } from "@/lib/services/products";
import type { ProductRow } from "@/types/database";

// ── Status badge ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: ProductRow["status"] }) {
  const labels: Record<string, string> = {
    available: "Disponível",
    reserved: "Reservado",
    sold: "Vendido",
  };

  const classes: Record<string, string> = {
    available: "badge-available",
    reserved: "badge-reserved",
    sold: "badge-sold",
  };

  return (
    <span className={classes[status] ?? "badge-available"}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Condition badge ──────────────────────────────────────────────
function ConditionBadge({ condition }: { condition: string }) {
  const labels: Record<string, string> = {
    New: "Novo",
    "Like New": "Como Novo",
    Good: "Bom",
    Fair: "Regular",
    Poor: "Ruim",
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[13px] font-medium bg-muted text-text-secondary">
      {labels[condition] ?? condition}
    </span>
  );
}

// ── Format currency ─────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ── Loading skeleton ─────────────────────────────────────────────
function ProductTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-card bg-card">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-16">
      <Package className="w-16 h-16 mx-auto text-text-muted mb-4" />
      <h3 className="h3 text-text-primary mb-2">Nenhum produto encontrado</h3>
      <p className="body text-text-secondary mb-6">
        Comece adicionando seu primeiro produto ao catálogo.
      </p>
      <Link href="/produtos/novo">
        <Button className="touch-target">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </Link>
    </div>
  );
}

// ── Filter bar (Client component for interactivity) ─────────────
function FilterBar({
  categories,
  currentSearch,
  currentCategory,
  currentCondition,
  currentStatus,
}: {
  categories: string[];
  currentSearch?: string;
  currentCategory?: string;
  currentCondition?: string;
  currentStatus?: string;
}) {
  return (
    <form className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          name="search"
          placeholder="Buscar por nome ou SKU..."
          defaultValue={currentSearch}
          className="pl-10"
        />
      </div>
      <Select name="category" defaultValue={currentCategory ?? "all"}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select name="condition" defaultValue={currentCondition ?? "all"}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Condição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas condições</SelectItem>
          <SelectItem value="New">Novo</SelectItem>
          <SelectItem value="Like New">Como Novo</SelectItem>
          <SelectItem value="Good">Bom</SelectItem>
          <SelectItem value="Fair">Regular</SelectItem>
          <SelectItem value="Poor">Ruim</SelectItem>
        </SelectContent>
      </Select>
      <Select name="status" defaultValue={currentStatus ?? "all"}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          <SelectItem value="available">Disponível</SelectItem>
          <SelectItem value="reserved">Reservado</SelectItem>
          <SelectItem value="sold">Vendido</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline" className="touch-target">
        <Filter className="w-4 h-4 mr-2" />
        Filtrar
      </Button>
    </form>
  );
}

// ── Page Props ──────────────────────────────────────────────────
interface ProdutosPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    condition?: string;
    status?: string;
  }>;
}

// ── Page Component ──────────────────────────────────────────────
export default async function ProdutosPage({
  searchParams,
}: ProdutosPageProps) {
  const params = await searchParams;

  const filters = {
    search: params.search,
    category: params.category && params.category !== "all" ? params.category : undefined,
    condition: params.condition && params.condition !== "all" ? params.condition : undefined,
    status: params.status && params.status !== "all" ? params.status : undefined,
    limit: 100,
  };

  const [{ products, total }, { categories }] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="h1 text-text-primary">Produtos</h1>
          <p className="body text-text-secondary mt-1">
            {total} {total === 1 ? "produto" : "produtos"} no catálogo
          </p>
        </div>
        <Link href="/produtos/novo">
          <Button className="touch-target">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <FilterBar
        categories={categories}
        currentSearch={params.search}
        currentCategory={params.category}
        currentCondition={params.condition}
        currentStatus={params.status}
      />

      {/* Products table */}
      <Suspense fallback={<ProductTableSkeleton />}>
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="card-default overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagem</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Categoria
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Condição
                  </TableHead>
                  <TableHead className="text-right">
                    Preço de Venda
                  </TableHead>
                  <TableHead className="text-right hidden sm:table-cell">
                    Custo
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link href={`/produtos/${product.id}`}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-input flex items-center justify-center">
                            <Package className="w-5 h-5 text-text-muted" />
                          </div>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/produtos/${product.id}`}
                        className="micro text-text-muted hover:text-text-secondary"
                      >
                        {product.sku}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/produtos/${product.id}`}
                        className="body font-medium text-text-primary hover:text-accent transition-colors"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="small text-text-secondary">
                        {product.category || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <ConditionBadge condition={product.condition} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="body font-medium text-text-primary">
                        {formatCurrency(product.list_price)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      <span className="small text-text-muted">
                        {formatCurrency(product.cost_price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Suspense>

      {/* Results count - mobile */}
      <p className="md:hidden mt-4 text-center small text-text-muted">
        Mostrando {products.length} de {total} produtos
      </p>
    </div>
  );
}
