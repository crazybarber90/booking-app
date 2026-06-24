"use client";

import { useQuery } from "@tanstack/react-query";
import { getProperties } from "@/lib/api";

/**
 * React Query hook za listu hotela (GET /properties).
 * Drži loading/error/cache — container ga samo konzumira.
 */
export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: getProperties,
  });
}
