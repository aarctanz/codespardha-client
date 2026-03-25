import { createFileRoute } from "@tanstack/react-router";
import { contestQuery, serverTimeQuery } from "@/lib/queries";
import { RouteError } from "@/components/route-error";

export const Route = createFileRoute(
  "/_authenticated/contests/$contestNumber",
)({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(contestQuery(params.contestNumber)),
      context.queryClient.ensureQueryData(serverTimeQuery),
    ]);
  },
  errorComponent: RouteError,
});
