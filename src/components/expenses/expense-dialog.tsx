"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExpenseInput, expenseSchema } from "@/lib/validations/transactions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Expense } from "@/lib/db/supabase-client";

const expenseTypes = [
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Education",
  "Other",
];

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  mode?: "add" | "edit";
  onExpenseAdded?: () => void;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  mode = "add",
  onExpenseAdded,
}: ExpenseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customType, setCustomType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);

  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense?.amount || "",
      type: expense?.type || "",
      date: expense?.date ? new Date(expense.date) : new Date(),
      description: expense?.description || "",
    },
  });

  // Reset custom type state when dialog opens/closes
  useEffect(() => {
    if (open && expense?.type && !expenseTypes.includes(expense.type)) {
      setCustomType(expense.type);
      setShowCustomType(true);
      form.setValue("type", expense.type);
    } else if (!open) {
      setCustomType("");
      setShowCustomType(false);
    }
  }, [open, expense, form]);

  async function onSubmit(data: ExpenseInput) {
    setIsLoading(true);
    try {
      // Get the final type (either from dropdown or custom input)
      const finalType = showCustomType ? customType : data.type;

      // Validate that we have a type
      if (!finalType.trim()) {
        toast.error("Error", {
          description: "Type is required",
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        amount: data.amount,
        type: finalType,
        date: data.date, // Keep as Date object
        description: data.description,
      };

      const url =
        mode === "edit" && expense
          ? `/api/expenses/${expense.id}`
          : "/api/expenses";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save expense");
      }

      toast.success("Success", {
        description: `Expense ${
          mode === "edit" ? "updated" : "added"
        } successfully`,
      });

      onOpenChange(false);
      form.reset();
      setCustomType("");
      setShowCustomType(false);

      // Refresh the expenses list
      if (onExpenseAdded) {
        onExpenseAdded();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${mode === "edit" ? "update" : "add"} expense`,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleTypeChange = (value: string) => {
    if (value === "custom") {
      setShowCustomType(true);
      form.setValue("type", "");
    } else {
      form.setValue("type", value);
      setShowCustomType(false);
      setCustomType("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update your expense details."
              : "Add a new expense to your tracker."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Type *</FormLabel>
              {!showCustomType ? (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(e) => handleTypeChange(e.target.value)}
                        >
                          <option value="">Select a type</option>
                          {expenseTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                          <option value="custom">Add custom type</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter custom type"
                    value={customType}
                    onChange={(e) => {
                      setCustomType(e.target.value);
                      form.setValue("type", e.target.value);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCustomType(false);
                      setCustomType("");
                      form.setValue("type", "");
                    }}
                  >
                    Cancel Custom Type
                  </Button>
                  {form.formState.errors.type && <FormMessage />}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : mode === "edit"
                  ? "Update Expense"
                  : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
