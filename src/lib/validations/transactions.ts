import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  type: z.string().min(1, "Type is required"),
  date: z.date(),
  description: z.string().optional(),
});

export const incomeSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  type: z.string().min(1, "Type is required"),
  date: z.date(),
  description: z.string().optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;

export type Expense = {
  id: string;
  user_id: string;
  amount: string;
  type: string;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Income = {
  id: string;
  user_id: string;
  amount: string;
  type: string;
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
};
