import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — FutureFlow" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/app" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <Link to="/" className="mb-8 inline-flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-warm text-lg shadow-pop">✦</div>
        <span className="font-display text-xl font-semibold">FutureFlow</span>
      </Link>

      <h1 className="font-display text-4xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-muted-foreground">
        {mode === "signin" ? "Sign in to continue designing your future." : "Save your wishlist and budget across devices."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} size="lg" className="w-full rounded-full shadow-pop">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" size="lg" className="w-full rounded-full" onClick={google}>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-medium text-foreground underline-offset-4 hover:underline">
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
