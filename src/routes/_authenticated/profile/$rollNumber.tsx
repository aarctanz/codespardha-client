import { createFileRoute } from "@tanstack/react-router";
import { profileStatsQuery, submissionsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/profile/$rollNumber")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileStatsQuery),
      context.queryClient.ensureQueryData(submissionsQuery(1)),
    ]);
  },
});
