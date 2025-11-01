"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { ExpenseDialog } from "./expense-dialog";
import { ViewExpense } from "./view-expense";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Expense } from "@/lib/db/supabase-client";

interface ExpenseActionsProps {
  expense: Expense;
  onExpenseUpdated?: () => void;
}

export function ExpenseActions({
  expense,
  onExpenseUpdated,
}: ExpenseActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete expense");
      }

      toast.success("Success", {
        description: "Expense deleted successfully",
      });

      // Close the confirmation dialog
      setIsDeleteDialogOpen(false);

      // Refresh the expenses list
      if (onExpenseUpdated) {
        onExpenseUpdated();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete expense",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openDeleteDialog} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExpenseDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        expense={expense}
        mode="edit"
        onExpenseAdded={onExpenseUpdated}
      />

      <ViewExpense
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        expense={expense}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete Expense"
        isLoading={isDeleteLoading}
        variant="destructive"
      />
    </>
  );
}
