"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Income } from "@/lib/db/supabase-client";

interface ViewIncomeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income;
}

export function ViewIncome({ open, onOpenChange, income }: ViewIncomeProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Income Details</DialogTitle>
          <DialogDescription>
            View complete details of your income
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount:</span>
            <span className="text-green-600 font-bold text-lg">
              ${parseFloat(income.amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Type:</span>
            <Badge variant="outline">{income.type}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Date:</span>
            <span>{new Date(income.date).toLocaleDateString()}</span>
          </div>
          {income.description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-sm text-gray-600">{income.description}</p>
            </div>
          )}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Created:</span>
            <span>{new Date(income.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
