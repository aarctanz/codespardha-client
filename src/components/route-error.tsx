import { useRouter } from "@tanstack/react-router";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function RouteError({ error }: { error: unknown }) {
  const router = useRouter();

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center py-24 text-center">
        <p className="text-6xl font-bold text-muted-foreground/30">404</p>
        <h1 className="mt-4 text-xl font-semibold">Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => router.history.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.navigate({ to: "/" })}>
            Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">Error</p>
      <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.history.back()}>
          Go Back
        </Button>
        <Button onClick={() => router.invalidate()}>
          Retry
        </Button>
      </div>
    </div>
  );
}
