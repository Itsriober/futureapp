import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, CATEGORY_EMOJI, Category, DbWishlistItem, formatMoney, getCountdown } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ChevronLeft, Star, Calendar, Info, CheckCircle2, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/wishlist/$id")({
  head: () => ({ meta: [{ title: "Item — Listi" }] }),
  component: ItemDetailPage,
});

function ItemDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localItem, setLocalItem] = useState<DbWishlistItem | null>(null);

  const { data: fetchedItem, isLoading } = useQuery<DbWishlistItem | null>({
    queryKey: ["wishlist-item", id],
    queryFn: async () => {
      const r = await supabase.from("wishlist_items").select("*").eq("id", id).maybeSingle();
      if (r.error) throw r.error;
      return (r.data ?? null) as DbWishlistItem | null;
    },
    enabled: !!id,
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      const r = await supabase.from("wishlist_items").select("*").eq("user_id", userId).eq("status", "active").order("priority", { ascending: false }).order("created_at", { ascending: false });
      return (r.data ?? []) as DbWishlistItem[];
    },
    enabled: !!userId,
  });

  // Sync local edit buffer from query result
  useEffect(() => {
    if (fetchedItem) setLocalItem(fetchedItem);
  }, [fetchedItem]);

  const item = localItem;
  const setItem = setLocalItem as (i: DbWishlistItem) => void;

  const maxScore = allItems.reduce((acc, it) => {
    const weeks = Math.max(0, (Date.now() - new Date(it.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7));
    return Math.max(acc, (it.priority * 2) + (weeks * 0.5));
  }, 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!item) return;
      const r = await supabase.from("wishlist_items").update({
        name: item.name,
        price: item.price,
        category: item.category,
        priority: item.priority,
        emoji: item.emoji,
        target_date: item.target_date,
      }).eq("id", id);
      if (r.error) throw r.error;
    },
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-item", id] });
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const r = await supabase.from("wishlist_items").delete().eq("id", id);
      if (r.error) throw r.error;
    },
    onSuccess: () => {
      toast.success("Removed");
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-item", id] });
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
      navigate({ to: "/app/wishlist" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const r = await supabase.from("wishlist_items").update({ status: "purchased" }).eq("id", id);
      if (r.error) throw r.error;
    },
    onSuccess: () => {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF"] });
      toast.success("Celebration time! 🎉");
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist-item", id] });
      window.dispatchEvent(new CustomEvent("wishlist-updated"));
      navigate({ to: "/app/wishlist" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const save = () => saveMutation.mutate();
  const deleteItem = () => deleteMutation.mutate();
  const markPurchased = () => purchaseMutation.mutate();
  const saving = saveMutation.isPending;

  if (isLoading) return <ItemDetailSkeleton />;
  if (!item) return <div className="py-20 text-center text-muted-foreground">Item not found.</div>;

  const createdAt = new Date(item.created_at);
  const weeks = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const score = (item.priority * 2) + (weeks * 0.5);
  const scoreBarPct = maxScore > 0 ? Math.min(100, (score / maxScore) * 100) : 0;
  const countdown = getCountdown(item.target_date);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/app/wishlist" })} className="rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-display text-2xl font-semibold">Edit Want</h1>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <div className="h-24 w-24 rounded-[2rem] bg-accent flex items-center justify-center text-5xl shadow-soft">
          {item.emoji}
        </div>
        <div className="text-center w-full max-w-xs">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">Score Breakdown</p>
          <div className="flex gap-4 justify-center text-sm font-medium mb-3">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary fill-primary" /> {item.priority * 2} (Priority)</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /> {Math.round(weeks * 10) / 10}w (+{(weeks * 0.5).toFixed(1)})</span>
            <span className="font-bold text-primary">= {score.toFixed(1)}</span>
          </div>
          {maxScore > 0 && (
            <div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${scoreBarPct}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Relative to your highest-scored item</p>
            </div>
          )}
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
                  className={cn("rounded-full border px-4 py-2 text-sm transition",
                    item.category === c ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-foreground/30"
                  )}
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
                  className={cn("h-12 flex-1 rounded-xl border text-lg font-bold transition",
                    item.priority === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground/30"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> I want this by (optional)
            </Label>
            <Input
              type="date"
              value={item.target_date ?? ""}
              onChange={(e) => setItem({ ...item, target_date: e.target.value || null })}
              className="rounded-xl h-12"
            />
            {countdown && (
              <p className={cn("text-sm font-medium",
                countdown.variant === "overdue" && "text-red-500",
                countdown.variant === "warning" && "text-amber-500",
                countdown.variant === "normal" && "text-muted-foreground",
              )}>
                {countdown.label}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground italic">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Higher priority items are allocated first. Over time, your score increases to ensure older wants aren't forgotten.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={save} disabled={saving} className="h-14 rounded-full text-lg shadow-pop">
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={markPurchased} className="h-14 rounded-full text-lg text-green-600 border-green-600/20 hover:bg-green-50 gap-2">
            <CheckCircle2 className="h-5 w-5" /> I got it!
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="h-14 rounded-full text-destructive hover:bg-destructive/5 gap-2">
                <Trash2 className="h-5 w-5" /> Remove from list
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2rem]">
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this want?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{item.name}" will be permanently removed from your wishlist.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteItem} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function ItemDetailSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col items-center gap-4 py-6">
        <Skeleton className="h-24 w-24 rounded-[2rem]" />
        <Skeleton className="h-12 w-60" />
      </div>
      <Skeleton className="h-48 w-full rounded-3xl" />
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}
