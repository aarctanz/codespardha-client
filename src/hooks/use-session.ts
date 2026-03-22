import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    rollNumber?: string;
  };
}

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
