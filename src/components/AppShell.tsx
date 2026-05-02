import { Link, useLocation } from "@tanstack/react-router";
import { Home, Wallet, Sparkles, User } from "lucide-react";
import { ReactNode } from "react";

const tabs = [
  { to: "/app", label: "Wishlist", icon: Sparkles },
  { to: "/app/budget", label: "Budget", icon: Wallet },
  { to: "/app/suggestions", label: "Today", icon: Home },
  { to: "/app/profile", label: "You", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen pb-28">
      <main className="mx-auto max-w-2xl px-5 pt-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[min(92%,28rem)]">
        <div className="rounded-3xl border border-border/60 bg-card/90 p-2 shadow-pop backdrop-blur">
          <ul className="grid grid-cols-4">
            {tabs.map((t) => {
              const active = pathname === t.to || (t.to !== "/app" && pathname.startsWith(t.to));
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
