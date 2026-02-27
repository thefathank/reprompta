import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 surface-glass">
      <div className="flex h-14 items-center justify-between px-6 lg:px-16">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
          PromptLens
        </Link>

        <div className="flex items-center gap-6 text-xs font-medium tracking-wide text-muted-foreground">
          {user ? (
            <>
              <Link to="/analyze" className="transition-colors hover:text-foreground">
                Analyze
              </Link>
              <Link to="/history" className="transition-colors hover:text-foreground">
                History
              </Link>
              <button onClick={signOut} className="transition-colors hover:text-foreground">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
