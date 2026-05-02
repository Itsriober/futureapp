import { createFileRoute, Link } from "@tanstack/react-router";
import { formatMoney, freeMoney, suggestPurchases, useBudget, useWishlist } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/suggestions")({
  head: () => ({ meta: [{ title: "Today — FutureFlow" }] }),
  component: SuggestionsPage,
});

function SuggestionsPage() {
  const [budget] = useBudget();
  const [items, setItems] = useWishlist();
  const free = freeMoney(budget);
  const { picked, remaining } = suggestPurchases(items, free);

  const markPurchased = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "purchased" } : i)));

  return (
    <div>
      <p className="text-sm uppercase tracking-wider text-muted-foreground">Suggested for you</p>
      <h1 className="font-display text-4xl font-semibold">Spend with intention</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Free Money" value={formatMoney(free)} />
        <Stat label="Left after picks" value={formatMoney(remaining)} accent />
      </div>

      <div className="mt-6 space-y-3">
        {free === 0 ? (
          <Empty title="Set your budget first" body="We need your income and fixed costs to suggest what fits." cta={<Link to="/app/budget"><Button className="rounded-full">Open budget</Button></Link>} />
        ) : picked.length === 0 ? (
          <Empty title="Nothing fits yet" body="Add a few wishlist items or lower a price — we'll find the best picks for this cycle." cta={<Link to="/app"><Button className="rounded-full">Add wants</Button></Link>} />
        ) : (
          picked.map((it) => (
            <article key={it.id} className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl">{it.emoji}</div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{it.name}</h3>
                <p className="text-sm text-muted-foreground">{formatMoney(it.price)} · {it.category}</p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => markPurchased(it.id)}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Got it
              </Button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-3xl p-5 shadow-soft ${accent ? "bg-foreground text-background" : "bg-card border border-border/60"}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Empty({ title, body, cta }: { title: string; body: string; cta: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-10 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      <div className="mt-4">{cta}</div>
    </div>
  );
}
