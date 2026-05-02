import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, Category, useWishlist, WishlistItem } from "@/lib/storage";
import { WishlistCard } from "@/components/WishlistCard";
import { AddItemDialog } from "@/components/AddItemDialog";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Wishlist — FutureFlow" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const [items, setItems] = useWishlist();
  const [filter, setFilter] = useState<Category | "All">("All");

  const visible = useMemo(() => {
    const active = items.filter((i) => i.status === "active");
    const filtered = filter === "All" ? active : active.filter((i) => i.category === filter);
    return [...filtered].sort((a, b) => b.priority - a.priority || b.createdAt - a.createdAt);
  }, [items, filter]);

  const onAdd = (item: WishlistItem) => setItems((prev) => [item, ...prev]);
  const onPriority = (id: string, delta: number) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, priority: Math.min(5, Math.max(1, i.priority + delta)) } : i));
  const onDelete = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

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
        {visible.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center">
            <p className="text-4xl">✨</p>
            <h2 className="mt-3 font-display text-2xl">Capture your first want</h2>
            <p className="mt-1 text-sm text-muted-foreground">Anything you've been thinking about — a gadget, a trip, a dinner.</p>
          </div>
        ) : (
          visible.map((it) => <WishlistCard key={it.id} item={it} onPriority={onPriority} onDelete={onDelete} />)
        )}
      </div>
    </div>
  );
}
