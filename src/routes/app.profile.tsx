import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useProfile, useWishlist } from "@/lib/storage";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "You — FutureFlow" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useProfile();
  const [items] = useWishlist();
  const navigate = useNavigate();

  const purchased = items.filter((i) => i.status === "purchased").length;
  const active = items.filter((i) => i.status === "active").length;

  const reset = () => {
    if (!confirm("Reset your data?")) return;
    localStorage.removeItem("ff.budget");
    localStorage.removeItem("ff.wishlist");
    localStorage.removeItem("ff.profile");
    setProfile({ name: "", onboarded: false });
    navigate({ to: "/onboarding" });
  };

  return (
    <div>
      <p className="text-sm uppercase tracking-wider text-muted-foreground">Profile</p>
      <h1 className="font-display text-4xl font-semibold">Hi, {profile.name || "Friend"}</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Active wants" value={active} />
        <Stat label="Purchased" value={purchased} />
      </div>

      <div className="mt-6 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Local-only for now. Sign-in & cloud sync coming next.</p>
        <Button variant="outline" className="mt-4 rounded-full" onClick={reset}>Reset all data</Button>
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
