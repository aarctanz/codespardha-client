import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold">
          Spring
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/problemset"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Problemset
          </Link>
          <Link
            to="/contests"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Contests
          </Link>
          <Link
            to="/submissions"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Submissions
          </Link>
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.name}
                />
                <AvatarFallback>
                  {session.user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={
                  <Link
                    to="/profile/$rollNumber"
                    params={{
                      rollNumber: session.user.rollNumber ?? session.user.id,
                    }}
                  />
                }
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/login";
                      },
                    },
                  })
                }
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        </nav>
      </div>
    </header>
  );
}
