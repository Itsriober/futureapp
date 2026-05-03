import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FutureFlow — Spend with intention" },
      { name: "description", content: "Design your future. Capture desire. Spend with intention." },
      { property: "og:title", content: "FutureFlow — Spend with intention" },
      { property: "og:description", content: "A lifestyle-finance app that turns desire into intentional decisions." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Futuristic ambient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-gradient-warm opacity-30 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.10 165) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.15 75) 0%, transparent 70%)" }} />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-warm text-lg shadow-pop">✦</div>
          <span className="font-display text-xl font-semibold">FutureFlow</span>
        </Link>
        <Link to="/auth"><Button variant="ghost" className="rounded-full">Sign in</Button></Link>
      </header>

      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-16 pb-24 text-center md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Lifestyle × Finance
        </span>

        <h1 className="mt-8 font-display text-6xl font-semibold leading-[1.02] md:text-8xl">
          Design your <span className="text-gradient-warm">future.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">
          Capture desire. Spend with intention.
        </p>

        <div className="mt-10 flex items-center gap-3">
          <Link to="/onboarding">
            <Button size="lg" className="group rounded-full px-7 shadow-pop">
              Begin
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Minimal illustrative scene */}
        <div className="relative mt-20 h-72 w-full max-w-3xl md:h-96">
          <svg viewBox="0 0 600 360" className="absolute inset-0 h-full w-full" fill="none">
            <defs>
              <linearGradient id="warm" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.18 35)" />
                <stop offset="100%" stopColor="oklch(0.83 0.15 75)" />
              </linearGradient>
              <linearGradient id="ink" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.22 0.05 270)" />
                <stop offset="100%" stopColor="oklch(0.30 0.07 290)" />
              </linearGradient>
            </defs>

            {/* Concentric orbits */}
            <circle cx="300" cy="200" r="160" stroke="oklch(0.20 0.04 270 / 0.12)" strokeWidth="1" />
            <circle cx="300" cy="200" r="110" stroke="oklch(0.20 0.04 270 / 0.18)" strokeWidth="1" />
            <circle cx="300" cy="200" r="60" stroke="oklch(0.20 0.04 270 / 0.25)" strokeWidth="1" />

            {/* Core sun */}
            <circle cx="300" cy="200" r="38" fill="url(#warm)" opacity="0.95" />
            <circle cx="300" cy="200" r="38" fill="url(#warm)" className="origin-center animate-ping" opacity="0.15" />

            {/* Floating cards */}
            <g transform="translate(110 90) rotate(-8)">
              <rect width="120" height="76" rx="14" fill="oklch(1 0 0)" stroke="oklch(0.90 0.015 80)" />
              <rect x="14" y="16" width="50" height="8" rx="4" fill="oklch(0.66 0.19 30)" />
              <rect x="14" y="32" width="80" height="6" rx="3" fill="oklch(0.92 0.015 80)" />
              <rect x="14" y="46" width="60" height="6" rx="3" fill="oklch(0.92 0.015 80)" />
            </g>

            <g transform="translate(380 70) rotate(6)">
              <rect width="130" height="90" rx="16" fill="url(#ink)" />
              <circle cx="24" cy="24" r="10" fill="oklch(0.82 0.15 75)" />
              <rect x="44" y="20" width="60" height="8" rx="4" fill="oklch(1 0 0 / 0.7)" />
              <rect x="14" y="48" width="100" height="6" rx="3" fill="oklch(1 0 0 / 0.25)" />
              <rect x="14" y="62" width="70" height="6" rx="3" fill="oklch(1 0 0 / 0.18)" />
            </g>

            <g transform="translate(420 220) rotate(-4)">
              <rect width="110" height="70" rx="14" fill="oklch(0.93 0.05 70)" />
              <rect x="14" y="16" width="40" height="8" rx="4" fill="oklch(0.25 0.06 40)" />
              <rect x="14" y="32" width="70" height="6" rx="3" fill="oklch(0.25 0.06 40 / 0.3)" />
            </g>

            <g transform="translate(70 230) rotate(5)">
              <rect width="140" height="78" rx="14" fill="oklch(1 0 0)" stroke="oklch(0.90 0.015 80)" />
              <rect x="14" y="16" width="60" height="8" rx="4" fill="oklch(0.78 0.10 165)" />
              <rect x="14" y="32" width="100" height="6" rx="3" fill="oklch(0.92 0.015 80)" />
              <rect x="14" y="46" width="80" height="6" rx="3" fill="oklch(0.92 0.015 80)" />
            </g>

            {/* Connecting nodes */}
            <circle cx="170" cy="128" r="3" fill="oklch(0.66 0.19 30)" />
            <circle cx="445" cy="115" r="3" fill="oklch(0.66 0.19 30)" />
            <circle cx="475" cy="255" r="3" fill="oklch(0.66 0.19 30)" />
            <circle cx="140" cy="269" r="3" fill="oklch(0.66 0.19 30)" />
          </svg>
        </div>
      </section>
    </div>
  );
}
