import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { contestQuery, serverTimeQuery } from "@/lib/queries";
import type { Contest } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createLazyFileRoute(
  "/_authenticated/contests/$contestNumber",
)({
  component: ContestDetailPage,
});

function getContestStatus(
  contest: Contest,
  serverTime: string,
): "Upcoming" | "Running" | "Ended" {
  const now = new Date(serverTime).getTime();
  const start = new Date(contest.startTime).getTime();
  const end = new Date(contest.endTime).getTime();
  if (now < start) return "Upcoming";
  if (now < end) return "Running";
  return "Ended";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function ContestDetailPage() {
  const { contestNumber } = Route.useParams();
  const { data: contest } = useSuspenseQuery(contestQuery(contestNumber));
  const { data: time } = useSuspenseQuery(serverTimeQuery);
  const status = getContestStatus(contest, time.serverTime);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{contest.title}</h1>
        <p className="text-muted-foreground">{contest.description}</p>
      </div>
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Start: </span>
          {formatTime(contest.startTime)}
        </div>
        <div>
          <span className="text-muted-foreground">End: </span>
          {formatTime(contest.endTime)}
        </div>
        <div>
          <span className="text-muted-foreground">Status: </span>
          <span
            className={
              status === "Running"
                ? "text-verdict-accepted"
                : status === "Upcoming"
                  ? "text-blue-600"
                  : "text-muted-foreground"
            }
          >
            {status}
          </span>
        </div>
      </div>
      {contest.problems.length === 0 ? (
        <p className="text-muted-foreground">No problems in this contest.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Label</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Rating</TableHead>
              <TableHead className="w-16">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contest.problems.map((problem) => (
              <TableRow key={problem.slug}>
                <TableCell className="font-medium">{problem.label}</TableCell>
                <TableCell>
                  <Link
                    to="/problemset/$slug"
                    params={{ slug: problem.slug }}
                    className="hover:underline"
                  >
                    {problem.title}
                  </Link>
                </TableCell>
                <TableCell>{problem.difficulty}</TableCell>
                <TableCell>
                  {problem.solved && <CircleCheck className="size-4 text-verdict-accepted" />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
