import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { contestsQuery } from "@/lib/queries";
import { useSession } from "@/hooks/use-session";
import { useServerNow } from "@/hooks/use-server-now";
import { Button } from "@/components/ui/button";
import type { Contest } from "@/lib/types";
import {
  Code2,
  Trophy,
  FileText,
  ArrowRight,
  Clock,
  Timer,
} from "lucide-react";

export const Route = createLazyFileRoute("/_authenticated/")({
  component: HomePage,
});

function getContestStatus(
  contest: Contest,
  now: Date,
): "upcoming" | "running" | "ended" {
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "running";
}

function formatCountdown(diff: number): string {
  if (diff <= 0) return "0s";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function HomePage() {
  const { data: session } = useSession();
  const { data: contests } = useQuery(contestsQuery);
  const now = useServerNow();

  const runningContests =
    contests?.filter((c) => getContestStatus(c, now) === "running") ?? [];

  const allUpcoming =
    contests
      ?.filter((c) => getContestStatus(c, now) === "upcoming")
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ) ?? [];

  const todayContests = allUpcoming.filter((c) =>
    isSameDay(new Date(c.startTime), now),
  );
  const upcomingContests = allUpcoming
    .filter((c) => !isSameDay(new Date(c.startTime), now))
    .slice(0, 3);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="container mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Hey, {firstName}</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to Codespardha — sharpen your skills, compete, and grow.
        </p>
      </div>

      {/* Running contest banner */}
      {runningContests.map((contest) => (
        <Link
          key={contest.contestNumber}
          to="/contests/$contestNumber"
          params={{ contestNumber: String(contest.contestNumber) }}
          className="group block rounded-lg border border-primary/30 bg-primary/5 p-5 shadow-md shadow-primary/5 transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/15">
                <Timer className="size-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    Live now
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{contest.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                <span>Ends in {formatCountdown(new Date(contest.endTime).getTime() - now.getTime())}</span>
              </div>
              <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      ))}

      {/* Today's upcoming contest banner with live countdown */}
      {todayContests.map((contest) => (
        <Link
          key={contest.contestNumber}
          to="/contests/$contestNumber"
          params={{ contestNumber: String(contest.contestNumber) }}
          className="group block rounded-lg border border-blue-500/30 bg-blue-500/5 p-5 shadow-md shadow-blue-500/5 transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/15">
                <Clock className="size-5 text-blue-500" />
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-blue-500">
                  Today
                </span>
                <h2 className="text-lg font-semibold">{contest.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-mono text-sm font-medium tabular-nums">
                  {formatCountdown(new Date(contest.startTime).getTime() - now.getTime())}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(contest.startTime).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      ))}

      {/* Upcoming contests */}
      {upcomingContests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Upcoming Contests</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingContests.map((contest) => (
              <Link
                key={contest.contestNumber}
                to="/contests/$contestNumber"
                params={{ contestNumber: String(contest.contestNumber) }}
                className="group rounded-lg border p-4 shadow-sm shadow-black/5 transition-all hover:bg-muted/50 hover:shadow-md dark:shadow-black/15"
              >
                <h3 className="font-medium group-hover:text-primary">
                  {contest.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>
                    {new Date(contest.startTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink
          to="/problemset"
          icon={<Code2 className="size-5" />}
          title="Problemset"
          description="Browse and solve coding problems"
        />
        <QuickLink
          to="/contests"
          icon={<Trophy className="size-5" />}
          title="Contests"
          description="Compete in timed programming contests"
        />
        <QuickLink
          to="/submissions"
          icon={<FileText className="size-5" />}
          title="Submissions"
          description="View your submission history"
        />
      </div>
    </div>
  );
}

function QuickLink({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Button
      variant="outline"
      render={<Link to={to} />}
      className="flex h-auto flex-col items-start gap-2 p-5 text-left shadow-sm shadow-black/5 transition-all hover:shadow-md dark:shadow-black/15"
    >
      <div className="text-primary">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm font-normal text-muted-foreground">
          {description}
        </div>
      </div>
    </Button>
  );
}
