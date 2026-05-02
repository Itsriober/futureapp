import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatMoney, freeMoney } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/budget")({
  head: () => ({ meta: [{ title: "Budget — FutureFlow" }] }),
  component: BudgetPage,
});

interface BudgetForm { salary: number; rent: number; bills: number; subscriptions: number; }
const empty: BudgetForm = { salary: 0, rent: 0, bills: 0, subscriptions: 0 };

function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<BudgetForm>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("budgets").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setBudget({ salary: Number(data.salary), rent: Number(data.rent), bills: Number(data.bills), subscriptions: Number(data.subscriptions) });
    })();
  }, [user]);

  const free = freeMoney(budget);
  const used = budget.rent + budget.bills + budget.subscriptions;
  const pct = budget.salary > 0 ? Math.min(100, (used / budget.salary) * 100) : 0;

  const update = (k: keyof BudgetForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBudget((b) => ({ ...b, [k]: Number(e.target.value) || 0 }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("budgets").upsert({ user_id: user.id, ...budget }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Budget saved");
  };

  return (
    <div>
      <p className="text-sm uppercase tracking-wider text-muted-foreground">This month</p>
      <h1 className="font-display text-4xl font-semibold">Your budget</h1>

      <div className="mt-6 rounded-3xl bg-gradient-warm p-6 text-primary-foreground shadow-pop">
        <p className="text-xs uppercase tracking-wider opacity-80">Free Money</p>
        <p className="font-display text-5xl font-semibold">{formatMoney(free)}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
          <div className="h-full bg-white/90" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs opacity-80">{Math.round(pct)}% of income committed to fixed costs</p>
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <Field label="Monthly income" value={budget.salary} onChange={update("salary")} />
        <Field label="Rent" value={budget.rent} onChange={update("rent")} />
        <Field label="Bills" value={budget.bills} onChange={update("bills")} />
        <Field label="Subscriptions" value={budget.subscriptions} onChange={update("subscriptions")} />
        <Button onClick={save} disabled={saving} className="w-full rounded-full" size="lg">
          {saving ? "Saving…" : "Save budget"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" inputMode="numeric" value={value || ""} onChange={onChange} placeholder="0" />
    </div>
  );
}
