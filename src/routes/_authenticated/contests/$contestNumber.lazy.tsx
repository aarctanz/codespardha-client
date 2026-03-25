import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { CircleCheck, Trophy, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { contestQuery, leaderboardQuery } from "@/lib/queries";
import { useServerNow } from "@/hooks/use-server-now";
import type { Contest, Problem, StandingEntry, ProblemBreakdown } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  now: Date,
): "Upcoming" | "Running" | "Ended" {
  const start = new Date(contest.startTime).getTime();
  const end = new Date(contest.endTime).getTime();
  const t = now.getTime();
  if (t < start) return "Upcoming";
  if (t < end) return "Running";
  return "Ended";
}

function formatCountdown(diff: number): string {
  if (diff <= 0) return "0s";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function ContestDetailPage() {
  const { contestNumber } = Route.useParams();
  const { data: contest } = useSuspenseQuery(contestQuery(contestNumber));
  const now = useServerNow();
  const status = getContestStatus(contest, now);

  const [activeTab, setActiveTab] = useState<"problems" | "leaderboard">(
    "problems",
  );

  const timerTarget =
    status === "Running"
      ? new Date(contest.endTime)
      : status === "Upcoming"
        ? new Date(contest.startTime)
        : null;
  const timerDiff = timerTarget
    ? timerTarget.getTime() - now.getTime()
    : 0;

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{contest.title}</h1>
        <p className="text-muted-foreground">{contest.description}</p>
      </div>
      <div className="flex items-center gap-6 text-sm">
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
        {timerTarget && timerDiff > 0 && (
          <div className="ml-auto flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-sm tabular-nums">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {status === "Running" ? "Ends in" : "Starts in"}
            </span>
            <span className="font-medium">{formatCountdown(timerDiff)}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("problems")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "problems"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Problems
        </button>
        {status === "Ended" && (
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "leaderboard"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="size-3.5" />
            Leaderboard
          </button>
        )}
      </div>

      {activeTab === "problems" ? (
        <ProblemsTable problems={contest.problems} />
      ) : (
        <LeaderboardSection contestNumber={contestNumber} />
      )}
    </div>
  );
}

function ProblemsTable({ problems }: { problems: Problem[] }) {
  if (problems.length === 0) {
    return <p className="text-muted-foreground">No problems in this contest.</p>;
  }

  return (
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
        {problems.map((problem) => (
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
              {problem.solved && (
                <CircleCheck className="size-4 text-verdict-accepted" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LeaderboardSection({ contestNumber }: { contestNumber: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(leaderboardQuery(contestNumber, page));

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Loading leaderboard...</p>;
  }

  // Collect all problem labels from standings for table headers
  const problemLabels = new Map<string, string>();
  for (const entry of data.standings) {
    for (const b of entry.breakdown) {
      problemLabels.set(b.label, b.slug);
    }
  }
  if (data.currentUser) {
    for (const b of data.currentUser.breakdown) {
      problemLabels.set(b.label, b.slug);
    }
  }
  const sortedLabels = [...problemLabels.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const isCurrentUser = (entry: StandingEntry) =>
    data.currentUser?.rollNumber === entry.rollNumber;

  // Check if current user is already in standings
  const currentUserInStandings = data.currentUser
    ? data.standings.some((s) => s.rollNumber === data.currentUser!.rollNumber)
    : true;

  return (
    <div className="space-y-4">
      {/* Current user highlight if not on this page */}
      {data.currentUser && !currentUserInStandings && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary">
            Your standing
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">#{data.currentUser.rank}</span>
            <Avatar className="size-8">
              <AvatarImage src={data.currentUser.image ?? undefined} />
              <AvatarFallback>{data.currentUser.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{data.currentUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {data.currentUser.rollNumber}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{data.currentUser.totalScore} pts</p>
              <p className="text-xs text-muted-foreground">
                {data.currentUser.problemsSolved} solved · {data.currentUser.penalty} penalty
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Standings table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead className="w-20 text-right">Score</TableHead>
              <TableHead className="w-20 text-right">Penalty</TableHead>
              <TableHead className="w-20 text-right">Solved</TableHead>
              {sortedLabels.map(([label]) => (
                <TableHead key={label} className="w-20 text-center">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.standings.map((entry) => (
              <TableRow
                key={entry.rollNumber}
                className={
                  isCurrentUser(entry) ? "bg-primary/5" : undefined
                }
              >
                <TableCell className="font-semibold">{entry.rank}</TableCell>
                <TableCell>
                  <Link
                    to="/profile/$rollNumber"
                    params={{ rollNumber: entry.rollNumber }}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Avatar className="size-6">
                      <AvatarImage src={entry.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {entry.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{entry.name}</span>
                    {isCurrentUser(entry) && (
                      <span className="text-xs text-primary">(you)</span>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {entry.totalScore}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {entry.penalty}
                </TableCell>
                <TableCell className="text-right">
                  {entry.problemsSolved}
                </TableCell>
                {sortedLabels.map(([label]) => {
                  const pb = entry.breakdown.find(
                    (b) => b.label === label,
                  );
                  return (
                    <TableCell key={label} className="text-center">
                      <ProblemCell breakdown={pb ?? null} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {data.total} participants
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.totalPages}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProblemCell({ breakdown }: { breakdown: ProblemBreakdown | null }) {
  if (!breakdown) {
    return <span className="text-muted-foreground/30">—</span>;
  }

  if (breakdown.solved) {
    return (
      <div>
        <span className="text-sm font-medium text-verdict-accepted">
          +{breakdown.wrongAttempts > 0 ? breakdown.wrongAttempts : ""}
        </span>
        {breakdown.firstAcTime && (
          <p className="text-[10px] text-muted-foreground">
            {formatAcTime(breakdown.firstAcTime)}
          </p>
        )}
      </div>
    );
  }

  return (
    <span className="text-sm font-medium text-verdict-failed">
      -{breakdown.wrongAttempts}
    </span>
  );
}

function formatAcTime(time: string): string {
  const d = new Date(time);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  return `${m}m`;
}
