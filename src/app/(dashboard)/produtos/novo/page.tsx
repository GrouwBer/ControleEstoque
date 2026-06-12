"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/lib/services/products";
import { createClient } from "@/lib/supabase/client";

// ── Constants ────────────────────────────────────────────────────
const CONDITIONS = [
  { value: "New", label: "Novo" },
  { value: "Like New", label: "Como Novo" },
  { value: "Good", label: "Bom" },
  { value: "Fair", label: "Regular" },
  { value: "Poor", label: "Ruim" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET_NAME = "product-images";

// ── Component ────────────────────────────────────────────────────
export default function NovoProdutoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    condition: "Good" as string,
    cost_price: "",
    list_price: "",
    notes: "",
  });

  // ── Handlers ─────────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Imagem muito grande. Máximo 5MB.");
      return;
    }

    setError(null);
    setImageFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Erro no upload:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!form.name.trim()) {
      setError("Nome do produto é obrigatório.");
      return;
    }

    const costPrice = parseFloat(form.cost_price || "0");
    const listPrice = parseFloat(form.list_price || "0");

    if (isNaN(costPrice) || costPrice < 0) {
      setError("Preço de custo inválido.");
      return;
    }

    if (isNaN(listPrice) || listPrice < 0) {
      setError("Preço de venda inválido.");
      return;
    }

    setLoading(true);

    try {
      // Upload da imagem (se houver)
      let imageUrl = "";
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (!uploadedUrl) {
          setError("Falha ao fazer upload da imagem.");
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      // Cria o produto
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        condition: form.condition as any,
        cost_price: costPrice,
        list_price: listPrice,
        notes: form.notes.trim(),
        image_url: imageUrl,
      });

      router.push("/produtos");
      router.refresh();
    } catch (err: any) {
      console.error("Erro ao criar produto:", err);
      setError(err.message || "Falha ao criar produto.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/produtos"
          className="inline-flex items-center justify-center w-10 h-10 rounded-btn hover:bg-card-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="h2 text-text-primary">Novo Produto</h1>
          <p className="body text-text-secondary mt-1">
            Adicione um novo item ao catálogo
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-card bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <p className="small text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="h4">Informações do Produto</CardTitle>
            <CardDescription className="body text-text-muted">
              Preencha os dados principais do produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Relógio Antigo Suíço"
                required
                maxLength={200}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descreva o produto em detalhes..."
                rows={4}
              />
            </div>

            {/* Categoria e Condição - lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Ex: Relógios, Móveis..."
                />
              </div>
              <div className="space-y-2">
                <Label>Condição *</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => handleSelectChange("condition", v ?? "Good")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precificação */}
        <Card>
          <CardHeader>
            <CardTitle className="h4">Precificação</CardTitle>
            <CardDescription className="body text-text-muted">
              Defina os valores de custo e venda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Preço de Custo (R$)</Label>
                <Input
                  id="cost_price"
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost_price}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="list_price">Preço de Venda (R$) *</Label>
                <Input
                  id="list_price"
                  name="list_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.list_price}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imagem */}
        <Card>
          <CardHeader>
            <CardTitle className="h4">Imagem do Produto</CardTitle>
            <CardDescription className="body text-text-muted">
              Formatos aceitos: JPG, PNG ou WebP. Máximo 5MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-card border border-border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-card p-8 text-center cursor-pointer hover:bg-card-hover transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto text-text-muted mb-3" />
                <p className="body text-text-secondary mb-1">
                  Clique para fazer upload
                </p>
                <p className="small text-text-muted">
                  JPG, PNG ou WebP — máx. 5MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle className="h4">Observações</CardTitle>
            <CardDescription className="body text-text-muted">
              Notas internas sobre o produto (não visíveis ao cliente)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Ex: Procedência, estado de conservação, detalhes para venda..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/produtos">
            <Button type="button" variant="outline" className="touch-target">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="touch-target"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Produto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
