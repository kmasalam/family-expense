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
import { IncomeDialog } from "./income-dialog";
import { ViewIncome } from "./view-income";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Income } from "@/lib/db/supabase-client";

interface IncomeActionsProps {
  income: Income;
  onIncomeUpdated?: () => void;
}

export function IncomeActions({ income, onIncomeUpdated }: IncomeActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`/api/income/${income.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete income");
      }

      toast.success("Success", {
        description: "Income deleted successfully",
      });

      // Close the confirmation dialog
      setIsDeleteDialogOpen(false);

      // Refresh the income list
      if (onIncomeUpdated) {
        onIncomeUpdated();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete income",
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

      <IncomeDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        income={income}
        mode="edit"
        onIncomeAdded={onIncomeUpdated}
      />

      <ViewIncome
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        income={income}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Income"
        description="Are you sure you want to delete this income? This action cannot be undone."
        confirmText="Delete Income"
        isLoading={isDeleteLoading}
        variant="destructive"
      />
    </>
  );
}
