import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/_authenticated/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Spring</h1>
      <p className="text-muted-foreground">
        A competitive programming platform for NIT Kurukshetra.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" render={<Link to="/problemset" />}>
          Explore Problems
        </Button>
        <Button variant="outline" render={<Link to="/contests" />}>
          Explore Contests
        </Button>
      </div>
    </div>
  );
}
