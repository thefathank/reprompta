import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const prompts = [
  {
    text: "A cyberpunk cityscape at dusk, neon reflections on wet pavement, volumetric fog...",
    model: "Midjourney v6",
    tags: ["--ar 16:9", "--style raw"],
  },
  {
    text: "Elderly woman's hands shaping clay on a wheel, dramatic chiaroscuro lighting, 35mm film grain...",
    model: "DALL·E 3",
    tags: ["1024×1024", "vivid"],
  },
  {
    text: "Isometric tiny world inside a glass terrarium, miniature waterfalls, bioluminescent plants...",
    model: "Stable Diffusion XL",
    tags: ["--steps 30", "--cfg 7.5"],
  },
  {
    text: "Abandoned brutalist library overgrown with vines, golden hour light streaming through broken skylights...",
    model: "Runway Gen-3",
    tags: ["16:9", "cinematic"],
  },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [promptIdx, setPromptIdx] = useState(0);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIdx((i) => (i + 1) % prompts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

      {/* Cycling prompt card — background accent */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-[460px] translate-y-[240px] lg:translate-x-[340px] lg:translate-y-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={promptIdx}
              initial={{ opacity: 0, y: 16, rotate: 1 }}
              animate={{ opacity: 0.75, y: 0, rotate: -1.5 }}
              exit={{ opacity: 0, y: -12, rotate: -3 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="surface-glass rounded-xl border border-border/40 p-7">
                <div className="rim-light rounded-md px-4 py-3">
                  <p className="font-mono text-xs text-muted-foreground tracking-wider">recovered_prompt</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground line-clamp-3">
                    {prompts[promptIdx].text}
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                    {prompts[promptIdx].model}
                  </span>
                  {prompts[promptIdx].tags.map((tag) => (
                    <span key={tag} className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
          {isLogin ? "Sign in to continue." : "Get started with Promptora."}
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
