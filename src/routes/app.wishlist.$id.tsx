import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, CATEGORY_EMOJI, Category, DbWishlistItem, formatMoney } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ChevronLeft, Trash2, Calendar, Star, Info, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";


export const Route = createFileRoute("/app/wishlist/$id")({
  head: ({ params }) => ({ meta: [{ title: `Item — Listi` }] }),
  component: ItemDetailPage,
});

function ItemDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<DbWishlistItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.from("wishlist_items").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      else setItem(data);
      setLoading(false);
    })();
  }, [user, id]);

  const save = async () => {
    if (!item) return;
    setSaving(true);
    const { error } = await supabase.from("wishlist_items").update(item).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
    }
  };

  const deleteItem = async () => {
    if (!confirm("Are you sure you want to remove this?")) return;
    const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removed");
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
      navigate({ to: "/app" });
    }
  };

  const markPurchased = async () => {
    const { error } = await supabase.from("wishlist_items").update({ status: "purchased" }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF"]
      });
      toast.success("Celebration time! 🎉");

      window.dispatchEvent(new CustomEvent("wishlist-updated"));
      navigate({ to: "/app" });
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading item…</div>;
  if (!item) return <div className="py-20 text-center text-muted-foreground">Item not found.</div>;

  const createdAt = new Date(item.created_at);
  const weeks = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const score = (item.priority * 2) + (weeks * 0.5);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/app" })} className="rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-display text-2xl font-semibold">Edit Want</h1>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <div className="h-24 w-24 rounded-[2rem] bg-accent flex items-center justify-center text-5xl shadow-soft">
          {item.emoji}
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Score Breakdown</p>
          <div className="flex gap-4 text-sm font-medium">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary fill-primary" /> {item.priority * 2} (Priority)</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /> {Math.round(weeks * 10) / 10}w (+{(weeks * 0.5).toFixed(1)})</span>
            <span className="font-bold text-primary">= {score.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} className="h-12 rounded-xl text-lg" />
          </div>
          <div className="space-y-1.5">
            <Label>Estimated Cost (KES)</Label>
            <Input type="number" value={item.price} onChange={(e) => setItem({ ...item, price: Number(e.target.value) || 0 })} className="h-12 rounded-xl text-lg font-medium" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setItem({ ...item, category: c, emoji: CATEGORY_EMOJI[c] })}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    item.category === c ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <span className="mr-1.5">{CATEGORY_EMOJI[c]}</span>{c}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="space-y-1.5">
            <Label className="flex justify-between">
              <span>Priority</span>
              <span className="font-bold text-primary">{item.priority} / 5</span>
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => setItem({ ...item, priority: p })}
                  className={`h-12 flex-1 rounded-xl border text-lg font-bold transition ${
                    item.priority === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground/30"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="flex items-start gap-2 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground italic">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Higher priority items are allocated first. Over time, your score increases to ensure older wants aren't forgotten.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={save} disabled={saving} className="h-14 rounded-full text-lg shadow-pop">
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={markPurchased} className="h-14 rounded-full text-lg text-green-600 border-green-600/20 hover:bg-green-50 gap-2">
            <CheckCircle2 className="h-5 w-5" /> I got it!
          </Button>
          <Button variant="ghost" onClick={deleteItem} className="h-14 rounded-full text-destructive hover:bg-destructive/5 gap-2">
            <Trash2 className="h-5 w-5" /> Remove from list
          </Button>
        </div>
      </div>
    </div>
  );
}
