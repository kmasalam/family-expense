"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";
import Link from "next/link";
import { Expense, Income } from "@/lib/db/supabase-client";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  recentTransactions: (Expense | Income)[];
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    recentTransactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [expensesRes, incomeRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/income"),
      ]);

      const expenses = expensesRes.ok ? await expensesRes.json() : [];
      const income = incomeRes.ok ? await incomeRes.json() : [];

      const totalExpenses = expenses.reduce(
        (sum: number, exp: Expense) => sum + parseFloat(exp.amount),
        0
      );
      const totalIncome = income.reduce(
        (sum: number, inc: Income) => sum + parseFloat(inc.amount),
        0
      );

      const allTransactions = [
        ...expenses.map((exp: Expense) => ({
          ...exp,
          type: "expense" as const,
        })),
        ...income.map((inc: Income) => ({ ...inc, type: "income" as const })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setStats({
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
        recentTransactions: allTransactions,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}! Here's your financial overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats.totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                stats.balance >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              ${stats.balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your finances quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button asChild className="flex-1">
                <Link href="/dashboard/expenses">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Add Expense
                </Link>
              </Button>
              <Button asChild className="flex-1" variant="outline">
                <Link href="/dashboard/income">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Add Income
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.type === "income" ? "Income" : "Expense"}{" "}
                          - {transaction.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm font-medium",
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {parseFloat(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No transactions yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
