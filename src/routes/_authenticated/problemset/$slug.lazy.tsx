import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/problemset/$slug")({
  component: ProblemPage,
});

function ProblemPage() {
  const { slug } = Route.useParams();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Problem: {slug}</h1>
      <p className="text-muted-foreground">Split-pane coding page.</p>
    </div>
  );
}
