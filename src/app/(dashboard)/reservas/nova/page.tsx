"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  Package,
  Plus,
  Check,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ───────────────────────────────────────────────────────
interface ProductOption {
  id: number;
  sku: string;
  name: string;
  image_url: string | null;
  status: string;
  list_price: number;
}

// ── Format currency ─────────────────────────────────────────────
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ── Product search component ────────────────────────────────────
function ProductSearch({
  onSelect,
  selectedProduct,
}: {
  onSelect: (product: ProductOption | null) => void;
  selectedProduct: ProductOption | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchProducts = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { searchProducts } = await import("@/lib/services/products");
      const data = await searchProducts(q);
      setResults(
        (data.products as ProductOption[]).filter(
          (p: ProductOption) => p.status === "available"
        )
      );
      setShowResults(true);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) searchProducts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  const handleSelect = (product: ProductOption) => {
    onSelect(product);
    setQuery("");
    setShowResults(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setShowResults(false);
  };

  return (
    <div className="relative">
      {selectedProduct ? (
        <div className="flex items-center gap-3 p-3 rounded-btn bg-input">
          {selectedProduct.image_url ? (
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-background flex items-center justify-center">
              <Package className="w-5 h-5 text-text-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="body font-medium text-text-primary truncate">
              {selectedProduct.name}
            </p>
            <p className="small text-text-muted">
              {selectedProduct.sku} · {formatCurrency(selectedProduct.list_price)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="touch-target text-text-muted hover:text-text-primary"
          >
            ✕
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto por nome ou SKU..."
            className="pl-10"
            onFocus={() => results.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
        </div>
      )}

      {/* Search results dropdown */}
      {showResults && results.length > 0 && !selectedProduct && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-card shadow-card-hover max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                className="w-full flex items-center gap-3 p-3 hover:bg-card-hover transition-colors text-left"
                onClick={() => handleSelect(product)}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-input flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-text-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="body font-medium text-text-primary truncate">
                    {product.name}
                  </p>
                  <p className="small text-text-muted">
                    {product.sku} · {formatCurrency(product.list_price)}
                  </p>
                </div>
                <span className="badge-available">Disponível</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* No results */}
      {showResults && results.length === 0 && !loading && query.length >= 2 && !selectedProduct && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-card shadow-card-hover p-4 text-center">
          <p className="small text-text-muted">
            Nenhum produto disponível encontrado.
          </p>
        </div>
      )}
    </div>
  );
}

// ── New Reservation Form ────────────────────────────────────────
export default function NovaReservaPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedProduct) {
      setError("Selecione um produto.");
      return;
    }

    if (!customerName.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    setSubmitting(true);

    try {
      const { createReservation } = await import(
        "@/lib/services/reservations"
      );
      await createReservation(
        selectedProduct.id,
        {
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim(),
        },
        deadline || undefined
      );

      router.push("/reservas?status=active");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Falha ao criar reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/reservas"
          className="inline-flex items-center justify-center w-10 h-10 rounded-btn hover:bg-card-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="h2 text-text-primary">Nova Reserva</h1>
          <p className="body text-text-secondary mt-0.5">
            Reserve um produto para um cliente
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="h4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Dados da Reserva
            </CardTitle>
            <CardDescription>
              Selecione o produto e preencha os dados do cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Produto *</Label>
                <ProductSearch
                  onSelect={setSelectedProduct}
                  selectedProduct={selectedProduct}
                />
              </div>

              {/* Customer name */}
              <div className="space-y-2">
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome completo"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Customer phone */}
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Customer email */}
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">
                  Prazo da Reserva
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <p className="caption text-text-muted">
                  Data limite para o cliente retirar o produto.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-btn bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="small text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="touch-target flex-1 sm:flex-initial"
                  disabled={submitting || !selectedProduct}
                >
                  {submitting ? (
                    "Criando..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Criar Reserva
                    </>
                  )}
                </Button>
                <Link href="/reservas">
                  <Button
                    variant="outline"
                    className="touch-target"
                    type="button"
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
