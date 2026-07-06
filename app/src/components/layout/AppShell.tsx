import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Sparkles, Sun, Moon, Plus } from "lucide-react";
import { app } from "@/config/app";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {children}
    </NavLink>
  );
}

export function AppShell() {
  const { dark, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            {app.name}
          </Link>
          <nav className="ml-1 flex gap-1 sm:ml-3">
            <NavItem to="/score">Score my pitch</NavItem>
            <NavItem to="/decks">My decks</NavItem>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/new" className={cn(buttonVariants({ size: "sm" }))} aria-label="New deck">
              <Plus /> <span className="hidden sm:inline">New deck</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        {app.name} · a themed front-end MVP with mock data · built with the HMA project foundation
      </footer>
    </div>
  );
}
