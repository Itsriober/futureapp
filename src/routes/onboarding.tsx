import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBudget, useProfile, formatMoney, freeMoney } from "@/lib/storage";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — FutureFlow" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [, setBudget] = useBudget();
  const [, setProfile] = useProfile();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [rent, setRent] = useState("");
  const [bills, setBills] = useState("");
  const [subs, setSubs] = useState("");

  const free = freeMoney({ salary: +salary || 0, rent: +rent || 0, bills: +bills || 0, subscriptions: +subs || 0 });

  const finish = () => {
    setBudget({ salary: +salary || 0, rent: +rent || 0, bills: +bills || 0, subscriptions: +subs || 0 });
    setProfile({ name: name || "Friend", onboarded: true });
    navigate({ to: "/app" });
  };

  const steps = [
    {
      title: "What should we call you?",
      sub: "Just a friendly handle for your dashboard.",
      body: (
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" autoFocus />
        </div>
      ),
      canNext: name.trim().length > 0,
    },
    {
      title: "What comes in?",
      sub: "Your monthly income — we'll never share it.",
      body: (
        <div className="space-y-2">
          <Label htmlFor="salary">Monthly income (KES)</Label>
          <Input id="salary" type="number" inputMode="numeric" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="60000" autoFocus />
        </div>
      ),
      canNext: +salary > 0,
    },
    {
      title: "What goes out?",
      sub: "Fixed costs first — what's left becomes your Free Money.",
      body: (
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Rent</Label><Input type="number" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="20000" /></div>
          <div className="space-y-1.5"><Label>Bills</Label><Input type="number" value={bills} onChange={(e) => setBills(e.target.value)} placeholder="5000" /></div>
          <div className="space-y-1.5"><Label>Subscriptions</Label><Input type="number" value={subs} onChange={(e) => setSubs(e.target.value)} placeholder="2000" /></div>
          <div className="mt-4 rounded-2xl bg-gradient-warm p-5 text-primary-foreground shadow-pop">
            <p className="text-xs uppercase tracking-wider opacity-80">Your Free Money</p>
            <p className="font-display text-3xl font-semibold">{formatMoney(free)}</p>
          </div>
        </div>
      ),
      canNext: true,
    },
  ];

  const s = steps[step];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <div className="mb-8 flex items-center gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>

      <div className="flex-1">
        <h1 className="font-display text-3xl font-semibold">{s.title}</h1>
        <p className="mt-2 text-muted-foreground">{s.sub}</p>
        <div className="mt-8">{s.body}</div>
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-full">Back</Button>}
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!s.canNext} className="flex-1 rounded-full shadow-pop">Continue</Button>
        ) : (
          <Button onClick={finish} className="flex-1 rounded-full shadow-pop">Enter FutureFlow</Button>
        )}
      </div>
    </div>
  );
}
