import { createLazyFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { submissionQuery } from "@/lib/queries";

export const Route = createLazyFileRoute("/_authenticated/submissions/$id")({
  component: SubmissionDetailPage,
});

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function SubmissionDetailPage() {
  const { id } = Route.useParams();
  const { data: submission } = useSuspenseQuery(submissionQuery(id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submission #{id.slice(0, 8)}</h1>
        <p className="text-muted-foreground">{submission.problemTitle}</p>
      </div>
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Verdict: </span>
          <span
            className={
              submission.status === "accepted"
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {submission.status.replace(/_/g, " ")}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Language: </span>
          {submission.languageName}
        </div>
        <div>
          <span className="text-muted-foreground">Time: </span>
          {submission.timeSec != null ? `${submission.timeSec}s` : "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Memory: </span>
          {submission.memoryKb != null
            ? `${Math.round(submission.memoryKb / 1024)} MB`
            : "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Submitted: </span>
          {formatTime(submission.createdAt)}
        </div>
      </div>
      {submission.compileOutput && (
        <div>
          <h2 className="text-lg font-semibold">Compilation Output</h2>
          <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
            {submission.compileOutput}
          </pre>
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold">Source Code</h2>
        <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 text-sm">
          {submission.sourceCode}
        </pre>
      </div>
      {submission.testResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Test Results</h2>
          <div className="mt-2 flex gap-1">
            {submission.testResults.map((tr) => (
              <div
                key={tr.position}
                className={`h-6 w-6 rounded text-center text-xs leading-6 ${
                  tr.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
                title={`Test ${tr.position}: ${tr.status}`}
              >
                {tr.position}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
