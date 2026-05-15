"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, AlertTriangle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StockAdjustDialog } from "../StockAdjustDialog";

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProduct(id)
      .then(setProduct)
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    try {
      await api.deleteProduct(id);
      toast.success("Product deleted");
      router.push("/products");
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading) return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
  if (!product) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/products"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{product.sku}</code>
              {product.isLowStock ? (
                <Badge variant={product.quantityOnHand === 0 ? "destructive" : "warning"} className="gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  {product.quantityOnHand === 0 ? "Out of stock" : "Low stock"}
                </Badge>
              ) : (
                <Badge variant="success" className="text-xs">In stock</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <StockAdjustDialog product={product} onUpdated={setProduct} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/products/${id}/edit`}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete product?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will soft-delete <strong>{product.name}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-4 sm:grid-cols-2 animate-fade-in" style={{ animationDelay: "60ms" }}>
        <Card>
          <CardHeader><CardTitle className="text-sm">Inventory</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Detail label="On hand" value={<span className="text-2xl font-bold">{formatNumber(product.quantityOnHand)}</span>} />
            <Detail label="Low stock at" value={`≤ ${product.effectiveThreshold} units`} />
            {product.description && <div className="col-span-2"><Detail label="Description" value={product.description} /></div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Pricing</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Detail label="Cost price" value={formatCurrency(product.costPrice)} />
            <Detail label="Selling price" value={formatCurrency(product.sellingPrice)} />
            {product.costPrice && product.sellingPrice && (
              <Detail label="Margin" value={`${(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1)}%`} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock history */}
      {product.stockAdjustments && product.stockAdjustments.length > 0 && (
        <Card className="animate-fade-in" style={{ animationDelay: "120ms" }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Recent stock adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {product.stockAdjustments.map(adj => (
                <div key={adj.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center ${adj.delta > 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                    {adj.delta > 0
                      ? <TrendingUp className="h-3.5 w-3.5 text-success" />
                      : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {adj.delta > 0 ? "+" : ""}{adj.delta} units
                      {adj.note && <span className="text-muted-foreground font-normal"> — {adj.note}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(adj.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
