"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getExpenseColumns } from "@/components/expenses/expense-columns";
import { Expense } from "@/lib/db/supabase-client";

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/signin");
    }

    fetchExpenses();
  }, [session, status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
        <p className="text-muted-foreground">
          Track and manage your family expenses efficiently.
        </p>
      </div> */}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
            <p className="text-muted-foreground">
              Manage your expenses and track your spending.
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="sm:w-auto w-full"
          >
            Add Expense
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>
              View and manage all your expenses in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={getExpenseColumns(fetchExpenses)}
              data={expenses}
              searchKey="type"
            />
          </CardContent>
        </Card>

        <ExpenseDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode="add"
          onExpenseAdded={fetchExpenses}
        />
      </div>
    </div>
  );
}
