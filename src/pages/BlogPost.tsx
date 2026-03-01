import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface Post {
  title: string;
  content: string;
  excerpt: string | null;
  published_at: string | null;
  author: string;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
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

/* ── Markdown renderer ── */

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={i} className="surface-glass rim-light rounded-xl p-5 overflow-x-auto text-sm font-mono my-6">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (line.trim() === "") { i++; continue; }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-semibold text-foreground mt-10 mb-3">{inlineFormat(line.slice(4))}</h3>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-bold text-foreground mt-12 mb-4">{inlineFormat(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith("# ")) { i++; continue; }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="my-5 space-y-2 text-sm text-muted-foreground">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span className="font-mono text-xs text-accent mt-0.5 shrink-0">{String(j + 1).padStart(2, "0")}</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="my-5 space-y-2 text-sm text-muted-foreground">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span className="text-accent mt-1.5 shrink-0">
                <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="my-6 border-l-2 border-accent/40 pl-5 text-sm italic text-muted-foreground">
          {inlineFormat(line.slice(2))}
        </blockquote>
      );
      i++; continue;
    }

    elements.push(<p key={i} className="text-sm leading-relaxed text-muted-foreground my-3">{inlineFormat(line)}</p>);
    i++;
  }

  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+)`/);

    const matches = [
      linkMatch && { index: linkMatch.index!, length: linkMatch[0].length, node: <Link key={key++} to={linkMatch[2]} className="text-accent hover:underline">{linkMatch[1]}</Link> },
      boldMatch && { index: boldMatch.index!, length: boldMatch[0].length, node: <strong key={key++} className="text-foreground font-medium">{boldMatch[1]}</strong> },
      italicMatch && { index: italicMatch.index!, length: italicMatch[0].length, node: <em key={key++}>{italicMatch[1]}</em> },
      codeMatch && { index: codeMatch.index!, length: codeMatch[0].length, node: <code key={key++} className="surface-glass rim-light px-1.5 py-0.5 rounded text-xs font-mono">{codeMatch[1]}</code> },
    ].filter(Boolean) as { index: number; length: number; node: React.ReactNode }[];

    if (matches.length === 0) { parts.push(remaining); break; }

    const first = matches.reduce((a, b) => (a.index < b.index ? a : b));
    if (first.index > 0) parts.push(remaining.slice(0, first.index));
    parts.push(first.node);
    remaining = remaining.slice(first.index + first.length);
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

/* ── Page component ── */

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("title, content, excerpt, published_at, author, tags, meta_title, meta_description")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    document.title = post.meta_title || `${post.title} | Reprompta`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", post.meta_description || post.excerpt || "");
  }, [post]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setReadProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-6 lg:px-16 max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 w-2/3 surface-glass animate-pulse rounded" />
          <div className="h-4 w-1/3 surface-glass animate-pulse rounded" />
          <div className="h-64 surface-glass animate-pulse rounded mt-8" />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-6 lg:px-16 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <Link to="/blog" className="text-accent hover:underline text-sm">← Back to blog</Link>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Reprompta" },
    datePublished: post.published_at,
    url: `https://reprompta.lovable.app/blog/${slug}`,
  };

  return (
    <div className="relative min-h-screen overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress
          value={readProgress}
          className="h-0.5 rounded-none bg-transparent"
          style={{ "--progress-color": "hsl(var(--accent))" } as React.CSSProperties}
        />
      </div>

      {/* Mouse-following amber glow */}
      <motion.div
        className="pointer-events-none fixed h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(45 100% 58% / 0.2), hsl(45 100% 58% / 0.06) 40%, transparent 70%)",
        }}
        animate={{ x: mousePos.x - 250, y: mousePos.y - 250 }}
        transition={{ type: "spring", stiffness: 80, damping: 30, mass: 0.8 }}
      />

      {/* Ambient key light */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 75% 20%, hsl(45 100% 58% / 0.06) 0%, transparent 70%)",
        }}
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="relative z-10 pt-24 pb-16 px-6 lg:px-16 max-w-3xl mx-auto">
        {/* Back link */}
        <motion.div custom={0} variants={fade} initial="hidden" animate="show">
          <Link
            to="/blog"
            className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors mb-10"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> All articles
          </Link>
        </motion.div>

        <article>
          <header className="mb-12">
            <motion.h1
              custom={1}
              variants={fade}
              initial="hidden"
              animate="show"
              className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight leading-[1.1] mb-5"
            >
              {post.title}
            </motion.h1>

            <motion.div
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
              className="flex items-center gap-3 flex-wrap"
            >
              {post.published_at && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span className="text-xs text-muted-foreground">by {post.author}</span>
              {post.tags?.map((tag, i) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`text-[10px] uppercase tracking-widest ${i === 0 ? "bg-accent/15 text-accent border-accent/20" : ""}`}
                >
                  {tag}
                </Badge>
              ))}
            </motion.div>
          </header>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
          >
            {renderMarkdown(post.content)}
          </motion.div>
        </article>

        {/* CTA footer */}
        <motion.div
          custom={4}
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="surface-glass rim-light rounded-xl p-8 border border-accent/10">
            <p className="text-sm text-muted-foreground mb-4">Ready to try it yourself?</p>
            <Link
              to="/analyze"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              Upload an image or video to Reprompta
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
