import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Sparkles, Wand2, Copy, Clock, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "Recover Any Prompt",
    description: "Upload an AI-generated image or video and get the estimated prompt that created it.",
  },
  {
    icon: Sparkles,
    title: "Full Breakdown",
    description: "Model guess, style tags, settings, and copy-ready prompts for Midjourney, DALL·E, and more.",
  },
  {
    icon: Copy,
    title: "One-Click Copy",
    description: "Copy recovered prompts formatted for your favorite AI tool instantly.",
  },
  {
    icon: Clock,
    title: "Saved History",
    description: "All your analyses are saved. Search and revisit anytime.",
  },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(265 89% 62% / 0.3) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Prompt Recovery Tool
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Reverse Engineer{" "}
            <span className="gradient-text">Any AI Prompt</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Upload an AI-generated image or video — get the full prompt, model, settings, and style tags. Copy-ready for any tool.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild className="gap-2">
              <Link to={user ? "/analyze" : "/auth"}>
                Start Analyzing <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container grid gap-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
            <f.icon className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
