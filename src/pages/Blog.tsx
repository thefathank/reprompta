import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  tags: string[] | null;
  cover_image_url: string | null;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <head>
        <title>Blog — AI Prompting Tips & Guides | Reprompta</title>
        <meta name="description" content="Learn AI prompting techniques, reverse engineering tips, and guides for Midjourney, DALL·E, Sora, and more." />
      </head>

      <main className="min-h-screen pt-24 pb-16 px-6 lg:px-16 max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Blog</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Tips, guides, and techniques for mastering AI prompts — from image generation to video.
          </p>
        </header>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No articles yet. Check back soon!</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="block group rounded-lg border border-border p-6 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent transition-colors mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
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
                      {post.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-widest">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors mt-1 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
