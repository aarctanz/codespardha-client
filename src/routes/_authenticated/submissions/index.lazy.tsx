import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/submissions/")({
  component: SubmissionsPage,
});

function SubmissionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Submissions</h1>
      <p className="text-muted-foreground">Your submissions.</p>
    </div>
  );
}
