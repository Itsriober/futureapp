import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, CATEGORY_EMOJI, Category, getCountdown } from "@/lib/data";
import { newItemSchema } from "@/lib/schemas";
import { Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NewItemInput {
  name: string;
  price: number;
  category: Category;
  priority: number;
  target_date?: string | null;
}

type FormValues = z.infer<typeof newItemSchema> & { target_date?: string | null };

export function AddItemDialog({ onAdd, fab }: { onAdd: (input: NewItemInput) => Promise<void> | void; fab?: boolean }) {
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(newItemSchema),
    defaultValues: { name: "", price: 0, category: "Tech", priority: 3, target_date: null },
  });
  const targetDateVal = watch("target_date");

  const submit = async (values: FormValues) => {
    await onAdd({
      name: values.name,
      price: values.price,
      category: values.category as Category,
      priority: values.priority,
      target_date: values.target_date || null,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {fab ? (
          <Button size="icon" className="h-16 w-16 rounded-full shadow-pop bg-gradient-warm hover:scale-110 transition-transform">
            <Plus className="h-8 w-8" />
          </Button>
        ) : (
          <Button size="lg" className="rounded-full shadow-pop">
            <Plus className="mr-1 h-4 w-4" /> Add a want
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">What do you want?</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Sony headphones" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (KES)</Label>
            <Input id="price" type="number" inputMode="numeric" placeholder="15000"
              {...register("price", { valueAsNumber: true })} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        field.value === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30"
                      }`}
                    >
                      <span className="mr-1">{CATEGORY_EMOJI[c as Category]}</span>{c}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => field.onChange(p)}
                      className={`h-10 flex-1 rounded-xl border text-sm font-medium transition ${
                        field.value === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> I want this by (optional)</Label>
            <input
              type="date"
              {...register("target_date")}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10"
            />
            {targetDateVal && (() => {
              const cd = getCountdown(targetDateVal);
              return cd ? (
                <p className={cn("text-xs font-medium",
                  cd.variant === "overdue" && "text-red-500",
                  cd.variant === "warning" && "text-amber-500",
                  cd.variant === "normal" && "text-muted-foreground",
                )}>{cd.label}</p>
              ) : null;
            })()}
          </div>
          <Button type="submit" className="w-full" size="lg">Add to wishlist</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
