import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ChevronRight, Calendar, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "History — Listi" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch cycles with their allocations and items
      const { data, error } = await (supabase
        .from("payday_cycles" as any)
        .select(`
          *,
          cycle_allocations (
            status,
            wishlist_items (
              name,
              emoji,
              price
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as any);

      if (error) console.error(error);
      else setCycles(data || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading history…</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <p className="text-sm uppercase tracking-wider text-muted-foreground">The Journey</p>
        <h1 className="font-display text-4xl font-semibold">Spending History</h1>
        <p className="mt-2 text-muted-foreground">A record of every payday win and disciplined deferral.</p>
      </div>

      <div className="space-y-4">
        {cycles.map((cycle) => {
          const date = new Date(cycle.cycle_month);
          const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          const allocatedCount = cycle.cycle_allocations?.length || 0;
          const purchasedCount = cycle.cycle_allocations?.filter((a: any) => a.status === 'purchased').length || 0;

          return (
            <div key={cycle.id} className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-soft space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{monthYear}</h3>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Payday Cycle</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{formatMoney(cycle.salary_amount)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Salary In</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/40">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Fixed</p>
                  <p className="text-sm font-semibold flex items-center justify-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-destructive" /> {formatMoney(cycle.total_deductions)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Savings</p>
                  <p className="text-sm font-semibold flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> {formatMoney(cycle.savings_amount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Allocated</p>
                  <p className="text-sm font-semibold flex items-center justify-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-green-500" /> {formatMoney(cycle.discretionary_balance)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Items Funded ({allocatedCount})</h4>
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">
                    {purchasedCount} / {allocatedCount} Purchased
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cycle.cycle_allocations?.map((alloc: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-xl text-sm">
                      <span>{alloc.wishlist_items?.emoji}</span>
                      <span className="truncate max-w-[120px] font-medium">{alloc.wishlist_items?.name}</span>
                      {alloc.status === 'purchased' && <span className="text-green-500 font-bold">✓</span>}
                    </div>
                  ))}
                  {allocatedCount === 0 && (
                    <p className="text-xs text-muted-foreground italic">No items were allocated this cycle.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {cycles.length === 0 && (
          <div className="py-20 text-center rounded-3xl border border-dashed border-border">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h2 className="font-display text-xl">No history yet</h2>
            <p className="text-sm text-muted-foreground">Your payday cycles will appear here once you run them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
