import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export async function exportListi(userId: string) {
  const [wishlistRes, cyclesRes, expensesRes] = await Promise.all([
    supabase.from("wishlist_items").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("payday_cycles").select("*, cycle_allocations(status, wishlist_items(name, price))").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("fixed_expenses").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
  ]);

  // Sheet 1 — Wishlist
  const wishlistRows = (wishlistRes.data ?? []).map((i) => ({
    Name: i.name,
    Emoji: i.emoji,
    Category: i.category,
    "Price (KES)": Number(i.price),
    Priority: i.priority,
    Status: i.status,
    "Target Date": i.target_date ?? "",
    "Added On": new Date(i.created_at).toLocaleDateString("en-KE"),
  }));

  // Sheet 2 — Payday History
  const historyRows = (cyclesRes.data ?? []).map((c: any) => {
    const allocs = c.cycle_allocations ?? [];
    const items = allocs.map((a: any) => a.wishlist_items?.name).filter(Boolean).join(", ");
    const spent = allocs.reduce((sum: number, a: any) => sum + Number(a.wishlist_items?.price ?? 0), 0);
    return {
      Month: c.cycle_month,
      "Salary (KES)": Number(c.salary_amount),
      "Deductions (KES)": Number(c.total_deductions),
      "Savings (KES)": Number(c.savings_amount),
      "Discretionary (KES)": Number(c.discretionary_balance),
      "Items Funded": allocs.length,
      "Spent (KES)": spent,
      "Items": items,
      Date: new Date(c.created_at).toLocaleDateString("en-KE"),
    };
  });

  // Sheet 3 — Fixed Expenses
  const expenseRows = (expensesRes.data ?? []).map((e) => ({
    Name: e.name,
    "Amount (KES)": Number(e.amount),
    Type: e.is_savings ? "Savings Lock" : "Expense",
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wishlistRows), "Wishlist");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(historyRows.length ? historyRows : [{ Note: "No payday cycles yet" }]), "Payday History");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows.length ? expenseRows : [{ Note: "No expenses yet" }]), "Fixed Expenses");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `listi-export-${date}.xlsx`);
}
