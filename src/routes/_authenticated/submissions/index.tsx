import { createFileRoute } from "@tanstack/react-router";
import { submissionsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/submissions/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(submissionsQuery),
});
