import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/get-session`,
      { credentials: "include" },
    );
    if (!res.ok) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }
    const session = await res.json();
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }
    return { session };
  },
  component: () => (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  ),
});
