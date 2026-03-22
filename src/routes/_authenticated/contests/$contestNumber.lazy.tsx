import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/_authenticated/contests/$contestNumber",
)({
  component: ContestDetailPage,
});

function ContestDetailPage() {
  const { contestNumber } = Route.useParams();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contest #{contestNumber}</h1>
      <p className="text-muted-foreground">Contest detail page.</p>
    </div>
  );
}
