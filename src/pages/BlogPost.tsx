import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";

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

/** Minimal markdown renderer — handles headings, bold, italic, links, code blocks, lists */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={i} className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono my-4">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-semibold mt-8 mb-3">{inlineFormat(line.slice(4))}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-xl font-semibold mt-10 mb-4">{inlineFormat(line.slice(3))}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      i++; // skip top-level heading (we render title separately)
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1.5 my-4 text-sm text-muted-foreground">
          {items.map((item, j) => <li key={j}>{inlineFormat(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1.5 my-4 text-sm text-muted-foreground">
          {items.map((item, j) => <li key={j}>{inlineFormat(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Paragraph
    elements.push(<p key={i} className="text-sm leading-relaxed text-muted-foreground my-3">{inlineFormat(line)}</p>);
    i++;
  }

  return elements;
}

function inlineFormat(text: string): React.ReactNode {
  // Process bold, italic, inline code, and links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Link [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    // Bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Italic *text*
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    // Inline code `text`
    const codeMatch = remaining.match(/`([^`]+)`/);

    const matches = [
      linkMatch && { index: linkMatch.index!, length: linkMatch[0].length, node: <Link key={key++} to={linkMatch[2]} className="text-accent hover:underline">{linkMatch[1]}</Link> },
      boldMatch && { index: boldMatch.index!, length: boldMatch[0].length, node: <strong key={key++} className="text-foreground font-medium">{boldMatch[1]}</strong> },
      italicMatch && { index: italicMatch.index!, length: italicMatch[0].length, node: <em key={key++}>{italicMatch[1]}</em> },
      codeMatch && { index: codeMatch.index!, length: codeMatch[0].length, node: <code key={key++} className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono">{codeMatch[1]}</code> },
    ].filter(Boolean) as { index: number; length: number; node: React.ReactNode }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches.reduce((a, b) => (a.index < b.index ? a : b));
    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index));
    }
    parts.push(first.node);
    remaining = remaining.slice(first.index + first.length);
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-6 lg:px-16 max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-muted/30 animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-muted/30 animate-pulse rounded" />
          <div className="h-64 bg-muted/30 animate-pulse rounded mt-8" />
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

  // JSON-LD structured data
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
    <main className="min-h-screen pt-24 pb-16 px-6 lg:px-16 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-3 w-3" /> All articles
      </Link>

      <article>
        <header className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
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
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-widest">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <div className="prose-custom">{renderMarkdown(post.content)}</div>
      </article>

      <div className="mt-16 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">Ready to try it yourself?</p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          Upload an image or video to Reprompta <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </main>
  );
}
