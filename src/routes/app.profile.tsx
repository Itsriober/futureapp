import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { getZodiacSign, MBTI_TYPES, HOBBIES } from "@/lib/data";
import { toast } from "sonner";
import { LogOut, MapPin, Sparkles, User as UserIcon, Palette, Music, Utensils, Heart, History, Camera, Dices, Upload, Sun, Moon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const DICEBEAR_STYLES = ["avataaars", "bottts", "pixel-art", "lorelei", "adventurer", "fun-emoji"];

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "You — Listi" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, signOut } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<any>(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ff.theme", next ? "dark" : "light");
  };

  const { data: profileData, isLoading: loading } = useQuery<any>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const r = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      return r.data ?? null;
    },
    enabled: !!userId,
  });

  // Sync local edit buffer from query data
  useEffect(() => {
    if (profileData) setProfile(profileData);
  }, [profileData]);

  const updateProfile = (updates: any) => {
    setProfile((p: any) => ({ ...p, ...updates }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const r = await supabase.from("profiles").update(profile as any).eq("user_id", userId);
      if (r.error) throw r.error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const saveProfile = () => saveMutation.mutate();
  const saving = saveMutation.isPending;

  const logout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">Loading profile…</div>;

  const zodiac = profile?.date_of_birth ? getZodiacSign(profile.date_of_birth) : null;

  const generateRandomAvatar = () => {
    const randomStyle = DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)];
    const randomSeed = Math.random().toString(36).substring(7);
    updateProfile({ avatar_url: `https://api.dicebear.com/9.x/${randomStyle}/svg?seed=${randomSeed}` });
    setAvatarDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        updateProfile({ avatar_url: dataUrl });
        setAvatarDialogOpen(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* Rich Profile Card - Spotify Wrapped Style */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-warm p-8 text-primary-foreground shadow-pop min-h-[320px] flex flex-col justify-between">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
        
        <div className="relative z-10 flex justify-between items-start">
          <button
            onClick={toggleDark}
            className="absolute right-0 top-0 rounded-full p-2 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setAvatarDialogOpen(true)}
              className="group relative h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-soft overflow-hidden transition-transform hover:scale-105"
            >
              {profile?.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" alt="" /> : "👋"}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <div>
              <h1 className="font-display text-4xl font-bold leading-tight">{profile?.display_name || "New Friend"}</h1>
              <p className="opacity-80 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {profile?.city || "Kenya"}
              </p>
            </div>
          </div>
          {zodiac && (
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-center shadow-soft">
              <span className="text-2xl block">{zodiac.symbol}</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">{zodiac.sign}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-8">
          <div className="flex flex-wrap gap-2">
            {profile?.mbti_type && (
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
                {profile.mbti_type}
              </span>
            )}
            {profile?.hobbies?.map((h: string) => (
              <span key={h} className="px-3 py-1 rounded-full bg-black/10 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
                {h}
              </span>
            ))}
          </div>
          <p className="mt-4 text-lg font-medium leading-snug max-w-sm opacity-90 italic">
            "{profile?.bio || "Capturing desires, managing reality."}"
          </p>
        </div>
      </div>

      {/* Edit Sections */}
      <div className="space-y-6">
        <section className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" /> The Basics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input value={profile?.display_name || ""} onChange={(e) => updateProfile({ display_name: e.target.value })} placeholder="How should we call you?" />
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" value={profile?.date_of_birth || ""} onChange={(e) => updateProfile({ date_of_birth: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea value={profile?.bio || ""} onChange={(e) => updateProfile({ bio: e.target.value })} placeholder="A short blurb about you..." />
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Identity
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>MBTI Type</Label>
              <Select value={profile?.mbti_type || ""} onValueChange={(v) => updateProfile({ mbti_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {MBTI_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location / City</Label>
              <Input value={profile?.city || ""} onChange={(e) => updateProfile({ city: e.target.value })} placeholder="e.g. Nairobi" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hobbies</Label>
            <div className="flex flex-wrap gap-2">
              {HOBBIES.map((h) => (
                <button
                  key={h.name}
                  onClick={() => {
                    const current = profile?.hobbies || [];
                    const next = current.includes(h.name) 
                      ? current.filter((x: string) => x !== h.name) 
                      : [...current, h.name];
                    updateProfile({ hobbies: next });
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm transition-all ${
                    profile?.hobbies?.includes(h.name)
                      ? "bg-primary text-white shadow-soft"
                      : "bg-accent text-accent-foreground hover:bg-accent/80"
                  }`}
                >
                  <span>{h.icon}</span> {h.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" /> Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Utensils className="h-3 w-3" /> Food</Label>
              <Input value={profile?.favorite_food || ""} onChange={(e) => updateProfile({ favorite_food: e.target.value })} placeholder="Pizza?" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Music className="h-3 w-3" /> Music</Label>
              <Input value={profile?.favorite_music || ""} onChange={(e) => updateProfile({ favorite_music: e.target.value })} placeholder="Afrobeats?" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Palette className="h-3 w-3" /> Color</Label>
              <Input value={profile?.favorite_color || ""} onChange={(e) => updateProfile({ favorite_color: e.target.value })} placeholder="e.g. Coral" />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <Link to="/app/history" className="w-full">
            <Button variant="outline" className="w-full h-14 rounded-full text-lg gap-2">
              <History className="h-5 w-5" /> View Past Cycles
            </Button>
          </Link>
          <div className="flex gap-3">
            <Button onClick={saveProfile} disabled={saving} className="flex-1 h-14 rounded-full text-lg shadow-pop">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={logout} className="h-14 w-14 rounded-full p-0 text-destructive border-destructive/20 hover:bg-destructive/5">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

      </div>

      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center mb-4">Choose your look</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <Button 
              onClick={generateRandomAvatar} 
              className="h-16 rounded-2xl bg-gradient-warm hover:opacity-90 text-lg shadow-pop"
            >
              <Dices className="mr-2 h-6 w-6" /> 
              Roll the Dice
            </Button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full h-16 rounded-2xl text-lg pointer-events-none">
                <Upload className="mr-2 h-5 w-5" />
                Upload Photo
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Powered by <a href="https://dicebear.com" target="_blank" rel="noreferrer" className="underline hover:text-foreground">DiceBear</a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

