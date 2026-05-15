"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import type { Product } from "@/types";

interface Props {
  initial?: Partial<Product>;
  mode: "create" | "edit";
}

export function ProductForm({ initial = {}, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    sku: initial.sku ?? "",
    description: initial.description ?? "",
    quantityOnHand: initial.quantityOnHand?.toString() ?? "0",
    costPrice: initial.costPrice?.toString() ?? "",
    sellingPrice: initial.sellingPrice?.toString() ?? "",
    lowStockThreshold: initial.lowStockThreshold?.toString() ?? "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description || undefined,
      quantityOnHand: parseInt(form.quantityOnHand) || 0,
      costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
      sellingPrice: form.sellingPrice ? parseFloat(form.sellingPrice) : null,
      lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold) : null,
    };
    try {
      if (mode === "create") {
        await api.createProduct(payload);
        toast.success("Product created!");
      } else {
        await api.updateProduct(initial.id!, payload);
        toast.success("Product updated!");
      }
      router.push("/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "create" ? "Add product" : "Edit product"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {mode === "create" ? "Create a new SKU in your inventory" : `Editing ${initial.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card className="animate-fade-in" style={{ animationDelay: "60ms" }}>
          <CardHeader>
            <CardTitle className="text-base">Basic information</CardTitle>
            <CardDescription>Name and identifier for this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product name <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="e.g. Blue T-Shirt (M)" value={form.name} onChange={e => set("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU <span className="text-destructive">*</span></Label>
                <Input id="sku" placeholder="e.g. TSH-BLU-M" value={form.sku} onChange={e => set("sku", e.target.value)} required className="font-mono uppercase" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input id="description" placeholder="Short description…" value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="animate-fade-in" style={{ animationDelay: "120ms" }}>
          <CardHeader>
            <CardTitle className="text-base">Inventory</CardTitle>
            <CardDescription>Stock levels and reorder settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity on hand</Label>
                <Input id="qty" type="number" min={0} placeholder="0" value={form.quantityOnHand} onChange={e => set("quantityOnHand", e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">
                  Low stock threshold{" "}
                  <span className="text-muted-foreground font-normal">(blank = use org default)</span>
                </Label>
                <Input id="threshold" type="number" min={0} placeholder="e.g. 5" value={form.lowStockThreshold} onChange={e => set("lowStockThreshold", e.target.value)} className="font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="animate-fade-in" style={{ animationDelay: "180ms" }}>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
            <CardDescription>Optional cost and selling prices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost price <span className="text-muted-foreground font-normal">($)</span></Label>
                <Input id="cost" type="number" min={0} step={0.01} placeholder="0.00" value={form.costPrice} onChange={e => set("costPrice", e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling">Selling price <span className="text-muted-foreground font-normal">($)</span></Label>
                <Input id="selling" type="number" min={0} step={0.01} placeholder="0.00" value={form.sellingPrice} onChange={e => set("sellingPrice", e.target.value)} className="font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 animate-fade-in" style={{ animationDelay: "240ms" }}>
          <Button type="button" variant="outline" asChild>
            <Link href="/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {mode === "create" ? "Create product" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
