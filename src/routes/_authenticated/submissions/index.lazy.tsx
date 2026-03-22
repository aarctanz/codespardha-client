import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { submissionsQuery } from "@/lib/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createLazyFileRoute("/_authenticated/submissions/")({
  component: SubmissionsPage,
});

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function SubmissionsPage() {
  const { data: submissions } = useSuspenseQuery(submissionsQuery);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Submissions</h1>
      {submissions.length === 0 ? (
        <p className="text-muted-foreground">No submissions yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <Link
                    to="/submissions/$id"
                    params={{ id: sub.id }}
                    className="hover:underline"
                  >
                    {sub.problemTitle}
                  </Link>
                </TableCell>
                <TableCell>{sub.languageName}</TableCell>
                <TableCell
                  className={
                    sub.status === "accepted"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {sub.status.replace(/_/g, " ")}
                </TableCell>
                <TableCell>
                  {sub.timeSec != null ? `${sub.timeSec}s` : "—"}
                </TableCell>
                <TableCell>
                  {sub.memoryKb != null
                    ? `${Math.round(sub.memoryKb / 1024)} MB`
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTime(sub.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
