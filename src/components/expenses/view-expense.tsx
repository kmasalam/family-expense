"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/lib/db/supabase-client";

interface ViewExpenseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense;
}

export function ViewExpense({ open, onOpenChange, expense }: ViewExpenseProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>
            View complete details of your expense
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount:</span>
            <span className="text-red-600 font-bold text-lg">
              ${parseFloat(expense.amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Type:</span>
            <Badge variant="outline">{expense.type}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Date:</span>
            <span>{new Date(expense.date).toLocaleDateString()}</span>
          </div>
          {expense.description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-sm text-gray-600">
                {expense.description}
              </p>
            </div>
          )}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Created:</span>
            <span>{new Date(expense.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
