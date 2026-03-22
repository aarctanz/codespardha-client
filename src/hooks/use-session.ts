import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Session } from "@/lib/types";

export function useSession() {
  return useQuery<Session | null>({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        return await apiFetch<Session>("/api/auth/get-session");
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
