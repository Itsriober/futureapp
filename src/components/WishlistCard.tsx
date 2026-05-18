import { DbWishlistItem, formatMoney, Category, CATEGORY_COLOR, CATEGORY_BORDER_COLOR, getCountdown } from "@/lib/data";
import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Props {
  item: DbWishlistItem;
  freeBalance?: number;
  onPriority: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
  animationDelay?: number;
}

export function WishlistCard({ item, freeBalance = 0, onPriority, onDelete, animationDelay = 0 }: Props) {
  const isMobile = useIsMobile();
  const price = Number(item.price);
  const affordable = price <= freeBalance && freeBalance > 0;
  const progressPct = freeBalance > 0 ? Math.min(100, Math.round((freeBalance / price) * 100)) : 0;
  const category = item.category as Category;
  const borderColor = CATEGORY_BORDER_COLOR[category] ?? "border-border";
  const countdown = getCountdown(item.target_date);

  const weeksAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7));
  const weeksLabel = weeksAgo === 0 ? "This week" : weeksAgo === 1 ? "1 week ago" : `${weeksAgo} weeks ago`;

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-pop animate-scale-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Category left border */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", borderColor.replace("border-", "bg-"))} />

      <Link to="/app/wishlist/$id" params={{ id: item.id }} className="absolute inset-0 z-0" />

      <div className="relative z-10 p-5 pl-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-3xl">
            {item.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-lg font-semibold leading-tight">{item.name}</h3>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id); }}
                aria-label="Delete"
                className={cn(
                  "pointer-events-auto rounded-full p-1.5 text-muted-foreground transition-opacity hover:bg-muted hover:text-destructive",
                  isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.category} · {weeksLabel}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-xl">{formatMoney(price)}</span>
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="text-xs text-muted-foreground">Priority</span>
            <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPriority(item.id, -1); }} className="text-muted-foreground hover:text-foreground" aria-label="Lower">
                <span className="text-xs">−</span>
              </button>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= item.priority ? "bg-primary" : "bg-border"}`} />
                ))}
              </div>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPriority(item.id, 1); }} className="text-muted-foreground hover:text-foreground" aria-label="Raise">
                <span className="text-xs">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Affordability chip */}
        <div className="mt-2">
          {freeBalance > 0 && (
            <span className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
              affordable ? "bg-green-50 text-green-600" : "bg-muted text-muted-foreground"
            )}>
              {affordable ? "✓ Affordable" : `${formatMoney(price - freeBalance)} away`}
            </span>
          )}
        </div>

        {/* Affordability progress bar */}
        {freeBalance > 0 && (
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", progressPct >= 100 ? "bg-green-500" : "bg-primary/50")}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Countdown chip */}
        {countdown && (
          <div className="mt-2">
            <span className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
              countdown.variant === "overdue" && "bg-red-50 text-red-600",
              countdown.variant === "warning" && "bg-amber-50 text-amber-600",
              countdown.variant === "normal" && "bg-muted text-muted-foreground",
            )}>
              {countdown.label}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
