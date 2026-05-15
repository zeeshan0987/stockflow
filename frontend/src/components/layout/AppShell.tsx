"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Settings, LogOut,
  Menu, X, Boxes, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products",  label: "Products",  icon: Package },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Boxes className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">StockFlow</span>
          <Button
            variant="ghost" size="icon"
            className="ml-auto lg:hidden h-7 w-7"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Org name */}
        {user && (
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-2 mb-1">Organization</p>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-muted/50">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {user.organization.name[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate">{user.organization.name}</span>
            </div>
          </div>
        )}

        <Separator className="mx-4 mt-2 w-auto" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-2 mb-2">Menu</p>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 mb-1">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive gap-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center border-b px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 ml-3">
            <Boxes className="h-4 w-4 text-primary" />
            <span className="font-semibold">StockFlow</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
