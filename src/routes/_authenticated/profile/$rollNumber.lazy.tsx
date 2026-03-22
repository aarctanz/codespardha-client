import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/_authenticated/profile/$rollNumber",
)({
  component: ProfilePage,
});

function ProfilePage() {
  const { rollNumber } = Route.useParams();
  return (
    <div className="container mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground">Roll Number: {rollNumber}</p>
    </div>
  );
}
