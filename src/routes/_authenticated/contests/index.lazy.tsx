import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/contests/")({
  component: ContestsPage,
});

function ContestsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contests</h1>
      <p className="text-muted-foreground">Browse contests.</p>
    </div>
  );
}
