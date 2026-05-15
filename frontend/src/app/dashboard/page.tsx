"use client";
import { useEffect, useState } from "react";
import { Package, Boxes, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { DashboardData } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, sub, icon: Icon, delay = 0, variant = "default" }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; delay?: number; variant?: "default" | "warning";
}) {
  return (
    <Card className={`animate-fade-in`} style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${variant === "warning" ? "bg-destructive/10" : "bg-primary/10"}`}>
          <Icon className={`h-4 w-4 ${variant === "warning" ? "text-destructive" : "text-primary"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold tracking-tight ${variant === "warning" && Number(value) > 0 ? "text-destructive" : ""}`}>
          {typeof value === "number" ? formatNumber(value) : value}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your inventory at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <StatCard title="Total products" value={data?.totalProducts ?? 0} sub="active SKUs" icon={Package} delay={0} />
            <StatCard title="Units in stock" value={data?.totalUnits ?? 0} sub="across all products" icon={Boxes} delay={80} />
            <StatCard title="Low stock alerts" value={data?.lowStockCount ?? 0} sub="products need attention" icon={AlertTriangle} delay={160} variant="warning" />
          </>
        )}
      </div>

      {/* Low stock table */}
      <Card className="animate-fade-in" style={{ animationDelay: "240ms" }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Low stock items</CardTitle>
            <CardDescription className="mt-1">
              Products at or below their reorder threshold
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/products">
              View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : data?.lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <p className="font-medium">All stocked up!</p>
              <p className="text-sm text-muted-foreground mt-1">No products are running low right now.</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Product</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">SKU</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-3">Qty</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Threshold</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.lowStockItems.map((p, i) => (
                    <tr key={p.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                      <td className="px-4 py-3">
                        <Link href={`/products/${p.id}`} className="font-medium hover:text-primary transition-colors">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{p.sku}</code>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={p.quantityOnHand === 0 ? "destructive" : "warning"}>
                          {p.quantityOnHand} {p.quantityOnHand === 1 ? "unit" : "units"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                        ≤ {p.effectiveThreshold}
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        {formatCurrency(p.sellingPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
