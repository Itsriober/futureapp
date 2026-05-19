import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DbWishlistItem, DbBudget, DbFixedExpense, formatMoney, suggestPurchases } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, DollarSign, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/payday")({
  head: () => ({ meta: [{ title: "Payday — Listi" }] }),
  component: PaydayPage,
});

function PaydayPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"input" | "reveal" | "result">("input");
  const [salaryOverride, setSalaryOverride] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [cycleId, setCycleId] = useState<string | null>(null);

  const { data: budget, isLoading: loadingBudget } = useQuery<DbBudget | null>({
    queryKey: ["budget", userId],
    queryFn: async () => {
      const r = await supabase.from("budgets").select("*").eq("user_id", userId).maybeSingle();
      return (r.data ?? null) as DbBudget | null;
    },
    enabled: !!userId,
  });

  const { data: fixed = [], isLoading: loadingFixed } = useQuery<DbFixedExpense[]>({
    queryKey: ["expenses", userId],
    queryFn: async () => {
      const r = await supabase.from("fixed_expenses").select("*").eq("user_id", userId);
      return (r.data ?? []) as DbFixedExpense[];
    },
    enabled: !!userId,
  });

  const { data: items = [], isLoading: loadingItems } = useQuery<DbWishlistItem[]>({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      const r = await supabase.from("wishlist_items").select("*").eq("user_id", userId).eq("status", "active");
      return (r.data ?? []) as DbWishlistItem[];
    },
    enabled: !!userId,
  });

  const loading = loadingBudget || loadingFixed || loadingItems;

  const derivedSalary = Number(budget?.salary ?? 0);
  const salary = salaryOverride ?? derivedSalary;
  const setSalary = (n: number) => setSalaryOverride(n);

  const { fixedExpenses, savingsLock } = useMemo(() => {
    if (fixed.length === 0 && budget) {
      const legacy = [
        { name: "Rent", amount: Number(budget.rent) },
        { name: "Bills", amount: Number(budget.bills) },
        { name: "Subscriptions", amount: Number(budget.subscriptions) },
      ].filter(i => i.amount > 0);
      return { fixedExpenses: legacy, savingsLock: 0 };
    }
    const fe = fixed.filter(f => !f.is_savings).map(f => ({ name: f.name, amount: Number(f.amount) }));
    const sl = fixed.filter(f => f.is_savings).reduce((acc, curr) => acc + Number(curr.amount), 0);
    return { fixedExpenses: fe, savingsLock: sl };
  }, [fixed, budget]);

  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const discretionary = Math.max(0, salary - totalFixed - savingsLock);
  const { picked } = suggestPurchases(items, discretionary);

  const startAllocation = () => {
    if (salary <= 0) { toast.error("Please enter your salary first"); return; }
    setStep("reveal");
  };

  const saveCycle = async () => {
    if (!user) return;
    setSaving(true);

    // 1. Save the cycle record
    const { data: cycle, error: cErr } = await supabase.from("payday_cycles").insert({
      user_id: user.id,
      salary_amount: salary,
      total_deductions: totalFixed,
      savings_amount: savingsLock,
      discretionary_balance: discretionary,
      cycle_month: new Date().toISOString().split('T')[0]
    }).select().single();

    if (cErr || !cycle) { toast.error(cErr?.message ?? "Failed to save cycle"); setSaving(false); return; }
    setCycleId(cycle.id);

    // 2. Save allocations
    const allocations = picked.map(it => ({ cycle_id: cycle.id, wishlist_item_id: it.id, status: 'allocated' }));
    if (allocations.length > 0) {
      const { error: aErr } = await supabase.from("cycle_allocations").insert(allocations);
      if (aErr) toast.error(aErr.message);
    }

    // 3. Update streak
    const { data: lastCycle } = await supabase.from("payday_cycles")
      .select("cycle_month")
      .eq("user_id", user.id)
      .neq("id", cycle.id)
      .order("cycle_month", { ascending: false })
      .limit(1)
      .maybeSingle();

    let newStreak = 1;
    if (lastCycle?.cycle_month) {
      const lastDate = new Date(lastCycle.cycle_month);
      const gapDays = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      const { data: profile } = await supabase.from("profiles").select("streak").eq("user_id", user.id).maybeSingle();
      newStreak = gapDays <= 35 ? (Number(profile?.streak ?? 0) + 1) : 1;
    }
    await supabase.from("profiles").update({ streak: newStreak }).eq("user_id", user.id);

    setSaving(false);
    toast.success("Payday cycle recorded! 🎊");
    queryClient.invalidateQueries({ queryKey: ["cycles", userId] });
    queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
    setStep("result");
  };

  const markBought = async (item: DbWishlistItem) => {
    const { error } = await supabase.from("wishlist_items").update({ status: "purchased" }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }

    // Update allocation status
    if (cycleId) {
      await supabase.from("cycle_allocations").update({ status: "purchased" })
        .eq("cycle_id", cycleId).eq("wishlist_item_id", item.id);
    }

    setPurchasedIds(prev => new Set([...prev, item.id]));
    toast.success(`${item.name} marked as bought! 🎉`);
    queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
    window.dispatchEvent(new CustomEvent("wishlist-updated"));
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>
  );

  if (step === "input") {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">The Monthly Moment</p>
          <h1 className="font-display text-4xl font-semibold">It's Payday! 💸</h1>
          <p className="mt-2 text-muted-foreground">Confirm your take-home pay to start the allocation magic.</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="salary">Monthly Salary (KES)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="salary"
                type="number"
                value={salary || ""}
                onChange={(e) => setSalary(Number(e.target.value) || 0)}
                className="pl-9 rounded-2xl h-12 text-lg font-medium"
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Locked Commitments</h3>
            <div className="space-y-2">
              {fixedExpenses.map((exp, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{exp.name}</span>
                  <span className="font-medium">{formatMoney(exp.amount)}</span>
                </div>
              ))}
              {savingsLock > 0 && (
                <div className="flex justify-between text-sm text-primary font-medium">
                  <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Savings</span>
                  <span>{formatMoney(savingsLock)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border/20 font-semibold">
                <span>Total Deductions</span>
                <span>{formatMoney(totalFixed + savingsLock)}</span>
              </div>
            </div>
          </div>

          <Button onClick={startAllocation} className="w-full rounded-full h-12 text-lg bg-gradient-warm hover:opacity-90 border-none shadow-pop mt-4">
            Run Allocation <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === "reveal") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Sparkles className="h-16 w-16 text-primary relative animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-semibold animate-slide-up">Crunching the numbers…</h2>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "0.5s" }}>
            Prioritizing {items.length} desires against {formatMoney(discretionary)} balance.
          </p>
        </div>
        <Button variant="ghost" onClick={saveCycle} disabled={saving} className="animate-fade-in" style={{ animationDelay: "2s" }}>
          {saving ? "Saving..." : "See Results"}
        </Button>
        <AutoReveal onComplete={saveCycle} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Your Plan</p>
          <h1 className="font-display text-4xl font-semibold">Ready to Spend</h1>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Discretionary</p>
          <p className="text-2xl font-display font-bold text-primary">{formatMoney(discretionary)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-foreground text-background p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wider opacity-70">Buy This Month</p>
          <p className="font-display text-3xl font-semibold">{picked.length}</p>
        </div>
        <div className="rounded-3xl bg-card border border-border/60 p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Deferred</p>
          <p className="font-display text-3xl font-semibold text-muted-foreground">{items.length - picked.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold">Buy This Month</h3>
        <div className="space-y-3">
          {picked.map((it) => {
            const bought = purchasedIds.has(it.id);
            return (
              <article key={it.id} className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-soft animate-scale-in">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl">{it.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{it.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {(it as any).score?.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatMoney(Number(it.price))} · {it.category}</p>
                </div>
                <Button
                  size="sm"
                  variant={bought ? "default" : "outline"}
                  onClick={() => !bought && markBought(it)}
                  disabled={bought}
                  className="rounded-full h-10 px-4 shrink-0"
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> {bought ? "Bought!" : "Buy"}
                </Button>
              </article>
            );
          })}
          {picked.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Nothing fits this month's budget.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button variant="ghost" onClick={() => setStep("input")} className="w-full rounded-full">
          Adjust Salary or Expenses
        </Button>
      </div>
    </div>
  );
}

function AutoReveal({ onComplete }: { onComplete: () => void }) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => onCompleteRef.current(), 3000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
