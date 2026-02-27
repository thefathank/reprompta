import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { prompts } from "@/data/prompts";

function LiveCount() {
  const BASE = 37273;
  const [count, setCount] = useState(BASE);
  const countRef = useRef(BASE);

  useEffect(() => {
    const tick = () => {
      const delay = 2000 + Math.random() * 5000;
      const bump = Math.random() < 0.3 ? 2 : 1;
      countRef.current += bump;
      setCount(countRef.current);
      timeout = setTimeout(tick, delay);
    };
    let timeout = setTimeout(tick, 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
      {count.toLocaleString()} prompts recovered
    </p>
  );
}

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIdx((i) => (i + 1) % prompts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Mouse-following yellow glow */}
      <motion.div
        className="pointer-events-none fixed h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(45 100% 58% / 0.25), hsl(45 100% 58% / 0.08) 40%, transparent 70%)",
        }}
        animate={{ x: mousePos.x - 250, y: mousePos.y - 250 }}
        transition={{ type: "spring", stiffness: 80, damping: 30, mass: 0.8 }}
      />

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

        {/* Right side — stacked prompt cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          className="absolute right-[-4%] top-[12%] hidden w-[480px] lg:block xl:w-[600px] 2xl:w-[720px]"
        >
          <LiveCount />
          <div className="relative mt-2 h-[300px] xl:h-[360px] 2xl:h-[420px]">
            {prompts.map((prompt, i) => {
              const offset = (i - promptIdx + prompts.length) % prompts.length;
              const isActive = offset === 0;
              const visible = offset <= 3;
              const opacityMap = [1, 0.6, 0.35, 0.18];
              const rotateMap = [0, 2, 3.5, 4.5];

              return (
                <motion.div
                  key={i}
                  animate={{
                    y: offset * 24,
                    x: offset * 10,
                    scale: 1 - offset * 0.03,
                    rotate: rotateMap[offset] ?? 4.5,
                    zIndex: prompts.length - offset,
                    opacity: visible ? (opacityMap[offset] ?? 0) : 0,
                  }}
                  transition={{
                    y: { type: "spring", stiffness: 200, damping: 22 },
                    x: { type: "spring", stiffness: 200, damping: 22 },
                    scale: { type: "spring", stiffness: 200, damping: 22 },
                    rotate: { type: "spring", stiffness: 200, damping: 22 },
                    opacity: { duration: 0.15, ease: "easeOut" },
                    zIndex: { duration: 0 },
                  }}
                  className="absolute inset-x-0 top-0"
                  style={{ transformOrigin: "bottom left" }}
                >
                  <div className={`surface-glass rounded-xl border p-5 xl:p-7 2xl:p-9 ${isActive ? 'card-glow border-accent/20' : 'border-border/40'}`}>
                    <div className="rim-light rounded-md px-4 py-3 xl:px-5 xl:py-4 2xl:px-6 2xl:py-5">
                      <p className="font-mono text-xs text-muted-foreground tracking-wider">recovered_prompt</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground xl:mt-3 xl:text-base">
                        {prompt.text}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 xl:mt-4">
                      <span className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground xl:px-3 xl:py-1.5 xl:text-sm">
                        {prompt.model}
                      </span>
                      {prompt.tags.map((tag) => (
                        <span key={tag} className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground xl:px-3 xl:py-1.5 xl:text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
