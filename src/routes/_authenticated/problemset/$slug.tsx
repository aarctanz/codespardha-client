import { createFileRoute } from "@tanstack/react-router";
import { approachQuery, languagesQuery, problemQuery } from "@/lib/queries";
import { RouteError } from "@/components/route-error";

export const Route = createFileRoute("/_authenticated/problemset/$slug")({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(problemQuery(params.slug)),
      context.queryClient.ensureQueryData(languagesQuery),
      context.queryClient.ensureQueryData(approachQuery(params.slug)),
    ]);
  },
  errorComponent: RouteError,
});
