import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  tags: string[] | null;
  cover_image_url: string | null;
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

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.title = "Blog — AI Prompting Tips & Guides | Reprompta";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Learn AI prompting techniques, reverse engineering tips, and guides for Midjourney, DALL·E, Sora, and more.");
  }, []);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, title, excerpt, published_at, tags, cover_image_url")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative min-h-screen overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Mouse-following amber glow */}
      <motion.div
        className="pointer-events-none fixed h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(45 100% 58% / 0.25), hsl(45 100% 58% / 0.08) 40%, transparent 70%)",
        }}
        animate={{ x: mousePos.x - 250, y: mousePos.y - 250 }}
        transition={{ type: "spring", stiffness: 80, damping: 30, mass: 0.8 }}
      />

      {/* Ambient directional key light */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 75% 20%, hsl(45 100% 58% / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Hero header */}
      <section className="relative px-6 pt-32 pb-16 lg:px-16">
        <div className="relative z-10 max-w-4xl">
          <motion.p
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground"
          >
            Insights &amp; Guides
          </motion.p>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.92] tracking-tight"
          >
            The <span className="text-accent-glow">prompt</span>
            <br />
            engineering blog
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground"
          >
            Tips, guides, and techniques for mastering AI prompts — from image generation to video.
          </motion.p>
        </div>
      </section>

      {/* Post listing */}
      <section className="relative z-10 px-6 pb-24 lg:px-16">
        {loading ? (
          <div className="max-w-4xl space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-glass rim-light h-36 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No articles yet. Check back soon!</p>
        ) : (
          <div className="max-w-4xl space-y-5">
            {posts.map((post, index) => (
              <motion.div
                key={post.slug}
                custom={index + 3}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block surface-glass rim-light rounded-xl p-6 transition-all duration-300 hover:card-glow hover:border-accent/20"
                >
                  <div className="flex items-start gap-5">
                    {/* Article number */}
                    <span className="hidden sm:block font-mono text-xs text-muted-foreground/50 pt-1 min-w-[2rem]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors duration-300 mb-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 max-w-lg">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        {post.published_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        {post.tags?.slice(0, 3).map((tag, tagIdx) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className={`text-[10px] uppercase tracking-widest ${tagIdx === 0 ? "bg-accent/15 text-accent border-accent/20" : ""}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300 mt-1.5 shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
