import { createFileRoute } from "@tanstack/react-router";
import { submissionQuery } from "@/lib/queries";
import { RouteError } from "@/components/route-error";

export const Route = createFileRoute("/_authenticated/submissions/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(submissionQuery(params.id)),
  errorComponent: RouteError,
});
