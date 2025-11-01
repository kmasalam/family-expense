import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { expenseSchema } from "@/lib/validations/transactions";
import { db } from "@/lib/db/supabase-client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: expenses, error } = await db.expenses.findByUserId(
      session.user.id
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();

    // Transform the data before validation
    const transformedData = {
      ...json,
      date: new Date(json.date), // Convert string back to Date for validation
    };

    const body = expenseSchema.parse(transformedData);

    // Convert Date to ISO string for Supabase
    const expenseData = {
      user_id: session.user.id,
      amount: body.amount,
      type: body.type,
      date: body.date.toISOString(), // Convert Date to string
      description: body.description,
    };

    const { data: expense, error } = await db.expenses.create(expenseData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
