import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DbWishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];
export type DbBudget = Database["public"]["Tables"]["budgets"]["Row"];
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type WishlistStatus = Database["public"]["Enums"]["wishlist_status"];

export function freeMoney(b: { salary: number; rent: number; bills: number; subscriptions: number }) {
  return Math.max(0, (b.salary || 0) - (b.rent || 0) - (b.bills || 0) - (b.subscriptions || 0));
}

export function suggestPurchases(items: DbWishlistItem[], budget: number) {
  const active = items.filter((i) => i.status === "active");

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

export const CATEGORY_COLOR: Record<Category, string> = {
  Tech: "bg-blue-500",
  Fashion: "bg-pink-500",
  Experience: "bg-teal-500",
  Food: "bg-amber-500",
  Home: "bg-green-500",
  Other: "bg-coral",
};

export const CATEGORY_BORDER_COLOR: Record<Category, string> = {
  Tech: "border-blue-500",
  Fashion: "border-pink-500",
  Experience: "border-teal-500",
  Food: "border-amber-500",
  Home: "border-green-500",
  Other: "border-coral",
};

export function getCountdown(targetDate: string | null): { label: string; variant: "normal" | "warning" | "overdue" } | null {
  if (!targetDate) return null;
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "❌ Overdue", variant: "overdue" };
  if (diffDays < 7) return { label: `⚠️ ${diffDays} days left`, variant: "warning" };
  return { label: `📅 ${diffDays} days`, variant: "normal" };
}

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
