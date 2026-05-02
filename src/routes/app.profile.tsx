import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "You — FutureFlow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [active, setActive] = useState(0);
  const [purchased, setPurchased] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { count: a }, { count: p }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("wishlist_items").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("wishlist_items").select("id", { count: "exact", head: true }).eq("status", "purchased"),
      ]);
      setDisplayName(profile?.display_name ?? "");
      setActive(a ?? 0);
      setPurchased(p ?? 0);
    })();
  }, [user]);

  const saveName = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const logout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div>
      <p className="text-sm uppercase tracking-wider text-muted-foreground">Profile</p>
      <h1 className="font-display text-4xl font-semibold">Hi, {displayName || "Friend"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Active wants" value={active} />
        <Stat label="Purchased" value={purchased} />
      </div>

      <div className="mt-6 space-y-3 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl">Display name</h2>
        <div className="space-y-1.5">
          <Label htmlFor="dn">Name</Label>
          <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <Button onClick={saveName} disabled={saving} className="rounded-full">{saving ? "Saving…" : "Save"}</Button>
      </div>

      <div className="mt-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign out from this device.</p>
        <Button variant="outline" className="mt-4 rounded-full" onClick={logout}>Sign out</Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
