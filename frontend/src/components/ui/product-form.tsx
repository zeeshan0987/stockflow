'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import type { Product } from '@/types'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ProductFormProps {
  product?: Product
  mode: 'create' | 'edit'
}

type FormData = {
  name: string
  sku: string
  description: string
  quantityOnHand: string
  costPrice: string
  sellingPrice: string
  lowStockThreshold: string
}

function toForm(p?: Product): FormData {
  return {
    name: p?.name ?? '',
    sku: p?.sku ?? '',
    description: p?.description ?? '',
    quantityOnHand: String(p?.quantityOnHand ?? 0),
    costPrice: p?.costPrice != null ? String(p.costPrice) : '',
    sellingPrice: p?.sellingPrice != null ? String(p.sellingPrice) : '',
    lowStockThreshold: p?.lowStockThreshold != null ? String(p.lowStockThreshold) : '',
  }
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>(toForm(product))

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const buildPayload = () => ({
    name: form.name.trim(),
    sku: form.sku.trim(),
    description: form.description.trim() || undefined,
    quantityOnHand: parseInt(form.quantityOnHand) || 0,
    costPrice: form.costPrice !== '' ? parseFloat(form.costPrice) : null,
    sellingPrice: form.sellingPrice !== '' ? parseFloat(form.sellingPrice) : null,
    lowStockThreshold: form.lowStockThreshold !== '' ? parseInt(form.lowStockThreshold) : null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.sku.trim()) {
      toast.error('Name and SKU are required')
      return
    }
    setLoading(true)
    try {
      if (mode === 'create') {
        await api.products.create(buildPayload())
        toast.success('Product created!')
      } else if (product) {
        await api.products.update(product.id, buildPayload())
        toast.success('Product updated!')
      }
      router.push('/products')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Add product' : 'Edit product'}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {mode === 'create' ? 'Create a new product in your inventory' : `Editing ${product?.name}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic information</CardTitle>
            <CardDescription>Name and SKU are required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Product name *</Label>
                <Input id="name" placeholder="Blue T-Shirt (M)" required value={form.name} onChange={set('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" placeholder="TSH-BLU-M" required value={form.sku} onChange={set('sku')}
                  className="font-mono uppercase"
                  onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase() }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity on hand</Label>
                <Input id="qty" type="number" min={0} placeholder="0" value={form.quantityOnHand} onChange={set('quantityOnHand')} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="desc">Description <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="desc" placeholder="Brief description of the product" value={form.description} onChange={set('description')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
            <CardDescription>Both fields are optional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="selling">Selling price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input id="selling" type="number" step="0.01" min={0} placeholder="0.00" className="pl-7"
                    value={form.sellingPrice} onChange={set('sellingPrice')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input id="cost" type="number" step="0.01" min={0} placeholder="0.00" className="pl-7"
                    value={form.costPrice} onChange={set('costPrice')} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory settings</CardTitle>
            <CardDescription>Leave blank to use the global default threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="threshold">Low stock threshold</Label>
              <Input id="threshold" type="number" min={0} placeholder="Uses global default"
                value={form.lowStockThreshold} onChange={set('lowStockThreshold')} />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
