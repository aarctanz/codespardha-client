import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { contestsQuery, serverTimeQuery } from "@/lib/queries";
import { useSession } from "@/hooks/use-session";
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

function formatTimeLeft(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "0m";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function HomePage() {
  const { data: session } = useSession();
  const { data: contests } = useQuery(contestsQuery);
  const { data: serverTime } = useQuery(serverTimeQuery);

  const now = serverTime ? new Date(serverTime.serverTime) : new Date();

  const runningContests =
    contests?.filter((c) => getContestStatus(c, now) === "running") ?? [];
  const upcomingContests =
    contests
      ?.filter((c) => getContestStatus(c, now) === "upcoming")
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 3) ?? [];

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
                <span>Ends in {formatTimeLeft(new Date(contest.endTime), now)}</span>
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
