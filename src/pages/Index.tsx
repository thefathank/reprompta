import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: ease as unknown as [number, number, number, number] },
  }),
};

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient light — single directional key */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 75% 20%, hsl(45 100% 58% / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Hero — asymmetric weighted left */}
      <section className="relative flex min-h-[92vh] items-end px-6 pb-24 sm:items-center sm:pb-0 lg:px-16">
        <div className="relative z-10 max-w-xl">
          <motion.p
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground"
          >
            Prompt Recovery Engine
          </motion.p>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.92] tracking-tight"
          >
            Reverse
            <br />
            engineer{" "}
            <span className="text-accent-glow">any</span>
            <br />
            AI prompt
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-8 max-w-sm text-base leading-relaxed text-muted-foreground"
          >
            Upload an AI-generated image or video. Get the full prompt,
            model, settings, and style tags — copy-ready.
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-12"
          >
            <Link
              to={user ? "/analyze" : "/auth"}
              className="group inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-foreground transition-colors hover:text-accent"
            >
              Start analyzing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Right side — floating glass slab */}
        <motion.div
          initial={{ opacity: 0, x: 40, rotateY: -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute right-[-4%] top-[18%] hidden w-[420px] lg:block"
          style={{ perspective: "1200px" }}
        >
          <div className="surface-elevated rounded-lg p-8">
            <div className="mb-6 space-y-2">
              <div className="h-2 w-3/4 rounded-full bg-muted" />
              <div className="h-2 w-1/2 rounded-full bg-muted" />
            </div>
            <div className="space-y-3">
              <div className="rim-light rounded-md px-4 py-3">
                <p className="font-mono text-xs text-muted-foreground">recovered_prompt</p>
                <p className="mt-1 text-sm text-foreground">
                  A cyberpunk cityscape at dusk, neon reflections on wet pavement...
                </p>
              </div>
              <div className="flex gap-2">
                <span className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                  Midjourney v6
                </span>
                <span className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                  --ar 16:9
                </span>
                <span className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                  --style raw
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Capabilities — minimal, no cards */}
      <section className="border-t border-border px-6 py-28 lg:px-16">
        <div className="grid max-w-5xl gap-16 sm:grid-cols-3">
          {[
            {
              label: "01",
              title: "Full breakdown",
              desc: "Model, settings, style tags, and copy-ready prompts for Midjourney, DALL·E, and more.",
            },
            {
              label: "02",
              title: "One-click copy",
              desc: "Recovered prompts formatted for your preferred tool. Ready to paste and generate.",
            },
            {
              label: "03",
              title: "Saved history",
              desc: "Every analysis persists. Search, revisit, and compare past results anytime.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
            >
              <p className="mb-4 font-mono text-xs text-muted-foreground">{item.label}</p>
              <h3 className="mb-3 text-lg font-semibold">{item.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
