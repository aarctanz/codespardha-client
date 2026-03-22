import { createFileRoute } from "@tanstack/react-router";
import { submissionsQuery } from "@/lib/queries";

type SubmissionsSearch = {
  page?: number;
};

export const Route = createFileRoute("/_authenticated/submissions/")({
  validateSearch: (search: Record<string, unknown>): SubmissionsSearch => ({
    page: Number(search.page) || undefined,
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(submissionsQuery(deps.page)),
});
