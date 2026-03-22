import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { problemsetQuery } from "@/lib/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createLazyFileRoute("/_authenticated/problemset/")({
  component: ProblemsetPage,
});

function ProblemsetPage() {
  const { data: problems } = useSuspenseQuery(problemsetQuery);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Problemset</h1>
      {problems.length === 0 ? (
        <p className="text-muted-foreground">No problems available.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Rating</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.map((problem) => (
              <TableRow key={problem.slug}>
                <TableCell>
                  {problem.solved && <CircleCheck className="size-4 text-green-600" />}
                </TableCell>
                <TableCell>
                  <Link
                    to="/problemset/$slug"
                    params={{ slug: problem.slug }}
                    className="hover:underline"
                  >
                    {problem.label}. {problem.title}
                  </Link>
                </TableCell>
                <TableCell>{problem.difficulty}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {problem.tags.join(", ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
