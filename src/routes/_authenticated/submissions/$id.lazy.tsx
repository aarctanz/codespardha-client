import { createLazyFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { submissionQuery } from "@/lib/queries";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
          <div className="mt-2 space-y-2">
            {submission.testResults.map((tr) => (
              <Collapsible key={tr.position} defaultOpen={false}>
                <div className="rounded-md border">
                  <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-4 p-3 text-sm hover:bg-muted/50">
                    <ChevronRight className="size-4 transition-transform [[data-panel-open]_&]:rotate-90" />
                    <span className="font-medium">Test {tr.position}</span>
                    <span
                      className={
                        tr.status === "accepted"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {tr.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-muted-foreground">
                      {tr.timeSec}s
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(tr.memoryKb / 1024)} MB
                    </span>
                    {tr.exitCode !== 0 && (
                      <span className="text-muted-foreground">
                        exit code {tr.exitCode}
                      </span>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md border p-2">
                        <span className="text-xs font-medium text-muted-foreground">stdin</span>
                        <pre className="mt-1 overflow-x-auto text-xs">
                          {tr.stdin || "—"}
                        </pre>
                      </div>
                      <div className="rounded-md border p-2">
                        <span className="text-xs font-medium text-muted-foreground">expected output</span>
                        <pre className="mt-1 overflow-x-auto text-xs">
                          {tr.expectedOutput || "—"}
                        </pre>
                      </div>
                      <div className="rounded-md border p-2">
                        <span className="text-xs font-medium text-muted-foreground">stdout</span>
                        <pre className="mt-1 overflow-x-auto text-xs">
                          {tr.stdout || "—"}
                        </pre>
                      </div>
                    </div>
                    {tr.stderr && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-muted-foreground">stderr</span>
                        <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                          {tr.stderr}
                        </pre>
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
