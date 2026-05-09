import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DbWishlistItem, formatMoney, suggestPurchases } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronRight, DollarSign, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/payday")({
  head: () => ({ meta: [{ title: "Payday — Listi" }] }),
  component: PaydayPage,
});

function PaydayPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<"input" | "reveal" | "result">("input");
  const [salary, setSalary] = useState<number>(0);
  const [fixedExpenses, setFixedExpenses] = useState<{ name: string; amount: number; is_savings?: boolean }[]>([]);
  const [savingsLock, setSavingsLock] = useState<number>(0);
  const [items, setItems] = useState<DbWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [
        { data: budget },
        { data: fixed },
        { data: list }
      ] = await Promise.all([
        supabase.from("budgets").select("*").eq("user_id", user.id).maybeSingle(),
        (supabase.from("fixed_expenses" as any).select("*").eq("user_id", user.id) as any),
        supabase.from("wishlist_items").select("*").eq("status", "active"),
      ]);

      if (budget) {
        setSalary(Number(budget.salary));
        if (!fixed || fixed.length === 0) {
          const legacy = [
            { name: "Rent", amount: Number(budget.rent), is_savings: false },
            { name: "Bills", amount: Number(budget.bills), is_savings: false },
            { name: "Subscriptions", amount: Number(budget.subscriptions), is_savings: false },
          ].filter(i => i.amount > 0);
          setFixedExpenses(legacy);
        } else {
          setFixedExpenses(fixed.filter((f: any) => !f.is_savings).map((f: any) => ({ name: f.name, amount: Number(f.amount), is_savings: false })));
          const savings = fixed.filter((f: any) => f.is_savings).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
          setSavingsLock(savings);
        }
      }
      setItems(list ?? []);
      setLoading(false);
    })();
  }, [user]);

  const totalFixed = fixedExpenses.filter(e => !e.is_savings).reduce((acc, curr) => acc + curr.amount, 0);
  const discretionary = Math.max(0, salary - totalFixed - savingsLock);
  const { picked, remaining } = suggestPurchases(items, discretionary);

  const startAllocation = () => {
    if (salary <= 0) {
      toast.error("Please enter your salary first");
      return;
    }
    setStep("reveal");
  };

  const saveCycle = async () => {
    if (!user) return;
    setSaving(true);
    
    // 1. Save the cycle record
    const { data: cycle, error: cErr } = await (supabase.from("payday_cycles" as any).insert({
      user_id: user.id,
      salary_amount: salary,
      total_deductions: totalFixed,
      savings_amount: savingsLock,
      discretionary_balance: discretionary,
      cycle_month: new Date().toISOString().split('T')[0]
    }).select().single() as any);

    if (cErr) {
      toast.error(cErr.message);
      setSaving(false);
      return;
    }

    // 2. Save the allocations
    const allocations = picked.map(it => ({
      cycle_id: cycle.id,
      wishlist_item_id: it.id,
      status: 'allocated'
    }));

    if (allocations.length > 0) {
      const { error: aErr } = await (supabase.from("cycle_allocations" as any).insert(allocations) as any);
      if (aErr) toast.error(aErr.message);
    }

    setSaving(false);
    toast.success("Payday cycle recorded! 🎊");
    setStep("result");
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Preparing your payday…</div>;

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
        <Button 
          variant="ghost" 
          onClick={saveCycle}
          disabled={saving}
          className="animate-fade-in"
          style={{ animationDelay: "2s" }}
        >
          {saving ? "Saving..." : "See Results"}
        </Button>
        {/* Auto transition after delay */}
        <AutoReveal onComplete={saveCycle} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Your Plan for May</p>
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
          {picked.map((it) => (
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
              <Button size="sm" variant="outline" className="rounded-full h-10 px-4">
                <CheckCircle2 className="mr-1 h-4 w-4" /> Buy
              </Button>
            </article>
          ))}
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
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return null;
}
