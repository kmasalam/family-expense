"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const defaultExpenseTypes = [
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Education",
  "Other",
];

const defaultIncomeTypes = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Bonus",
  "Gift",
  "Other",
];

// Cache for storing types to prevent repeated API calls
const typesCache = new Map();

// Event system for real-time updates
const listeners = new Map();

function notifyListeners(cacheKey: string) {
  const keyListeners = listeners.get(cacheKey) || [];
  keyListeners.forEach((listener: () => void) => listener());
}

export function useCustomTypes(category: "expense" | "income") {
  const { data: session } = useSession();
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultTypes =
    category === "expense" ? defaultExpenseTypes : defaultIncomeTypes;
  const cacheKey = `${session?.user?.id}-${category}`;

  const loadTypes = useCallback(async () => {
    // Return cached data if available
    if (typesCache.has(cacheKey)) {
      setTypes(typesCache.get(cacheKey));
      setIsLoading(false);
      return;
    }

    if (!session?.user?.id) {
      // Use defaults if no session
      setTypes(defaultTypes);
      typesCache.set(cacheKey, defaultTypes);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/custom-types?category=${category}`);

      if (response.ok) {
        const customTypes = await response.json();
        // Combine default types with custom types, removing duplicates
        const allTypes = [
          ...new Set([...defaultTypes, ...customTypes.map((t: any) => t.type)]),
        ];
        setTypes(allTypes);
        typesCache.set(cacheKey, allTypes);
      } else {
        // Fallback to default types
        setTypes(defaultTypes);
        typesCache.set(cacheKey, defaultTypes);
      }
    } catch (error) {
      console.error("Error loading custom types:", error);
      setTypes(defaultTypes);
      typesCache.set(cacheKey, defaultTypes);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, category, defaultTypes, cacheKey]);

  useEffect(() => {
    loadTypes();

    // Set up listener for updates
    const listener = () => {
      loadTypes();
    };

    if (!listeners.has(cacheKey)) {
      listeners.set(cacheKey, []);
    }
    listeners.get(cacheKey).push(listener);

    // Cleanup
    return () => {
      if (listeners.has(cacheKey)) {
        const keyListeners = listeners.get(cacheKey);
        const index = keyListeners.indexOf(listener);
        if (index > -1) {
          keyListeners.splice(index, 1);
        }
      }
    };
  }, [loadTypes, cacheKey]);

  const addType = async (type: string) => {
    const trimmedType = type.trim();

    if (!session?.user?.id) {
      // If no session, just update local state and cache
      const newTypes = [...new Set([...types, trimmedType])];
      setTypes(newTypes);
      typesCache.set(cacheKey, newTypes);
      notifyListeners(cacheKey);
      return true;
    }

    try {
      const response = await fetch("/api/custom-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: trimmedType,
          category,
        }),
      });

      if (response.ok) {
        // Invalidate cache and reload
        typesCache.delete(cacheKey);
        await loadTypes();
        notifyListeners(cacheKey);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add type");
      }
    } catch (error) {
      console.error("Error adding custom type:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to add type",
      });
      return false;
    }
  };

  const removeType = async (type: string) => {
    if (!session?.user?.id) {
      // If no session, just update local state (but don't remove default types)
      if (!defaultTypes.includes(type)) {
        const newTypes = types.filter((t) => t !== type);
        setTypes(newTypes);
        typesCache.set(cacheKey, newTypes);
        notifyListeners(cacheKey);
      }
      return true;
    }

    try {
      // First, get the custom type ID
      const response = await fetch(`/api/custom-types?category=${category}`);
      if (response.ok) {
        const customTypes = await response.json();
        const customType = customTypes.find((t: any) => t.type === type);

        if (customType) {
          const deleteResponse = await fetch(
            `/api/custom-types/${customType.id}`,
            {
              method: "DELETE",
            }
          );

          if (deleteResponse.ok) {
            // Invalidate cache and reload
            typesCache.delete(cacheKey);
            await loadTypes();
            notifyListeners(cacheKey);
            return true;
          } else {
            throw new Error("Failed to delete type");
          }
        } else {
          // It's a default type, just remove from local state
          if (!defaultTypes.includes(type)) {
            const newTypes = types.filter((t) => t !== type);
            setTypes(newTypes);
            typesCache.set(cacheKey, newTypes);
            notifyListeners(cacheKey);
          }
          return true;
        }
      } else {
        throw new Error("Failed to fetch types");
      }
    } catch (error) {
      console.error("Error removing custom type:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to remove type",
      });
      return false;
    }
  };

  const updateType = async (oldType: string, newType: string) => {
    // For simplicity, we'll remove the old type and add the new one
    const removed = await removeType(oldType);
    if (removed) {
      return await addType(newType);
    }
    return false;
  };

  const reloadTypes = useCallback(() => {
    typesCache.delete(cacheKey);
    return loadTypes();
  }, [loadTypes, cacheKey]);

  // Force refresh function that can be called from parent components
  const forceRefresh = useCallback(() => {
    typesCache.delete(cacheKey);
    loadTypes();
  }, [loadTypes, cacheKey]);

  return {
    types,
    isLoading,
    addType,
    removeType,
    updateType,
    reloadTypes,
    forceRefresh,
  };
}
