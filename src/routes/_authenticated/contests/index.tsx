import { createFileRoute } from "@tanstack/react-router";
import { contestsQuery, serverTimeQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/contests/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(contestsQuery),
      context.queryClient.ensureQueryData(serverTimeQuery),
    ]);
  },
});
