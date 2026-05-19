import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, CATEGORY_EMOJI, Category } from "@/lib/data";
import { newItemSchema } from "@/lib/schemas";
import { Plus } from "lucide-react";

export interface NewItemInput {
  name: string;
  price: number;
  category: Category;
  priority: number;
}

type FormValues = z.infer<typeof newItemSchema>;

export function AddItemDialog({ onAdd, fab }: { onAdd: (input: NewItemInput) => Promise<void> | void; fab?: boolean }) {
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(newItemSchema),
    defaultValues: { name: "", price: 0, category: "Tech", priority: 3 },
  });

  const submit = async (values: FormValues) => {
    await onAdd({
      name: values.name,
      price: values.price,
      category: values.category as Category,
      priority: values.priority,
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
          <Button type="submit" className="w-full" size="lg">Add to wishlist</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
