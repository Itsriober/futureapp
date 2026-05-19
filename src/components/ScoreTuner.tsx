import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_SCORE_WEIGHTS, getScoreWeights, setScoreWeights } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  onChange: (weights: { priorityWeight: number; ageWeight: number }) => void;
}

export function ScoreTuner({ onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [weights, setWeights] = useState(getScoreWeights);

  const update = (key: keyof typeof weights, raw: number) => {
    const val = Math.round(raw * 10) / 10;
    const next = { ...weights, [key]: val };
    setWeights(next);
    setScoreWeights(next);
    onChange(next);
  };

  const reset = () => {
    setWeights(DEFAULT_SCORE_WEIGHTS);
    setScoreWeights(DEFAULT_SCORE_WEIGHTS);
    onChange(DEFAULT_SCORE_WEIGHTS);
  };

  const isDefault =
    weights.priorityWeight === DEFAULT_SCORE_WEIGHTS.priorityWeight &&
    weights.ageWeight === DEFAULT_SCORE_WEIGHTS.ageWeight;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className={cn("rounded-full gap-1.5 text-xs h-8", !isDefault && "border-primary text-primary")}
      >
        <SlidersHorizontal className="h-3 w-3" />
        Score Tuner
        {!isDefault && <span className="text-[10px] font-bold">●</span>}
      </Button>

      {open && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Scoring Weights</p>
            <div className="flex gap-2">
              {!isDefault && (
                <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline">
                  Reset
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Score = Priority × <strong>{weights.priorityWeight}</strong> + Weeks × <strong>{weights.ageWeight}</strong>
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Priority weight</span>
              <span className="font-bold">{weights.priorityWeight}×</span>
            </div>
            <input
              type="range" min={0.5} max={5} step={0.1}
              value={weights.priorityWeight}
              onChange={(e) => update("priorityWeight", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.5 (age matters more)</span><span>5 (priority matters more)</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Age weight (per week)</span>
              <span className="font-bold">+{weights.ageWeight}</span>
            </div>
            <input
              type="range" min={0} max={2} step={0.1}
              value={weights.ageWeight}
              onChange={(e) => update("ageWeight", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0 (age ignored)</span><span>2 (older items climb fast)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
