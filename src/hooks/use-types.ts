"use client";

import { useState, useEffect } from "react";

export function useTypes(type: "expense" | "income", defaultTypes: string[]) {
  const [types, setTypes] = useState<string[]>(defaultTypes);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`${type}-types`);
    if (stored) {
      try {
        setTypes(JSON.parse(stored));
      } catch (error) {
        console.error(`Error loading ${type} types:`, error);
      }
    }
  }, [type]);

  const updateTypes = (newTypes: string[]) => {
    setTypes(newTypes);
    localStorage.setItem(`${type}-types`, JSON.stringify(newTypes));
  };

  return [types, updateTypes] as const;
}
