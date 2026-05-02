import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/storage";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const [profile] = useProfile();
  const navigate = useNavigate();
  useEffect(() => {
    // Soft redirect to onboarding if not done
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("ff.profile");
      const p = raw ? JSON.parse(raw) : null;
      if (!p?.onboarded) navigate({ to: "/onboarding" });
    }
  }, [profile.onboarded, navigate]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
