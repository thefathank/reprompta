import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Search, Trash2, Film, Lock, Sparkles, ImageIcon } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { motion } from "framer-motion";
import { getTierByProductId } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AnalysisRow {
  id: string;
  media_url: string;
  media_type: string;
  file_name: string | null;
  recovered_prompt: string | null;
  model_guess: string | null;
  settings: Record<string, string>;
  style_tags: string[];
  copy_ready_prompts: Record<string, string>;
  full_breakdown: any;
  created_at: string;
}

/** Extract storage path from various media_url formats */
function extractStoragePath(mediaUrl: string): string | null {
  if (mediaUrl.startsWith("data:")) return null;
  if (!mediaUrl.startsWith("http")) return mediaUrl; // already a path
  const publicMarker = "/object/public/media-uploads/";
  const idx = mediaUrl.indexOf(publicMarker);
  if (idx >= 0) return mediaUrl.substring(idx + publicMarker.length);
  const signedMarker = "/object/sign/media-uploads/";
  const sidx = mediaUrl.indexOf(signedMarker);
  if (sidx >= 0) return mediaUrl.substring(sidx + signedMarker.length).split("?")[0];
  return null;
}

export default function HistoryPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const tier = getTierByProductId(subscription.productId);
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading history", description: error.message, variant: "destructive" });
    } else {
      const rows = (data as any[]) || [];
      setAnalyses(rows);
      // Generate signed URLs for image thumbnails
      const urls: Record<string, string> = {};
      await Promise.all(
        rows.map(async (a) => {
          if (a.media_type !== "image") return;
          const path = extractStoragePath(a.media_url);
          if (!path) return;
          const { data: signedData } = await supabase.storage
            .from("media-uploads")
            .createSignedUrl(path, 3600);
          if (signedData) urls[a.id] = signedData.signedUrl;
        })
      );
      setSignedUrls(urls);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAnalyses(); }, [user]);

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from("analyses").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (expanded === id) setExpanded(null);
    }
  };

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Gate: free tier — show upgrade dialog immediately
  useEffect(() => {
    if (!tier.history && !subscription.isLoading) {
      setShowUpgradeDialog(true);
    }
  }, [tier.history, subscription.isLoading]);

  const filtered = analyses.filter((a) =>
    !search || (a.recovered_prompt?.toLowerCase().includes(search.toLowerCase()) ||
    a.file_name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen px-6 pt-24 pb-16 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your past analyses.</p>

        {/* Upgrade dialog for free tier */}
        <Dialog open={showUpgradeDialog} onOpenChange={(open) => {
          setShowUpgradeDialog(open);
          if (!open && !tier.history) navigate("/analyze");
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Upgrade to access History
              </DialogTitle>
              <DialogDescription>
                Analysis history lets you revisit and search all your past prompt recoveries. Upgrade to Basic or Pro to unlock this feature.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => { setShowUpgradeDialog(false); navigate("/analyze"); }}
                className="flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Go back
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="flex h-10 items-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                View Plans
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative mt-8">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by prompt or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-20 text-sm text-muted-foreground">
              {search ? "No results." : "No analyses yet."}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((a) => (
                <div key={a.id}>
                  <button
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary">
                      {a.media_type === "image" && signedUrls[a.id] ? (
                        <img src={signedUrls[a.id]} alt="" className="h-full w-full object-cover" />
                      ) : a.media_type === "image" ? (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Film className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{a.recovered_prompt || "No prompt"}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.file_name} · {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {a.model_guess && (
                      <span className="shrink-0 rounded bg-secondary px-2 py-1 text-xs text-muted-foreground">
                        {a.model_guess}
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAnalysis(a.id); }}
                      className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                  {expanded === a.id && (
                    <div className="pb-6 pl-14">
                      <AnalysisResult
                        data={{
                          recovered_prompt: a.recovered_prompt || "",
                          model_guess: a.model_guess || "Unknown",
                          settings: (a.settings as Record<string, string>) || {},
                          style_tags: a.style_tags || [],
                          copy_ready_prompts: (a.copy_ready_prompts as Record<string, string>) || {},
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
