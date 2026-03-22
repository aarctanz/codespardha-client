import { createFileRoute } from "@tanstack/react-router";
import { problemsetQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/problemset/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(problemsetQuery),
});
