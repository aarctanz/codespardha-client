import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/submissions/$id")({
  component: SubmissionDetailPage,
});

function SubmissionDetailPage() {
  const { id } = Route.useParams();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Submission #{id}</h1>
      <p className="text-muted-foreground">Submission detail page.</p>
    </div>
  );
}
