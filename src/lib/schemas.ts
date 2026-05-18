import { z } from "zod";
import { CATEGORIES } from "./data";

export const newItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  price: z.number().positive("Price must be greater than 0"),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  priority: z.number().int().min(1).max(5),
  target_date: z.string().date().nullable().optional(),
});

export const expenseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().nonnegative("Amount can't be negative"),
  is_savings: z.boolean(),
});

export const salarySchema = z.number().positive("Salary must be greater than 0");
