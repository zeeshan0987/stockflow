"use client";
import { useEffect, useState } from "react";
import { Loader2, Save, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import type { Organization } from "@/types";

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [threshold, setThreshold] = useState("");

  useEffect(() => {
    api.getSettings()
      .then(data => {
        setOrg(data);
        setThreshold(data.defaultLowStockThreshold.toString());
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const value = parseInt(threshold);
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid non-negative number");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateSettings({ defaultLowStockThreshold: value });
      setOrg(updated);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your organization preferences</p>
      </div>

      {/* Org info */}
      <Card className="animate-fade-in" style={{ animationDelay: "60ms" }}>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Organization</CardTitle>
            <CardDescription>Your workspace details</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-1">Name</p>
                <p className="font-semibold text-lg">{org?.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-1">Organization ID</p>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{org?.id}</code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory settings */}
      <Card className="animate-fade-in" style={{ animationDelay: "120ms" }}>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-warning" />
          </div>
          <div>
            <CardTitle className="text-base">Inventory settings</CardTitle>
            <CardDescription>Global defaults applied to all products</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Default low stock threshold</Label>
              <div className="flex gap-3">
                {loading ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  <Input
                    id="threshold"
                    type="number"
                    min={0}
                    value={threshold}
                    onChange={e => setThreshold(e.target.value)}
                    className="w-32 font-mono"
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Products with no individual threshold set will use this value.
                A product is flagged as &ldquo;low stock&rdquo; when its quantity ≤ this number.
              </p>
            </div>
            <Button type="submit" disabled={saving || loading}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
