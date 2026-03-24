import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth";
import { Sun, Moon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

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
                render={
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  />
                }
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
                        rollNumber:
                          session.user.rollNumber ?? session.user.id,
                      }}
                    />
                  }
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex gap-1 px-1.5 py-1.5">
                  <ThemeButton
                    active={theme === "light"}
                    onClick={() => setTheme("light")}
                    icon={<Sun className="size-4" />}
                  />
                  <ThemeButton
                    active={theme === "dark"}
                    onClick={() => setTheme("dark")}
                    icon={<Moon className="size-4" />}
                  />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
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

function ThemeButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 cursor-pointer items-center justify-center rounded-md py-1.5 transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
    </button>
  );
}
