import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/",
  }),
  beforeLoad: async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/get-session`,
      { credentials: "include" },
    );
    if (res.ok) {
      const session = await res.json();
      if (session?.user) {
        throw redirect({ to: "/" });
      }
    }
  },
});
