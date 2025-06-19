import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: authData, isLoading } = useQuery<{user: User} | null>({
    queryKey: ["/api/auth/session"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0,
  });

  const user = authData?.user || null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
