import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contestsQuery, serverTimeQuery } from "@/lib/queries";
import type { Contest } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createLazyFileRoute("/_authenticated/contests/")({
  component: ContestsPage,
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

function ContestsPage() {
  const { data: contests } = useSuspenseQuery(contestsQuery);
  const { data: time } = useSuspenseQuery(serverTimeQuery);

  return (
    <div className="container mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Contests</h1>
      {contests.length === 0 ? (
        <p className="text-muted-foreground">No contests available.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead className="w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contests.map((contest) => {
              const status = getContestStatus(contest, time.serverTime);
              return (
                <TableRow key={contest.contestNumber}>
                  <TableCell>{contest.contestNumber}</TableCell>
                  <TableCell>
                    <Link
                      to="/contests/$contestNumber"
                      params={{
                        contestNumber: String(contest.contestNumber),
                      }}
                      className="hover:underline"
                    >
                      {contest.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(contest.startTime)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        status === "Running"
                          ? "text-green-600"
                          : status === "Upcoming"
                            ? "text-blue-600"
                            : "text-muted-foreground"
                      }
                    >
                      {status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
