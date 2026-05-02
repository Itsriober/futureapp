import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, CATEGORY_EMOJI, Category } from "@/lib/data";
import { Plus } from "lucide-react";

export interface NewItemInput {
  name: string;
  price: number;
  category: Category;
  priority: number;
}

export function AddItemDialog({ onAdd }: { onAdd: (input: NewItemInput) => Promise<void> | void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category>("Tech");
  const [priority, setPriority] = useState(3);

  const reset = () => { setName(""); setPrice(""); setCategory("Tech"); setPriority(3); };

  const submit = async () => {
    if (!name.trim() || !price) return;
    await onAdd({ name: name.trim(), price: Number(price), category, priority });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-pop">
          <Plus className="mr-1 h-4 w-4" /> Add a want
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">What do you want?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Sony headphones" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (KES)</Label>
            <Input id="price" type="number" inputMode="numeric" placeholder="15000" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    category === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <span className="mr-1">{CATEGORY_EMOJI[c]}</span>{c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`h-10 flex-1 rounded-xl border text-sm font-medium transition ${
                    priority === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground/30"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={submit} className="w-full" size="lg">Add to wishlist</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
