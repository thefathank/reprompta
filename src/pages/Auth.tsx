import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (isLogin) {
      navigate("/analyze");
    } else {
      toast({ title: "Check your email", description: "We sent you a confirmation link." });
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 lg:px-16 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Mouse-following yellow glow */}
      <motion.div
        className="pointer-events-none fixed h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(45 100% 58% / 0.25), hsl(45 100% 58% / 0.08) 40%, transparent 70%)",
        }}
        animate={{ x: mousePos.x - 250, y: mousePos.y - 250 }}
        transition={{ type: "spring", stiffness: 80, damping: 30, mass: 0.8 }}
      />

      {/* Ambient glow orbs */}
      <motion.div
        className="pointer-events-none absolute -top-[40%] -left-[20%] h-[600px] w-[600px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, hsl(var(--foreground)), transparent 70%)" }}
        animate={{ x: [0, 30, -10, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-[30%] -right-[15%] h-[500px] w-[500px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)" }}
        animate={{ x: [0, -20, 10, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Auth form */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin ? "Sign in to continue." : "Get started with Reprompta."}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin,
            });
            if (error) {
              toast({ title: "Error", description: error.message, variant: "destructive" });
            }
          }}
          className="mt-6 flex h-10 w-full items-center justify-center gap-3 rounded-md border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("apple", {
              redirect_uri: window.location.origin,
            });
            if (error) {
              toast({ title: "Error", description: error.message, variant: "destructive" });
            }
          }}
          className="mt-3 flex h-10 w-full items-center justify-center gap-3 rounded-md border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </button>

        <p className="mt-6 text-xs text-muted-foreground">
          {isLogin ? "No account? " : "Have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-foreground hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
