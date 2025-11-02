import { createClient } from "@supabase/supabase-js";

// Type definitions for our tables
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
};

export type CustomType = {
  id: string;
  user_id: string;
  type: string;
  category: "expense" | "income";
  created_at: string;
};
export type Expense = {
  id: string;
  user_id: string;
  amount: string;
  type: string;
  date: string; // This is string (ISO string)
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions for database operations
export const db = {
  // User operations
  users: {
    async create(user: Omit<User, "id" | "created_at" | "updated_at">) {
      return supabaseAdmin.from("users").insert([user]).select().single();
    },
    async findByEmail(email: string) {
      return supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
    },
    async findById(id: string) {
      return supabaseAdmin.from("users").select("*").eq("id", id).single();
    },
  },

  // Expense operations
  expenses: {
    async create(expense: Omit<Expense, "id" | "created_at" | "updated_at">) {
      return supabaseAdmin.from("expenses").insert([expense]).select().single();
    },
    async findByUserId(userId: string) {
      return supabaseAdmin
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
    },
    async update(id: string, updates: Partial<Expense>) {
      return supabaseAdmin
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    },
    async delete(id: string) {
      return supabaseAdmin.from("expenses").delete().eq("id", id);
    },
  },

  // Income operations
  incomes: {
    async create(income: Omit<Income, "id" | "created_at" | "updated_at">) {
      return supabaseAdmin.from("incomes").insert([income]).select().single();
    },
    async findByUserId(userId: string) {
      return supabaseAdmin
        .from("incomes")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
    },
    async update(id: string, updates: Partial<Income>) {
      return supabaseAdmin
        .from("incomes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    },
    async delete(id: string) {
      return supabaseAdmin.from("incomes").delete().eq("id", id);
    },
  },
  customTypes: {
    async create(type: Omit<CustomType, "id" | "created_at">) {
      return supabaseAdmin
        .from("custom_types")
        .insert([type])
        .select()
        .single();
    },

    async findByUserAndCategory(
      userId: string,
      category: "expense" | "income"
    ) {
      return supabaseAdmin
        .from("custom_types")
        .select("*")
        .eq("user_id", userId)
        .eq("category", category)
        .order("type");
    },

    async update(id: string, updates: Partial<CustomType>) {
      return supabaseAdmin
        .from("custom_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    },

    async delete(id: string) {
      return supabaseAdmin.from("custom_types").delete().eq("id", id);
    },

    async deleteByType(
      userId: string,
      type: string,
      category: "expense" | "income"
    ) {
      return supabaseAdmin
        .from("custom_types")
        .delete()
        .eq("user_id", userId)
        .eq("type", type)
        .eq("category", category);
    },
  },
};
