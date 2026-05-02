import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet, Brain } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FutureFlow — Design your future, spend with intention" },
      { name: "description", content: "Capture what you want, prioritize intelligently, and spend only on what truly matters." },
      { property: "og:title", content: "FutureFlow — Design your future, spend with intention" },
      { property: "og:description", content: "A lifestyle-finance app that turns desire into intentional decisions." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-warm text-lg shadow-pop">✦</div>
          <span className="font-display text-xl font-semibold">FutureFlow</span>
        </div>
        <Link to="/app"><Button variant="ghost">Open app</Button></Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-24 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Lifestyle × Finance
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
            Design your future, <span className="text-gradient-warm">spend with intention.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Capture what you want, prioritize intelligently, and let your budget guide what comes next — not impulse.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/onboarding"><Button size="lg" className="rounded-full px-7 shadow-pop">Start building</Button></Link>
            <Link to="/app"><Button size="lg" variant="outline" className="rounded-full px-7">See it live</Button></Link>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Smart Wishlist", body: "Visual, swipe-friendly cards for everything you want — products, places, experiences." },
            { icon: Wallet, title: "Budget Engine", body: "Salary in, fixed costs out — see your real Free Money clearly." },
            { icon: Brain, title: "Intelligent Picks", body: "We rank your wants and pick what fits your budget this cycle." },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
