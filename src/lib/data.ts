import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DbWishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];
export type DbBudget = Database["public"]["Tables"]["budgets"]["Row"];
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type WishlistStatus = Database["public"]["Enums"]["wishlist_status"];

const LS_KEYS = { budget: "ff.budget", wishlist: "ff.wishlist", profile: "ff.profile", migrated: "ff.migrated" };

export interface LocalBudget { salary: number; rent: number; bills: number; subscriptions: number; }
export interface LocalWishlistItem {
  id: string; name: string; price: number; category: string; priority: number; emoji: string;
  createdAt: number; status: "active" | "purchased" | "archived";
}

/** One-time migration of localStorage data into the user's account on first login. */
export async function migrateLocalDataIfNeeded(userId: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(LS_KEYS.migrated) === userId) return;

  try {
    const rawBudget = localStorage.getItem(LS_KEYS.budget);
    const rawList = localStorage.getItem(LS_KEYS.wishlist);

    if (rawBudget) {
      const b = JSON.parse(rawBudget) as LocalBudget;
      if (b && (b.salary || b.rent || b.bills || b.subscriptions)) {
        await supabase.from("budgets").upsert({
          user_id: userId,
          salary: b.salary || 0,
          rent: b.rent || 0,
          bills: b.bills || 0,
          subscriptions: b.subscriptions || 0,
        }, { onConflict: "user_id" });
      }
    }

    if (rawList) {
      const items = JSON.parse(rawList) as LocalWishlistItem[];
      if (Array.isArray(items) && items.length) {
        // Only migrate if the user has no items yet
        const { count } = await supabase
          .from("wishlist_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId);
        if (!count) {
          const rows = items.map((i) => ({
            user_id: userId,
            name: i.name,
            price: i.price,
            category: i.category,
            priority: i.priority,
            emoji: i.emoji,
            status: i.status,
          }));
          await supabase.from("wishlist_items").insert(rows);
        }
      }
    }

    localStorage.setItem(LS_KEYS.migrated, userId);
    // Clean local copies after successful migration
    localStorage.removeItem(LS_KEYS.budget);
    localStorage.removeItem(LS_KEYS.wishlist);
    localStorage.removeItem(LS_KEYS.profile);
  } catch (e) {
    console.warn("Local data migration failed:", e);
  }
}

export function freeMoney(b: { salary: number; rent: number; bills: number; subscriptions: number }) {
  return Math.max(0, (b.salary || 0) - (b.rent || 0) - (b.bills || 0) - (b.subscriptions || 0));
}

export function suggestPurchases(items: DbWishlistItem[], budget: number) {
  const active = items.filter((i) => i.status === "active");
  
  // Scoring formula: Score = (Priority × 2) + (Weeks on list × 0.5)
  const scored = active.map((it) => {
    const priority = it.priority || 1;
    const createdAt = new Date(it.created_at).getTime();
    const weeksOnList = Math.max(0, (Date.now() - createdAt) / (1000 * 60 * 60 * 24 * 7));
    const score = (priority * 2) + (weeksOnList * 0.5);
    return { ...it, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score || Number(a.price) - Number(b.price));
  
  const picked: DbWishlistItem[] = [];
  let remaining = budget;
  for (const it of sorted) {
    const p = Number(it.price);
    if (p <= remaining) {
      picked.push(it);
      remaining -= p;
    }
  }
  return { picked, remaining };
}


export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n || 0);
}

export type Category = "Tech" | "Fashion" | "Experience" | "Food" | "Home" | "Other";
export const CATEGORIES: Category[] = ["Tech", "Fashion", "Experience", "Food", "Home", "Other"];
export const CATEGORY_EMOJI: Record<Category, string> = {
  Tech: "💻", Fashion: "👟", Experience: "✈️", Food: "🍜", Home: "🛋️", Other: "✨",
};

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"
];

export const HOBBIES = [
  { name: "Travel", icon: "✈️" }, { name: "Cooking", icon: "🍳" }, { name: "Gaming", icon: "🎮" },
  { name: "Fitness", icon: "💪" }, { name: "Reading", icon: "📚" }, { name: "Music", icon: "🎵" },
  { name: "Art", icon: "🎨" }, { name: "Tech", icon: "💻" }, { name: "Nature", icon: "🌲" }
];

export function getZodiacSign(date: string | Date) {
  const d = new Date(date);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return { sign: "Aries", symbol: "♈" };
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return { sign: "Taurus", symbol: "♉" };
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return { sign: "Gemini", symbol: "♊" };
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return { sign: "Cancer", symbol: "♋" };
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return { sign: "Leo", symbol: "♌" };
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return { sign: "Virgo", symbol: "♍" };
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return { sign: "Libra", symbol: "♎" };
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return { sign: "Scorpio", symbol: "♏" };
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return { sign: "Sagittarius", symbol: "♐" };
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return { sign: "Capricorn", symbol: "♑" };
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return { sign: "Aquarius", symbol: "♒" };
  return { sign: "Pisces", symbol: "♓" };
}

