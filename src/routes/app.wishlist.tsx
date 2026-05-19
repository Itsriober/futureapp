import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_COLOR, Category, DbWishlistItem } from "@/lib/data";
import { WishlistCard } from "@/components/WishlistCard";
import { AddItemDialog, NewItemInput } from "@/components/AddItemDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Listi" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DbWishlistItem[]>([]);
  const [filter, setFilter] = useState<Category | "All">("All");
  const [loading, setLoading] = useState(true);
  const [freeBalance, setFreeBalance] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setItems(data ?? []);
      setLoading(false);
    };

    fetchItems();

    // Fetch free balance for affordability chips
    (async () => {
      const [{ data: budget }, { data: exps }] = await Promise.all([
        supabase.from("budgets").select("salary").eq("user_id", user.id).maybeSingle(),
        (supabase.from("fixed_expenses" as any).select("amount,is_savings").eq("user_id", user.id) as any),
      ]);
      if (budget) {
        const totalOut = (exps ?? []).reduce((acc: number, e: any) => acc + Number(e.amount), 0);
        setFreeBalance(Math.max(0, Number(budget.salary) - totalOut));
      }
    })();

    window.addEventListener("wishlist-updated", fetchItems);
    return () => window.removeEventListener("wishlist-updated", fetchItems);
  }, [user]);

  const visible = useMemo(
    () => (filter === "All" ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  );

  const onAdd = async (input: NewItemInput) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("wishlist_items")
      .insert({
        user_id: user.id,
        name: input.name,
        price: input.price,
        category: input.category,
        priority: input.priority,
        emoji: CATEGORY_EMOJI[input.category],
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    toast.success(`${input.name} added ✓`);
    setItems((prev) => [data!, ...prev]);
  };

  const onPriority = async (id: string, delta: number) => {
    const cur = items.find((i) => i.id === id);
    if (!cur) return;
    const next = Math.min(5, Math.max(1, cur.priority + delta));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, priority: next } : i)));
    const { error } = await supabase.from("wishlist_items").update({ priority: next }).eq("id", id);
    if (error) toast.error(error.message);
  };

  const onDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
    if (error) toast.error(error.message);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Your wishlist</p>
          <h1 className="font-display text-4xl font-semibold">What you want</h1>
        </div>
        <AddItemDialog onAdd={onAdd} />
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((c) => {
          const colorClass = c !== "All" ? CATEGORY_COLOR[c as Category] : "";
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                filter === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground/30"
              )}
            >
              {c !== "All" && (
                <span className={cn("h-2 w-2 rounded-full", colorClass)} />
              )}
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-3xl" />
            ))}
          </>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <svg className="mx-auto h-16 w-16 text-muted-foreground/30" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="12" y="8" width="40" height="48" rx="4" />
              <line x1="20" y1="20" x2="44" y2="20" />
              <line x1="20" y1="28" x2="44" y2="28" />
              <line x1="20" y1="36" x2="36" y2="36" />
              <circle cx="46" cy="46" r="8" />
              <line x1="43" y1="46" x2="49" y2="46" />
              <line x1="46" y1="43" x2="46" y2="49" />
            </svg>
            <h2 className="mt-3 font-display text-2xl">Capture your first want</h2>
            <p className="mt-1 text-sm text-muted-foreground">A gadget, a trip, a dinner — anything you've been thinking about.</p>
          </div>
        ) : (
          visible.map((it, idx) => (
            <WishlistCard
              key={it.id}
              item={it}
              freeBalance={freeBalance}
              onPriority={onPriority}
              onDelete={onDelete}
              animationDelay={idx * 50}
            />
          ))
        )}
      </div>
    </div>
  );
}
