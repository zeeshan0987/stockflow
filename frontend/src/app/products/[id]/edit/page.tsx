"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { ProductForm } from "../../ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch(() => toast.error("Product not found"));
  }, [id]);

  if (!product) return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );

  return <ProductForm mode="edit" initial={product} />;
}
