import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/session"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
