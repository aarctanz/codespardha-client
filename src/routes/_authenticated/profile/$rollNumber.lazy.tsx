import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileStatsQuery, submissionsQuery } from "@/lib/queries";
import { useSession } from "@/hooks/use-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createLazyFileRoute(
  "/_authenticated/profile/$rollNumber",
)({
  component: ProfilePage,
});

function ProfilePage() {
  const { rollNumber } = Route.useParams();
  const { data: session } = useSession();
  const { data: stats } = useSuspenseQuery(profileStatsQuery);
  const { data: submissions } = useSuspenseQuery(submissionsQuery(1));

  const recentSubmissions = submissions.items.slice(0, 5);
  const user = session?.user;

  return (
    <div className="container mx-auto space-y-8">
      {/* User info */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user?.image} alt={user?.name} />
          <AvatarFallback className="text-xl">
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user?.name ?? rollNumber}</h1>
          <p className="text-sm text-muted-foreground">{rollNumber}</p>
          {user?.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Problems Solved" value={stats.solved.total} subtitle={`/ ${stats.total.total}`} />
        <StatCard label="Submissions" value={stats.submissions} />
        <StatCard label="Accepted" value={stats.accepted} />
        <StatCard
          label="Acceptance Rate"
          value={`${Math.round(stats.acceptanceRate)}%`}
        />
      </div>

      {/* Difficulty breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <DifficultyCard label="Easy" solved={stats.solved.easy} total={stats.total.easy} color="text-verdict-accepted" />
        <DifficultyCard label="Medium" solved={stats.solved.medium} total={stats.total.medium} color="text-yellow-500" />
        <DifficultyCard label="Hard" solved={stats.solved.hard} total={stats.total.hard} color="text-verdict-failed" />
      </div>

      {/* Recent submissions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent Submissions</h2>
        {recentSubmissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSubmissions.map((sub) => (
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
                  <TableCell>
                    <span
                      className={
                        sub.status === "accepted"
                          ? "text-verdict-accepted"
                          : "text-verdict-failed"
                      }
                    >
                      {sub.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {sub.timeSec != null ? `${sub.timeSec}s` : "—"}
                  </TableCell>
                  <TableCell>
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        {subtitle && (
          <span className="text-sm font-normal text-muted-foreground">
            {" "}{subtitle}
          </span>
        )}
      </p>
    </div>
  );
}

function DifficultyCard({
  label,
  solved,
  total,
  color,
}: {
  label: string;
  solved: number;
  total: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className={`text-sm font-medium ${color}`}>{label}</p>
      <p className="text-xl font-bold">
        {solved}
        <span className="text-sm font-normal text-muted-foreground">
          {" "}/ {total}
        </span>
      </p>
    </div>
  );
}
