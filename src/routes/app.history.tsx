import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatMoney, CATEGORY_COLOR, Category } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ChevronDown, ChevronUp, Calendar, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "History — Listi" }] }),
  component: HistoryPage,
});

const CATEGORY_HEX: Record<string, string> = {
  Tech: "#3b82f6",
  Fashion: "#ec4899",
  Experience: "#14b8a6",
  Food: "#f59e0b",
  Home: "#22c55e",
  Other: "#f97316",
};

function HistoryPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const { data: cycles = [], isLoading } = useQuery<any[]>({
    queryKey: ["cycles", userId],
    queryFn: async () => {
      const r = await supabase
        .from("payday_cycles")
        .select(`*, cycle_allocations (status, wishlist_items (name, emoji, price, category))`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (r.error) throw r.error;
      return (r.data ?? []) as any[];
    },
    enabled: !!userId,
  });

  // Compute analytics from cycles data
  const barData = [...cycles].reverse().map((cycle) => {
    const date = new Date(cycle.cycle_month);
    const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const allocated = (cycle.cycle_allocations ?? []).reduce((acc: number, a: any) => acc + Number(a.wishlist_items?.price ?? 0), 0);
    return { label, discretionary: Number(cycle.discretionary_balance), allocated };
  });

  const categoryMap: Record<string, number> = {};
  cycles.forEach((cycle) => {
    (cycle.cycle_allocations ?? []).forEach((a: any) => {
      const cat = a.wishlist_items?.category ?? "Other";
      categoryMap[cat] = (categoryMap[cat] ?? 0) + Number(a.wishlist_items?.price ?? 0);
    });
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  if (isLoading) return (
    <div className="space-y-8 pb-10">
      <Skeleton className="h-16 w-48" />
      <Skeleton className="h-48 w-full rounded-[2rem]" />
      <Skeleton className="h-48 w-full rounded-[2rem]" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <p className="text-sm uppercase tracking-wider text-muted-foreground">The Journey</p>
        <h1 className="font-display text-4xl font-semibold">Spending History</h1>
        <p className="mt-2 text-muted-foreground">A record of every payday win and disciplined deferral.</p>
      </div>

      {/* Analytics section — show when 2+ cycles */}
      {cycles.length >= 2 && (
        <div className="rounded-[2rem] border border-border/60 bg-card shadow-soft overflow-hidden">
          <button
            onClick={() => setAnalyticsOpen((o) => !o)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <h2 className="font-display text-xl font-semibold">Analytics</h2>
            {analyticsOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </button>
          {analyticsOpen && (
            <div className="px-6 pb-6 space-y-8">
              {/* Monthly Bar Chart */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Monthly: Discretionary vs Allocated</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => formatMoney(v)} />
                    <Bar dataKey="discretionary" name="Discretionary" fill="oklch(0.66 0.19 30)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="allocated" name="Allocated" fill="oklch(0.55 0.15 270)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Donut */}
              {pieData.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Spend by Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={CATEGORY_HEX[entry.name] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatMoney(v)} />
                      <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cycle list */}
      <div className="space-y-4">
        {cycles.map((cycle) => {
          const date = new Date(cycle.cycle_month);
          const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          const allocatedCount = cycle.cycle_allocations?.length || 0;
          const purchasedCount = cycle.cycle_allocations?.filter((a: any) => a.status === "purchased").length || 0;

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
                      {alloc.status === "purchased" && <span className="text-green-500 font-bold">✓</span>}
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
