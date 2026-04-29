import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/analyze" className="transition-colors hover:text-foreground" onClick={() => setOpen(false)}>
        Analyze
      </Link>
      <Link to="/blog" className="transition-colors hover:text-foreground" onClick={() => setOpen(false)}>
        Blog
      </Link>
      {user ? (
        <>
          <Link to="/history" className="transition-colors hover:text-foreground" onClick={() => setOpen(false)}>
            History
          </Link>
          <button onClick={() => { signOut(); setOpen(false); }} className="transition-colors hover:text-foreground text-left">
            Sign out
          </button>
        </>
      ) : (
        <Link to="/auth" className="transition-colors hover:text-foreground" onClick={() => setOpen(false)}>
          Sign in
        </Link>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 surface-glass">
      <div className="flex h-14 items-center justify-between px-6 lg:px-16">
        <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
          Reprompta
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide text-muted-foreground">
          {navLinks}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-6 pb-4 pt-3 flex flex-col gap-4 text-xs font-medium tracking-wide text-muted-foreground surface-glass">
          {navLinks}
        </div>
      )}
    </nav>
  );
}
