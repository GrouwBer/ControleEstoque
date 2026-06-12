"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingCart, Package, TrendingUp, ReceiptText, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserMenu } from "@/components/UserMenu"
import { useCart } from "@/contexts/CartContext"

const NAV_LINKS = [
  { href: "/dashboard", label: "Painel", icon: TrendingUp },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/vendas", label: "Vendas", icon: ReceiptText },
  { href: "/reservas", label: "Reservas", icon: CalendarDays },
] as const

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleCart, cartState } = useCart()
  const liveCount = cartState.items?.length ?? 0

  useEffect(() => {
    if (window.location.hash === "#cart") {
      toggleCart()
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }
  }, [])

  return (
    <header
      className="sticky top-0 z-50 w-full bg-canvas/95 backdrop-blur-sm border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <nav className="container-loja flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg shrink-0"
          style={{ color: "var(--text-primary)" }}
        >
          <span className="hidden sm:inline">Projeto Loja</span>
          <span className="sm:hidden font-bold">PL</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-medium transition-colors touch-target",
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                )}
                style={{ fontSize: "15px" }}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative inline-flex items-center justify-center rounded-md p-2 transition-colors touch-target"
            style={{ color: "var(--text-secondary)" }}
            aria-label={`Carrinho de compras, ${liveCount} ${liveCount === 1 ? "item" : "itens"}`}
          >
            <ShoppingCart className="size-5" />
            {liveCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center size-4 rounded-full text-[10px] font-bold text-white leading-none"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {liveCount > 99 ? "99+" : liveCount}
              </span>
            )}
          </button>

          <ThemeToggle />
          <div className="ml-1"><UserMenu user={user} /></div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 transition-colors touch-target"
            style={{ color: "var(--text-secondary)" }}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-canvas)" }}>
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
                    "inline-flex items-center gap-3 rounded-md px-3 py-3 font-medium transition-colors touch-target",
                    isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                  )}
                  style={{ fontSize: "16px" }}
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
