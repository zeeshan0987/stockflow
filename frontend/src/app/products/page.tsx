"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, PackageX, AlertTriangle, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StockAdjustDialog } from "./StockAdjustDialog";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async (q = search) => {
    setLoading(true);
    try {
      const res = await api.getProducts(q);
      setProducts(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(""); }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.deleteProduct(id);
      setProducts(p => p.filter(x => x.id !== id));
      setTotal(t => t - 1);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  }

  function onStockUpdated(updated: Product) {
    setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading…" : `${formatNumber(total)} product${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in" style={{ animationDelay: "60ms" }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="animate-fade-in" style={{ animationDelay: "120ms" }}>
        {loading ? (
          <CardContent className="pt-6 space-y-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </CardContent>
        ) : products.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <PackageX className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-lg">
              {search ? "No products found" : "No products yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {search ? "Try a different search term." : "Get started by adding your first product."}
            </p>
            {!search && (
              <Button asChild><Link href="/products/new"><Plus className="mr-2 h-4 w-4" />Add product</Link></Button>
            )}
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Product", "SKU", "Stock", "Status", "Cost", "Price", "Actions"].map(h => (
                    <th key={h} className={`px-4 py-3 font-medium text-muted-foreground text-left ${h === "Stock" || h === "Cost" || h === "Price" ? "text-right hidden md:table-cell" : ""} ${h === "Actions" ? "text-right" : ""} ${h === "Status" ? "hidden sm:table-cell" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 1 ? "bg-muted/5" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/products/${p.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                        {p.name}
                      </Link>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{p.sku}</code>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell font-mono">
                      {formatNumber(p.quantityOnHand)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.isLowStock ? (
                        <Badge variant={p.quantityOnHand === 0 ? "destructive" : "warning"} className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {p.quantityOnHand === 0 ? "Out of stock" : "Low stock"}
                        </Badge>
                      ) : (
                        <Badge variant="success">In stock</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-muted-foreground">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell font-medium">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <StockAdjustDialog product={p} onUpdated={onStockUpdated} />
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/products/${p.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will soft-delete <strong>{p.name}</strong>. You can restore it via the database if needed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(p.id)}
                              >
                                {deleting === p.id ? "Deleting…" : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
