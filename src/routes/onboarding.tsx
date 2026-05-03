import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBudget, useProfile, formatMoney, freeMoney } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — FutureFlow" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setBudget] = useBudget();
  const [, setProfile] = useProfile();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [rent, setRent] = useState("");
  const [bills, setBills] = useState("");
  const [subs, setSubs] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const budgetData = {
    salary: +salary || 0,
    rent: +rent || 0,
    bills: +bills || 0,
    subscriptions: +subs || 0,
  };
  const free = freeMoney(budgetData);

  const persistToSupabase = async (userId: string) => {
    await supabase.from("profiles").upsert(
      { user_id: userId, display_name: name || "Friend" },
      { onConflict: "user_id" },
    );
    await supabase.from("budgets").upsert(
      { user_id: userId, ...budgetData },
      { onConflict: "user_id" },
    );
  };

  const finish = async () => {
    setBusy(true);
    try {
      // Always save locally for instant UX
      setBudget(budgetData);
      setProfile({ name: name || "Friend", onboarded: true });

      if (user) {
        await persistToSupabase(user.id);
        toast.success("All set — welcome back!");
        navigate({ to: "/app" });
        return;
      }

      // New user — sign them up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: { display_name: name || email.split("@")[0] },
        },
      });
      if (error) throw error;

      // If session is returned (email confirmation off), persist + go to app
      if (data.session?.user) {
        await persistToSupabase(data.session.user.id);
        toast.success("Welcome to FutureFlow ✦");
        navigate({ to: "/app" });
      } else {
        toast.success("Check your email to confirm your account.");
        navigate({ to: "/auth" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const baseSteps = [
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
          <div className="mt-4 rounded-2xl bg-gradient-warm p-5 text-primary-foreground shadow-pop animate-scale-in">
            <p className="text-xs uppercase tracking-wider opacity-80">Your Free Money</p>
            <p className="font-display text-3xl font-semibold">{formatMoney(free)}</p>
          </div>
        </div>
      ),
      canNext: true,
    },
  ];

  const signupStep = {
    title: "Save your future.",
    sub: "Create an account to keep your wishlist and budget across devices.",
    body: (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </div>
    ),
    canNext: /\S+@\S+\.\S+/.test(email) && password.length >= 6,
  };

  const steps = user ? baseSteps : [...baseSteps, signupStep];
  const s = steps[step];
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-gradient-warm opacity-20 blur-3xl" />
        <div className="absolute bottom-0 -right-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.10 165) 0%, transparent 70%)" }} />
      </div>

      <Link
        to="/"
        className="relative mb-6 inline-flex items-center gap-2 self-start text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Home</span>
      </Link>

      <div className="relative mb-3 flex items-center gap-2">
        {steps.map((_, i) => (
          <div key={i} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-warm transition-all duration-700 ease-out"
              style={{ width: i <= step ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>
      <p className="relative mb-6 text-xs text-muted-foreground">
        Step {step + 1} of {steps.length} · {Math.round(progress)}%
      </p>

      <div key={step} className="relative flex-1 animate-slide-up">
        <h1 className="font-display text-3xl font-semibold">{s.title}</h1>
        <p className="mt-2 text-muted-foreground">{s.sub}</p>
        <div className="mt-8 animate-fade-in">{s.body}</div>
      </div>

      <div className="relative mt-8 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={busy}
            className="flex-1 rounded-full transition-transform hover:-translate-x-0.5"
          >
            Back
          </Button>
        )}
        {!isLast ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!s.canNext}
            className="flex-1 rounded-full shadow-pop transition-transform hover:translate-x-0.5 disabled:hover:translate-x-0"
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={finish}
            disabled={busy || !s.canNext}
            className="flex-1 rounded-full shadow-pop hover-scale"
          >
            {busy ? "Creating…" : user ? "Enter FutureFlow ✦" : "Create account ✦"}
          </Button>
        )}
      </div>
    </div>
  );
}
