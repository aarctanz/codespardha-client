import { createFileRoute } from "@tanstack/react-router";
import { publicProfileQuery } from "@/lib/queries";
import { RouteError } from "@/components/route-error";

export const Route = createFileRoute("/_authenticated/profile/$rollNumber")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      publicProfileQuery(params.rollNumber),
    );
  },
  errorComponent: RouteError,
});
