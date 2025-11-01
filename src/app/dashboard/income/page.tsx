"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { IncomeDialog } from "@/components/income/income-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIncomeColumns } from "@/components/income/income-columns";
import { Income } from "@/lib/db/supabase-client";

export default function IncomePage() {
  const { data: session, status } = useSession();
  const [income, setIncome] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchIncome = async () => {
    try {
      const response = await fetch("/api/income");
      if (!response.ok) throw new Error("Failed to fetch income");
      const data = await response.json();
      setIncome(data);
    } catch (error) {
      console.error("Error fetching income:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/signin");
    }

    fetchIncome();
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
        <h1 className="text-3xl font-bold tracking-tight">Income Tracker</h1>
        <p className="text-muted-foreground">
          Track and manage your family income efficiently.
        </p>
      </div> */}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Income</h2>
            <p className="text-muted-foreground">
              Manage your income sources and track your earnings.
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="sm:w-auto w-full"
          >
            Add Income
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Income</CardTitle>
            <CardDescription>
              View and manage all your income in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={getIncomeColumns(fetchIncome)}
              data={income}
              searchKey="type"
            />
          </CardContent>
        </Card>

        <IncomeDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode="add"
          onIncomeAdded={fetchIncome}
        />
      </div>
    </div>
  );
}
