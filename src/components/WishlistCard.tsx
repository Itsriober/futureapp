import { WishlistItem, formatMoney } from "@/lib/storage";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  item: WishlistItem;
  onPriority: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}

export function WishlistCard({ item, onPriority, onDelete }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-pop">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-3xl">
          {item.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-lg font-semibold leading-tight">{item.name}</h3>
            <button
              onClick={() => onDelete(item.id)}
              aria-label="Delete"
              className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{item.category}</p>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-xl">{formatMoney(item.price)}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Priority</span>
              <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <button onClick={() => onPriority(item.id, -1)} className="text-muted-foreground hover:text-foreground" aria-label="Lower">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i <= item.priority ? "bg-primary" : "bg-border"}`}
                    />
                  ))}
                </div>
                <button onClick={() => onPriority(item.id, 1)} className="text-muted-foreground hover:text-foreground" aria-label="Raise">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
