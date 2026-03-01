import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const base = "https://reprompta.lovable.app";
  const staticPages = [
    { loc: "/", priority: "1.0" },
    { loc: "/analyze", priority: "0.9" },
    { loc: "/pricing", priority: "0.8" },
    { loc: "/blog", priority: "0.8" },
    { loc: "/auth", priority: "0.3" },
  ];

  const urls = staticPages
    .map(
      (p) =>
        `  <url><loc>${base}${p.loc}</loc><priority>${p.priority}</priority><changefreq>weekly</changefreq></url>`
    )
    .concat(
      (posts ?? []).map(
        (p) =>
          `  <url><loc>${base}/blog/${p.slug}</loc><lastmod>${new Date(p.updated_at).toISOString().split("T")[0]}</lastmod><priority>0.7</priority><changefreq>monthly</changefreq></url>`
      )
    );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});
