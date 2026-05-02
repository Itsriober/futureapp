import { useEffect, useState } from "react";

export type Category = "Tech" | "Fashion" | "Experience" | "Food" | "Home" | "Other";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  priority: number; // 1-5
  emoji: string;
  createdAt: number;
  status: "active" | "purchased" | "archived";
}

export interface Budget {
  salary: number;
  rent: number;
  bills: number;
  subscriptions: number;
}

export interface Profile {
  name: string;
  onboarded: boolean;
}

const KEYS = {
  budget: "ff.budget",
  wishlist: "ff.wishlist",
  profile: "ff.profile",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("ff:storage", { detail: key }));
}

export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => { setValue(read(key, initial)); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    const handler = () => setValue(read(key, initial));
    window.addEventListener("ff:storage", handler);
    return () => window.removeEventListener("ff:storage", handler);
    // eslint-disable-next-line
  }, [key]);
  const update = (v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      write(key, next);
      return next;
    });
  };
  return [value, update] as const;
}

export const defaultBudget: Budget = { salary: 0, rent: 0, bills: 0, subscriptions: 0 };
export const defaultProfile: Profile = { name: "", onboarded: false };

export const useBudget = () => usePersisted<Budget>(KEYS.budget, defaultBudget);
export const useWishlist = () => usePersisted<WishlistItem[]>(KEYS.wishlist, []);
export const useProfile = () => usePersisted<Profile>(KEYS.profile, defaultProfile);

export function freeMoney(b: Budget) {
  return Math.max(0, b.salary - b.rent - b.bills - b.subscriptions);
}

export function suggestPurchases(items: WishlistItem[], budget: number) {
  // Greedy by priority desc, then lowest price first, fitting budget
  const active = items.filter((i) => i.status === "active");
  const sorted = [...active].sort((a, b) => b.priority - a.priority || a.price - b.price);
  const picked: WishlistItem[] = [];
  let remaining = budget;
  for (const it of sorted) {
    if (it.price <= remaining) {
      picked.push(it);
      remaining -= it.price;
    }
  }
  return { picked, remaining };
}

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n || 0);
}

export const CATEGORIES: Category[] = ["Tech", "Fashion", "Experience", "Food", "Home", "Other"];
export const CATEGORY_EMOJI: Record<Category, string> = {
  Tech: "💻", Fashion: "👟", Experience: "✈️", Food: "🍜", Home: "🛋️", Other: "✨",
};
