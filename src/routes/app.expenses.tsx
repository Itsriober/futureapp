import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DbBudget, DbFixedExpense, DbCategoryBudget } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatMoney, CATEGORIES, CATEGORY_EMOJI, Category } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Lock, Landmark, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { salarySchema, expenseSchema } from "@/lib/schemas";

export const Route = createFileRoute("/app/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Listi" }] }),
  component: ExpensesPage,
});

interface Expense {
  id?: string;
  name: string;
  amount: number;
  is_savings: boolean;
}

function ExpensesPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  const [salary, setSalary] = useState(0);
  const [paydayDay, setPaydayDay] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});

  const { data: budgetData, isLoading: loadingBudget } = useQuery<DbBudget | null>({
    queryKey: ["budget", userId],
    queryFn: async () => {
      const r = await supabase.from("budgets").select("*").eq("user_id", userId).maybeSingle();
      return (r.data ?? null) as DbBudget | null;
    },
    enabled: !!userId,
  });

  const { data: categoryBudgetsData } = useQuery<DbCategoryBudget[]>({
    queryKey: ["category-budgets", userId],
    queryFn: async () => {
      const r = await supabase.from("category_budgets").select("*").eq("user_id", userId);
      return (r.data ?? []) as DbCategoryBudget[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (categoryBudgetsData) {
      const map: Record<string, number> = {};
      categoryBudgetsData.forEach(cb => { map[cb.category] = Number(cb.monthly_limit); });
      setCategoryLimits(map);
    }
  }, [categoryBudgetsData]);

  const { data: expensesData, isLoading: loadingExpenses } = useQuery<DbFixedExpense[]>({
    queryKey: ["expenses", userId],
    queryFn: async () => {
      const r = await supabase.from("fixed_expenses").select("*").eq("user_id", userId);
      return (r.data ?? []) as DbFixedExpense[];
    },
    enabled: !!userId,
  });

  const loading = loadingBudget || loadingExpenses;

  // Sync local edit buffer from query data
  useEffect(() => {
    if (budgetData) {
      setSalary(Number(budgetData.salary));
      setPaydayDay(budgetData.payday_day ?? null);
    }
  }, [budgetData]);

  useEffect(() => {
    if (expensesData && expensesData.length > 0) {
      setExpenses(expensesData.map((e) => ({ id: e.id, name: e.name, amount: Number(e.amount), is_savings: e.is_savings })));
    } else if (expensesData && expensesData.length === 0 && budgetData) {
      // Migration from legacy budget columns if first time
      const legacy: Expense[] = [
        { name: "Rent", amount: Number(budgetData.rent), is_savings: false },
        { name: "Bills", amount: Number(budgetData.bills), is_savings: false },
        { name: "Subscriptions", amount: Number(budgetData.subscriptions), is_savings: false },
      ].filter(i => i.amount > 0);
      setExpenses(legacy);
    }
  }, [expensesData, budgetData]);

  const addExpense = () => {
    setExpenses([...expenses, { name: "", amount: 0, is_savings: false }]);
  };

  const removeExpense = (idx: number) => {
    setExpenses(expenses.filter((_, i) => i !== idx));
  };

  const updateExpense = (idx: number, updates: Partial<Expense>) => {
    setExpenses(expenses.map((e, i) => (i === idx ? { ...e, ...updates } : e)));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const salaryResult = salarySchema.safeParse(salary);
      if (!salaryResult.success) throw new Error(salaryResult.error.errors[0].message);

      for (const exp of expenses) {
        const expResult = expenseSchema.safeParse(exp);
        if (!expResult.success) throw new Error(`${exp.name || "Expense"}: ${expResult.error.errors[0].message}`);
      }

      // Update salary in budget table (keeping it for now as base income source)
      const { error: bErr } = await supabase.from("budgets").upsert({ user_id: userId, salary, payday_day: paydayDay }, { onConflict: "user_id" });
      if (bErr) throw bErr;

      // Update fixed expenses
      const { error: dErr } = await supabase.from("fixed_expenses").delete().eq("user_id", userId);
      if (dErr) throw dErr;

      if (expenses.length > 0) {
        const { error: iErr } = await supabase.from("fixed_expenses").insert(
          expenses.map(e => ({ user_id: userId, name: e.name, amount: e.amount, is_savings: e.is_savings }))
        );
        if (iErr) throw iErr;
      }

      // Save category budgets (upsert each category that has a limit > 0, delete zeros)
      const nonZero = Object.entries(categoryLimits).filter(([, v]) => v > 0);
      const zero = Object.entries(categoryLimits).filter(([, v]) => v === 0).map(([k]) => k);
      if (nonZero.length > 0) {
        const { error: cbErr } = await supabase.from("category_budgets").upsert(
          nonZero.map(([category, monthly_limit]) => ({ user_id: userId, category, monthly_limit })),
          { onConflict: "user_id,category" }
        );
        if (cbErr) throw cbErr;
      }
      if (zero.length > 0) {
        await supabase.from("category_budgets").delete().eq("user_id", userId).in("category", zero);
      }
    },
    onSuccess: () => {
      toast.success("Expenses updated");
      queryClient.invalidateQueries({ queryKey: ["budget", userId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", userId] });
      queryClient.invalidateQueries({ queryKey: ["category-budgets", userId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const saveAll = () => saveMutation.mutate();
  const saving = saveMutation.isPending;

  const totalFixed = expenses.filter(e => !e.is_savings).reduce((acc, curr) => acc + curr.amount, 0);
  const totalSavings = expenses.filter(e => e.is_savings).reduce((acc, curr) => acc + curr.amount, 0);
  const free = Math.max(0, salary - totalFixed - totalSavings);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-48" />
      <Skeleton className="h-32 w-full rounded-3xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <p className="text-sm uppercase tracking-wider text-muted-foreground">Foundation</p>
        <h1 className="font-display text-4xl font-semibold">Fixed Obligations</h1>
        <p className="mt-2 text-muted-foreground">What goes out before you can play? Rent, bills, and your future self.</p>
      </div>

      <div className="rounded-3xl bg-gradient-ink p-6 text-white shadow-pop">
        <p className="text-xs uppercase tracking-wider opacity-70">Projected Discretionary</p>
        <p className="font-display text-5xl font-semibold">{formatMoney(free)}</p>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
          <div>
            <p className="opacity-60">Fixed Costs</p>
            <p className="font-semibold">{formatMoney(totalFixed)}</p>
          </div>
          <div>
            <p className="opacity-60 text-primary">Savings Lock</p>
            <p className="font-semibold text-primary">{formatMoney(totalSavings)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-lg font-display">Monthly Take-home Pay</Label>
          <div className="relative">
            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="number"
              value={salary || ""}
              onChange={(e) => setSalary(Number(e.target.value) || 0)}
              className="h-14 pl-12 rounded-2xl text-xl font-medium bg-card shadow-soft"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-display flex items-center gap-2">
            <CalendarClock className="h-5 w-5" /> Payday Date
          </Label>
          <p className="text-sm text-muted-foreground">Day of the month your salary arrives (e.g. 1, 25).</p>
          <Input
            type="number"
            min={1}
            max={31}
            value={paydayDay ?? ""}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setPaydayDay(isNaN(v) ? null : Math.min(31, Math.max(1, v)));
            }}
            className="h-14 rounded-2xl text-xl font-medium bg-card shadow-soft w-32"
            placeholder="—"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl font-semibold">Recurring Expenses</h3>
            <Button variant="outline" size="sm" onClick={addExpense} className="rounded-full gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          <div className="space-y-3">
            {expenses.map((exp, i) => (
              <div key={i} className="flex gap-3 items-end animate-scale-in">
                <div className="flex-1 space-y-1.5">
                  <Input 
                    value={exp.name} 
                    onChange={(e) => updateExpense(i, { name: e.target.value })}
                    placeholder="Expense name"
                    className="rounded-xl bg-card"
                  />
                </div>
                <div className="w-32 space-y-1.5">
                  <Input 
                    type="number" 
                    value={exp.amount || ""} 
                    onChange={(e) => updateExpense(i, { amount: Number(e.target.value) || 0 })}
                    placeholder="Amount"
                    className="rounded-xl bg-card font-medium"
                  />
                </div>
                <Button 
                  variant={exp.is_savings ? "default" : "outline"} 
                  size="icon" 
                  onClick={() => updateExpense(i, { is_savings: !exp.is_savings })}
                  className="rounded-xl shrink-0"
                  title={exp.is_savings ? "Savings Lock (High Priority)" : "Mark as Savings"}
                >
                  <Lock className={`h-4 w-4 ${exp.is_savings ? "text-white" : "text-muted-foreground"}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeExpense(i)} className="rounded-xl shrink-0 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-10 rounded-3xl border border-dashed border-border text-muted-foreground">
                No recurring expenses added yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-display text-xl font-semibold">Category Budgets</h3>
            <p className="text-sm text-muted-foreground mt-1">Set monthly spend limits per category. Leave blank for no limit.</p>
          </div>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{CATEGORY_EMOJI[cat as Category]}</span>
                <span className="flex-1 text-sm font-medium">{cat}</span>
                <div className="w-36">
                  <Input
                    type="number"
                    min={0}
                    value={categoryLimits[cat] || ""}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setCategoryLimits(prev => ({ ...prev, [cat]: v }));
                    }}
                    placeholder="No limit"
                    className="rounded-xl bg-card text-right font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={saveAll} disabled={saving} className="w-full h-14 rounded-full text-lg shadow-pop" size="lg">
          {saving ? "Saving…" : "Save Foundation"}
        </Button>
      </div>
    </div>
  );
}
