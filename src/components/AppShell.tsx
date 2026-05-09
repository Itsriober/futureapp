import { Link, useLocation } from "@tanstack/react-router";
import { Sparkles, Wallet, DollarSign, User } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { AddItemDialog } from "./AddItemDialog";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_EMOJI, Category } from "@/lib/data";
import { toast } from "sonner";

const tabs = [
  { to: "/app", label: "Wishlist", icon: Sparkles },
  { to: "/app/expenses", label: "Expenses", icon: Wallet },
  { to: "/app/payday", label: "Payday", icon: DollarSign },
  { to: "/app/profile", label: "You", icon: User },
] as const;

interface NewItemInput {
  name: string;
  price: number;
  category: Category;
  priority: number;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const onAdd = async (input: NewItemInput) => {
    if (!user) return;
    const { error } = await supabase.from("wishlist_items").insert({
      user_id: user.id,
      name: input.name,
      price: input.price,
      category: input.category,
      priority: input.priority,
      emoji: CATEGORY_EMOJI[input.category] || "✨",
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Captured!");
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <main className="mx-auto max-w-2xl px-5 pt-8">{children}</main>

      <div className="fixed bottom-24 right-6 z-40">
        <AddItemDialog onAdd={onAdd} fab />
      </div>

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
