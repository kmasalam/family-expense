"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCustomTypes } from "@/hooks/use-custom-types";

interface TypeManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "expense" | "income";
  onTypesChange?: () => void; // Add this callback
}

export function TypeManagementDialog({
  open,
  onOpenChange,
  type,
  onTypesChange,
}: TypeManagementDialogProps) {
  const { types, isLoading, addType, removeType, updateType } =
    useCustomTypes(type);
  const [newType, setNewType] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAddType = async () => {
    if (!newType.trim()) {
      toast.error("Error", {
        description: "Type name cannot be empty",
      });
      return;
    }

    const success = await addType(newType.trim());
    if (success) {
      setNewType("");
      // Notify parent that types have changed
      onTypesChange?.();
      toast.success("Success", {
        description: "Type added successfully",
      });
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(types[index]);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) {
      toast.error("Error", {
        description: "Type name cannot be empty",
      });
      return;
    }

    const oldType = types[editingIndex!];
    const success = await updateType(oldType, editValue.trim());
    if (success) {
      setEditingIndex(null);
      setEditValue("");
      // Notify parent that types have changed
      onTypesChange?.();
      toast.success("Success", {
        description: "Type updated successfully",
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleRemoveType = (index: number) => {
    setDeleteIndex(index);
  };

  const confirmRemove = async () => {
    if (deleteIndex !== null) {
      const typeToRemove = types[deleteIndex];
      const success = await removeType(typeToRemove);
      if (success) {
        // Notify parent that types have changed
        onTypesChange?.();
        toast.success("Success", {
          description: "Type removed successfully",
        });
      }
      setDeleteIndex(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddType();
    }
  };

  const isDefaultType = (typeName: string) => {
    const defaultTypes =
      type === "expense"
        ? [
            "Food",
            "Transportation",
            "Entertainment",
            "Utilities",
            "Healthcare",
            "Shopping",
            "Education",
            "Other",
          ]
        : [
            "Salary",
            "Freelance",
            "Business",
            "Investment",
            "Rental",
            "Bonus",
            "Gift",
            "Other",
          ];

    return defaultTypes.includes(typeName);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset states when closing
      setNewType("");
      setEditingIndex(null);
      setEditValue("");
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Manage {type.charAt(0).toUpperCase() + type.slice(1)} Types
            </DialogTitle>
            <DialogDescription>
              Add, edit, or remove {type} types. Default types (gray) cannot be
              removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add New Type */}
            <div className="flex space-x-2">
              <Input
                placeholder={`Add new ${type} type...`}
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button onClick={handleAddType} size="icon" disabled={isLoading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Types List */}
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium mb-3">Current Types</h4>
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading types...
                </p>
              ) : types.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No types added yet. Add your first type above.
                </p>
              ) : (
                <div className="space-y-2">
                  {types.map((typeItem, index) => {
                    const isDefault = isDefaultType(typeItem);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        {editingIndex === index ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1"
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={saveEdit}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Badge
                              variant={isDefault ? "secondary" : "default"}
                              className="text-sm"
                            >
                              {typeItem}
                              {isDefault && (
                                <span className="ml-1 text-xs">(default)</span>
                              )}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEditing(index)}
                                disabled={isLoading}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {!isDefault && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRemoveType(index)}
                                  className="text-red-600 hover:text-red-700"
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        onConfirm={confirmRemove}
        title="Delete Type"
        description="Are you sure you want to delete this type? This action cannot be undone."
        confirmText="Delete Type"
        variant="destructive"
      />
    </>
  );
}
