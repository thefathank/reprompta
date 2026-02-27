import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getTierKey } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, signOut, subscription } = useAuth();
  const tierKey = getTierKey(subscription.productId);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 surface-glass">
      <div className="flex h-14 items-center justify-between px-6 lg:px-16">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
          Reprompta
        </Link>

        <div className="flex items-center gap-6 text-xs font-medium tracking-wide text-muted-foreground">
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          {user ? (
            <>
              <Link to="/analyze" className="transition-colors hover:text-foreground">
                Analyze
              </Link>
              <Link to="/history" className="transition-colors hover:text-foreground">
                History
              </Link>
              {tierKey === "free" ? (
                <Link to="/pricing" className="transition-colors hover:text-accent">
                  Upgrade
                </Link>
              ) : (
                <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
                  {tierKey}
                </Badge>
              )}
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
