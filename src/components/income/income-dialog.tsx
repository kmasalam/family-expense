"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IncomeInput, incomeSchema } from "@/lib/validations/transactions";
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
import { CalendarIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TypeManagementDialog } from "@/components/type-management-dialog";
import { useCustomTypes } from "@/hooks/use-custom-types";
import { Income } from "@/lib/db/supabase-client";

interface IncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: Income;
  mode?: "add" | "edit";
  onIncomeAdded?: () => void;
}

export function IncomeDialog({
  open,
  onOpenChange,
  income,
  mode = "add",
  onIncomeAdded,
}: IncomeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customType, setCustomType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);
  const [isTypeManagementOpen, setIsTypeManagementOpen] = useState(false);

  // Use the custom types hook with forceRefresh
  const {
    types: managedTypes,
    isLoading: typesLoading,
    forceRefresh,
  } = useCustomTypes("income");

  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: income?.amount || "",
      type: income?.type || "",
      date: income?.date ? new Date(income.date) : new Date(),
      description: income?.description || "",
    },
  });

  // Reset custom type state when dialog opens/closes or when income changes
  useEffect(() => {
    if (open) {
      if (income?.type) {
        // Check if the income type exists in managed types
        if (managedTypes.includes(income.type)) {
          form.setValue("type", income.type);
          setShowCustomType(false);
          setCustomType("");
        } else {
          // It's a custom type not in the list
          setCustomType(income.type);
          setShowCustomType(true);
          form.setValue("type", income.type);
        }
      }
    } else {
      // Reset when dialog closes
      setCustomType("");
      setShowCustomType(false);
    }
  }, [open, income, form, managedTypes]);

  async function onSubmit(data: IncomeInput) {
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
        mode === "edit" && income ? `/api/income/${income.id}` : "/api/income";
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
        throw new Error(errorData.error || "Failed to save income");
      }

      toast.success("Success", {
        description: `Income ${
          mode === "edit" ? "updated" : "added"
        } successfully`,
      });

      onOpenChange(false);
      form.reset();
      setCustomType("");
      setShowCustomType(false);

      // Refresh the income list
      if (onIncomeAdded) {
        onIncomeAdded();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving income:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${mode === "edit" ? "update" : "add"} income`,
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

  const handleTypesChange = () => {
    // Force refresh the types when they change in the management dialog
    forceRefresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Income" : "Add New Income"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update your income details."
              : "Add a new income to your tracker."}
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
                    <Input
                      placeholder="0.00"
                      {...field}
                      type="number"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Type *</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTypeManagementOpen(true)}
                  className="text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Manage Types
                </Button>
              </div>
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
                          disabled={typesLoading}
                        >
                          <option value="">Select a type</option>
                          {managedTypes.map((type) => (
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
                  ? "Update Income"
                  : "Add Income"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Type Management Dialog */}
      <TypeManagementDialog
        open={isTypeManagementOpen}
        onOpenChange={setIsTypeManagementOpen}
        type="income"
        onTypesChange={handleTypesChange}
      />
    </Dialog>
  );
}
