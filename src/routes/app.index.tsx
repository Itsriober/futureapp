import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatMoney, DbWishlistItem, getCountdown } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Home — Listi" }] }),
  component: DashboardPage,
});

interface DashboardData {
  salary: number;
  totalFixed: number;
  totalSavings: number;
  freeBalance: number;
  streak: number;
  cyclesCount: number;
  items: DbWishlistItem[];
}

function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: budget }, { data: exps }, { data: profileData }, { data: wishlistData }, { data: cyclesData }] = await Promise.all([
        supabase.from("budgets").select("salary").eq("user_id", user.id).maybeSingle(),
        (supabase.from("fixed_expenses" as any).select("amount,is_savings").eq("user_id", user.id) as any),
        supabase.from("profiles").select("streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("wishlist_items").select("*").eq("user_id", user.id).eq("status", "active").order("priority", { ascending: false }).order("created_at", { ascending: false }),
        (supabase.from("payday_cycles" as any).select("id").eq("user_id", user.id) as any),
      ]);

      const salary = Number(budget?.salary ?? 0);
      const totalFixed = (exps ?? []).filter((e: any) => !e.is_savings).reduce((acc: number, e: any) => acc + Number(e.amount), 0);
      const totalSavings = (exps ?? []).filter((e: any) => e.is_savings).reduce((acc: number, e: any) => acc + Number(e.amount), 0);
      const freeBalance = Math.max(0, salary - totalFixed - totalSavings);

      setData({
        salary,
        totalFixed,
        totalSavings,
        freeBalance,
        streak: Number(profileData?.streak ?? 0),
        cyclesCount: (cyclesData ?? []).length,
        items: (wishlistData ?? []) as DbWishlistItem[],
      });
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const { salary, totalFixed, totalSavings, freeBalance, streak, cyclesCount, items } = data;

  // Top picks: score = priority×2 + weeks×0.5, top 3
  const topPicks = items
    .map((it) => {
      const weeks = Math.max(0, (Date.now() - new Date(it.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7));
      return { ...it, score: (it.priority * 2) + (weeks * 0.5) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Savings progress
  const estimatedSavings = totalSavings * cyclesCount;
  const nextMilestone = Math.max(10000, Math.ceil(estimatedSavings / 10000) * 10000);
  const savingsProgress = estimatedSavings > 0 ? Math.min(100, (estimatedSavings / nextMilestone) * 100) : 0;

  const commitmentPct = salary > 0 ? Math.min(100, Math.round(((totalFixed + totalSavings) / salary) * 100)) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Zone 1 — Hero Financial Card */}
      <div className="rounded-[2rem] bg-gradient-warm p-6 text-white shadow-pop">
        <p className="text-xs uppercase tracking-wider opacity-75">Free This Month</p>
        <p className="font-display text-5xl font-semibold mt-1">{formatMoney(freeBalance)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/20 pt-4 text-sm">
          <div>
            <p className="opacity-70">Salary In</p>
            <p className="font-semibold">{formatMoney(salary)}</p>
          </div>
          <div>
            <p className="opacity-70">Total Committed</p>
            <p className="font-semibold">{formatMoney(totalFixed + totalSavings)}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs opacity-70">
            <span>% committed</span>
            <span>{commitmentPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white/70 transition-all" style={{ width: `${commitmentPct}%` }} />
          </div>
        </div>
        {totalSavings > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            🔒 {formatMoney(totalSavings)} locked
          </div>
        )}
      </div>

      {/* Zone 2 — Top Picks */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl font-semibold">Top Picks</h2>
        </div>
        {topPicks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">Add items to your wishlist to see picks.</p>
            <Link to="/app/wishlist" className="mt-2 inline-block text-sm text-primary underline underline-offset-4">Go to Wishlist →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {topPicks.map((it) => {
              const affordable = Number(it.price) <= freeBalance;
              const countdown = getCountdown(it.target_date);
              return (
                <Link key={it.id} to="/app/wishlist/$id" params={{ id: it.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft hover:shadow-pop transition-all hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl">{it.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{it.name}</p>
                    <p className="text-sm text-muted-foreground">{formatMoney(Number(it.price))}</p>
                    {countdown && (
                      <p className={cn("text-xs mt-0.5", countdown.variant === "overdue" && "text-red-500", countdown.variant === "warning" && "text-amber-500")}>{countdown.label}</p>
                    )}
                  </div>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0",
                    affordable ? "bg-green-50 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {affordable ? "✓ Affordable" : `${formatMoney(Number(it.price) - freeBalance)} away`}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Zone 3 — Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
          {streak > 0 ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl">🔥</span>
                <span className="font-display text-3xl font-semibold">{streak}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">payday cycles</p>
            </>
          ) : (
            <>
              <p className="text-2xl">🔥</p>
              <p className="mt-1 text-sm text-muted-foreground">Start your streak</p>
            </>
          )}
        </div>
        {/* Savings progress */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
          {totalSavings > 0 ? (
            <>
              <p className="font-display text-xl font-semibold">{formatMoney(estimatedSavings)}</p>
              <p className="text-xs text-muted-foreground mb-2">saved (est.)</p>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${savingsProgress}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Next: {formatMoney(nextMilestone)}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Set a savings lock in Expenses to track progress</p>
          )}
        </div>
      </div>

      {/* Zone 4 — Quick Actions */}
      <div className="flex gap-3">
        <Link to="/app/payday"
          className="flex-1 rounded-full bg-foreground text-background py-3 text-center text-sm font-semibold transition hover:opacity-90 shadow-pop"
        >
          Run Payday →
        </Link>
        <Link to="/app/history"
          className="flex-1 rounded-full border border-border bg-card py-3 text-center text-sm font-semibold transition hover:border-foreground/30"
        >
          View History →
        </Link>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <Skeleton className="h-52 w-full rounded-[2rem]" />
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 flex-1 rounded-full" />
      </div>
    </div>
  );
}
