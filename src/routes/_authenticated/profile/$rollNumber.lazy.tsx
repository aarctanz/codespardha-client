import { createLazyFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { publicProfileQuery } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createLazyFileRoute(
  "/_authenticated/profile/$rollNumber",
)({
  component: ProfilePage,
});

function ProfilePage() {
  const { rollNumber } = Route.useParams();
  const { data: profile } = useSuspenseQuery(publicProfileQuery(rollNumber));

  return (
    <div className="container mx-auto space-y-8">
      {/* User info */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={profile.image} alt={profile.name} />
          <AvatarFallback className="text-xl">
            {profile.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.rollNumber}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Problems Solved"
          value={profile.solved.total}
          subtitle={`/ ${profile.total.total}`}
        />
        <StatCard label="Submissions" value={profile.submissions} />
        <StatCard label="Accepted" value={profile.accepted} />
        <StatCard
          label="Acceptance Rate"
          value={`${Math.round(profile.acceptanceRate)}%`}
        />
      </div>

      {/* Difficulty breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <DifficultyCard
          label="Easy"
          solved={profile.solved.easy}
          total={profile.total.easy}
          color="text-verdict-accepted"
        />
        <DifficultyCard
          label="Medium"
          solved={profile.solved.medium}
          total={profile.total.medium}
          color="text-yellow-500"
        />
        <DifficultyCard
          label="Hard"
          solved={profile.solved.hard}
          total={profile.total.hard}
          color="text-verdict-failed"
        />
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
            {" "}
            {subtitle}
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
          {" "}
          / {total}
        </span>
      </p>
    </div>
  );
}
