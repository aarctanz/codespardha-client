import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/problemset/")({
  component: ProblemsetPage,
});

function ProblemsetPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Problemset</h1>
      <p className="text-muted-foreground">Browse problems.</p>
    </div>
  );
}
