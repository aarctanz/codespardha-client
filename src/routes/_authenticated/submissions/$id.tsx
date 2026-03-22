import { createFileRoute } from "@tanstack/react-router";
import { submissionQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/submissions/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(submissionQuery(params.id)),
});
