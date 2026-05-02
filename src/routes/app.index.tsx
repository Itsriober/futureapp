import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_EMOJI, Category, DbWishlistItem } from "@/lib/data";
import { WishlistCard } from "@/components/WishlistCard";
import { AddItemDialog, NewItemInput } from "@/components/AddItemDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Wishlist — FutureFlow" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DbWishlistItem[]>([]);
  const [filter, setFilter] = useState<Category | "All">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("status", "active")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error) toast.error(error.message);
      else setItems(data ?? []);
      setLoading(false);
    })();
    return () => { alive = false; };
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
    if (error) return toast.error(error.message);
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
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Your wishlist</p>
          <h1 className="font-display text-4xl font-semibold">What you want</h1>
        </div>
        <AddItemDialog onAdd={onAdd} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              filter === c ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">Loading your wants…</div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <p className="text-4xl">✨</p>
            <h2 className="mt-3 font-display text-2xl">Capture your first want</h2>
            <p className="mt-1 text-sm text-muted-foreground">A gadget, a trip, a dinner — anything you've been thinking about.</p>
          </div>
        ) : (
          visible.map((it) => <WishlistCard key={it.id} item={it} onPriority={onPriority} onDelete={onDelete} />)
        )}
      </div>
    </div>
  );
}
