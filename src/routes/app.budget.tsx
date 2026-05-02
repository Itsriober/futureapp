import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, freeMoney, useBudget } from "@/lib/storage";

export const Route = createFileRoute("/app/budget")({
  head: () => ({ meta: [{ title: "Budget — FutureFlow" }] }),
  component: BudgetPage,
});

function BudgetPage() {
  const [budget, setBudget] = useBudget();
  const free = freeMoney(budget);
  const used = budget.rent + budget.bills + budget.subscriptions;
  const pct = budget.salary > 0 ? Math.min(100, (used / budget.salary) * 100) : 0;

  const update = (k: keyof typeof budget) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBudget({ ...budget, [k]: Number(e.target.value) || 0 });

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
