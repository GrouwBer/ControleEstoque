import { Package, ShoppingCart, Calendar, BarChart3, ClipboardList } from "lucide-react";

const navItems = [
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/vendas", label: "Vendas", icon: ClipboardList },
  { href: "/reservas", label: "Reservas", icon: Calendar },
  { href: "/dashboard", label: "Painel", icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-center justify-around px-2 py-2 safe-bottom">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-text-muted hover:text-accent transition-colors touch-target"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
      {/* Content area (account for bottom nav on mobile) */}
      <div className="pb-20 md:pb-0">{children}</div>
    </>
  );
}
