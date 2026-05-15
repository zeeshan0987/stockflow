"use client";
import { useState } from "react";
import { ArrowUpDown, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  onUpdated: (p: Product) => void;
}

export function StockAdjustDialog({ product, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState<number>(1);
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveDelta = direction === "add" ? delta : -delta;
  const newQty = Math.max(0, product.quantityOnHand + effectiveDelta);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (delta === 0) return;
    setLoading(true);
    try {
      const res = await api.adjustStock(product.id, effectiveDelta, note || undefined);
      onUpdated(res.product);
      toast.success(`Stock updated → ${res.product.quantityOnHand} units`);
      setOpen(false);
      setDelta(1);
      setNote("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{product.name}</span>
            {" — "}current stock: <strong>{product.quantityOnHand}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Direction toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setDirection("add")}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                direction === "add" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}
            >
              <Plus className="h-4 w-4" /> Add stock
            </button>
            <button
              type="button"
              onClick={() => setDirection("remove")}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                direction === "remove" ? "bg-destructive text-destructive-foreground" : "hover:bg-muted text-muted-foreground")}
            >
              <Minus className="h-4 w-4" /> Remove stock
            </button>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex gap-2 items-center">
              <Button type="button" variant="outline" size="icon" onClick={() => setDelta(d => Math.max(1, d - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                value={delta}
                onChange={e => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center font-mono text-lg font-bold"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setDelta(d => d + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              New quantity: <span className="font-semibold text-foreground">{newQty}</span>
              {" "}
              <span className={cn("text-xs", effectiveDelta > 0 ? "text-success" : "text-destructive")}>
                ({effectiveDelta > 0 ? "+" : ""}{effectiveDelta})
              </span>
            </p>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="note" placeholder="e.g. Received shipment" value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || delta === 0}
              variant={direction === "remove" ? "destructive" : "default"}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
