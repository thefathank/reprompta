import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIdx((i) => (i + 1) % prompts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
              <div className="rim-light relative overflow-hidden rounded-md px-4 py-3" style={{ minHeight: 72 }}>
                <p className="font-mono text-xs text-muted-foreground">recovered_prompt</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={promptIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="mt-1 text-sm text-foreground"
                  >
                    {prompts[promptIdx].text}
                  </motion.p>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={promptIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-2"
                >
                  <span className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                    {prompts[promptIdx].model}
                  </span>
                  {prompts[promptIdx].tags.map((tag) => (
                    <span key={tag} className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <p className="mt-5 font-mono text-xs text-muted-foreground">
            37,000+ prompts recovered
          </p>
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
