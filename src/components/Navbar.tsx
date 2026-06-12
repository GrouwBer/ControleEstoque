"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingCart, Package, TrendingUp, ReceiptText, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserMenu } from "@/components/UserMenu"
import { useCart } from "@/contexts/CartContext"

// ── Navigation links ─────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/vendas", label: "Vendas", icon: ReceiptText },
  { href: "/reservas", label: "Reservas", icon: CalendarDays },
] as const

// ── Props ────────────────────────────────────────────────────────────────────

interface NavbarProps {
  cartCount?: number
  user?: {
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  } | null
}

// ── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar({ cartCount = 0, user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleCart, cartState } = useCart()

  // Auto-open drawer on #cart hash
  useEffect(() => {
    if (window.location.hash === "#cart") {
      toggleCart()
      // Clean the hash without page reload
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Use live count from context if available, fall back to prop
  const liveCount = cartState.items?.length ?? cartCount

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-[#faf7f0] dark:bg-[#0d0d0e]",
        "border-b border-border/60",
        "backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
      )}
    >
      <nav className="container-loja flex items-center justify-between h-14">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-accent transition-colors shrink-0"
        >
          <span className="hidden sm:inline">Projeto Loja</span>
          <span className="sm:hidden">PL</span>
        </Link>

        {/* ── Desktop Nav ──────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "touch-target",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* ── Right actions ────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Cart badge */}
          <button
            onClick={toggleCart}
            className={cn(
              "relative inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target"
            )}
            aria-label={`Carrinho de compras, ${liveCount} ${liveCount === 1 ? "item" : "itens"}`}
          >
            <ShoppingCart className="size-5" />
            {liveCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center size-4 rounded-full bg-accent text-[10px] font-bold text-white leading-none">
                {liveCount > 99 ? "99+" : liveCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="ml-1">
            <UserMenu user={user} />
          </div>

          {/* ── Mobile hamburger ─────────────────────────────── */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className={cn(
              "md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-target"
            )}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-[#faf7f0] dark:bg-[#0d0d0e]">
          <div className="container-loja py-2 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    "touch-target",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
