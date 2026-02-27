import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/MediaUploader";
import { AnalysisResult } from "@/components/AnalysisResult";
import { ModelComparison, type ModelResult } from "@/components/ModelComparison";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getTierByProductId, getTierKey } from "@/lib/subscription";
import { useNavigate, useSearchParams } from "react-router-dom";

interface AnalysisData {
  recovered_prompt: string;
  model_guess: string;
  confidence_score?: number;
  settings: Record<string, string>;
  style_tags: string[];
  copy_ready_prompts: Record<string, string>;
}

interface UsageData {
  image_analyses_used: number;
  video_analyses_used: number;
  usage_reset_at: string;
}

const COMPARE_MODELS = [
  { model: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { model: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { model: "google/gemini-3-flash-preview", label: "Gemini 3 Flash" },
];

export default function Analyze() {
  const { user, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState<ModelResult[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);

  const tier = getTierByProductId(subscription.productId);
  const tierKey = getTierKey(subscription.productId);

  // Refresh subscription on checkout success
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      checkSubscription();
    }
  }, [searchParams, checkSubscription]);

  // Fetch usage
  const fetchUsage = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("image_analyses_used, video_analyses_used, usage_reset_at")
      .eq("user_id", user.id)
      .single();
    if (data) {
      // Check if we need to reset (different month)
      const resetDate = new Date(data.usage_reset_at);
      const now = new Date();
      if (resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear()) {
        // Reset counters
        await supabase
          .from("profiles")
          .update({ image_analyses_used: 0, video_analyses_used: 0, usage_reset_at: now.toISOString() })
          .eq("user_id", user.id);
        setUsage({ image_analyses_used: 0, video_analyses_used: 0, usage_reset_at: now.toISOString() });
      } else {
        setUsage(data as UsageData);
      }
    }
  };

  useEffect(() => { fetchUsage(); }, [user]);

  const isImage = file?.type.startsWith("image");
  const isVideo = file?.type.startsWith("video");

  const imagesUsed = usage?.image_analyses_used ?? 0;
  const videosUsed = usage?.video_analyses_used ?? 0;

  const canAnalyze = (() => {
    if (!usage) return true; // loading
    if (tier.lifetime) {
      // Free tier: lifetime limit
      return imagesUsed < tier.images;
    }
    if (isVideo) {
      return videosUsed < tier.videos;
    }
    return tier.images === Infinity || imagesUsed < tier.images;
  })();

  const uploadFile = async () => {
    if (!file || !user) return null;
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("media-uploads")
      .upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
      .from("media-uploads")
      .getPublicUrl(filePath);
    return { publicUrl, mediaType: file.type.startsWith("image") ? "image" : "video" };
  };

  const incrementUsage = async (mediaType: string) => {
    if (!user) return;
    const field = mediaType === "image" ? "image_analyses_used" : "video_analyses_used";
    const current = mediaType === "image" ? imagesUsed : videosUsed;
    await supabase
      .from("profiles")
      .update({ [field]: current + 1 })
      .eq("user_id", user.id);
    setUsage((prev) => prev ? { ...prev, [field]: current + 1 } : prev);
  };

  const analyzeSingle = async () => {
    if (!file || !user) return;
    setLoading(true);
    setResult(null);
    try {
      const upload = await uploadFile();
      if (!upload) return;

      const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-media", {
        body: { mediaUrl: upload.publicUrl, mediaType: upload.mediaType },
      });
      if (fnError) throw fnError;
      const analysis = fnData as AnalysisData;

      await supabase.from("analyses").insert([{
        user_id: user.id,
        media_url: upload.publicUrl,
        media_type: upload.mediaType,
        file_name: file.name,
        recovered_prompt: analysis.recovered_prompt,
        model_guess: analysis.model_guess,
        settings: analysis.settings as any,
        style_tags: analysis.style_tags,
        copy_ready_prompts: analysis.copy_ready_prompts as any,
        full_breakdown: analysis as any,
      }]);

      await incrementUsage(upload.mediaType);
      setResult(analysis);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompare = async () => {
    if (!file || !user) return;
    setLoading(true);
    setResult(null);

    const initial: ModelResult[] = COMPARE_MODELS.map((m) => ({
      ...m,
      data: null,
      error: null,
      loading: true,
      durationMs: null,
    }));
    setCompareResults(initial);

    try {
      const upload = await uploadFile();
      if (!upload) return;

      const promises = COMPARE_MODELS.map(async (m, idx) => {
        const start = performance.now();
        try {
          const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-media", {
            body: { mediaUrl: upload.publicUrl, mediaType: upload.mediaType, model: m.model },
          });
          const durationMs = performance.now() - start;
          if (fnError) throw fnError;
          setCompareResults((prev) =>
            prev.map((r, i) => i === idx ? { ...r, data: fnData as AnalysisData, loading: false, durationMs } : r)
          );
        } catch (err: any) {
          const durationMs = performance.now() - start;
          setCompareResults((prev) =>
            prev.map((r, i) => i === idx ? { ...r, error: err.message || "Failed", loading: false, durationMs } : r)
          );
        }
      });

      await Promise.allSettled(promises);
      await incrementUsage(upload.mediaType);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasCompareResults = compareResults.some((r) => r.data || r.error);

  // Quota display
  const quotaText = (() => {
    if (tier.lifetime) {
      return `${imagesUsed} of ${tier.images} analysis used`;
    }
    const parts: string[] = [];
    if (tier.images !== Infinity) parts.push(`${imagesUsed} of ${tier.images} images`);
    else parts.push("Unlimited images");
    parts.push(`${videosUsed} of ${tier.videos} videos`);
    return parts.join(" · ") + " this month";
  })();

  return (
    <div className="min-h-screen px-6 pt-24 pb-16 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={compareMode && hasCompareResults ? "max-w-7xl" : "max-w-2xl"}
      >
        <h1 className="text-3xl font-bold tracking-tight">Analyze</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload an AI-generated image or video to recover its prompt.
        </p>

        {/* Quota */}
        {usage && (
          <p className="mt-3 text-xs text-muted-foreground">
            {quotaText}
          </p>
        )}

        {/* Compare toggle — Pro only */}
        {tier.compare && (
          <div className="mt-6 flex items-center gap-3">
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={(v) => {
                setCompareMode(v);
                setResult(null);
                setCompareResults([]);
              }}
              disabled={loading}
            />
            <Label htmlFor="compare-mode" className="text-sm font-medium">
              Compare models
            </Label>
          </div>
        )}

        {/* Non-pro hint */}
        {!tier.compare && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Model comparison available on Pro plan</span>
          </div>
        )}

        {/* Video gate for free tier */}
        {tierKey === "free" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Video analysis is available on paid plans.
          </p>
        )}

        <div className="mt-8 space-y-6">
          <div className="max-w-2xl">
            <MediaUploader
              onFileSelect={setFile}
              disabled={loading}
              acceptVideo={tierKey !== "free"}
            />
          </div>

          {file && !canAnalyze && (
            <div className="flex max-w-2xl flex-col items-center gap-3 rounded-lg border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-sm font-medium">You've reached your analysis limit</p>
              <button
                onClick={() => navigate("/pricing")}
                className="flex h-10 items-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Upgrade Plan
              </button>
            </div>
          )}

          {file && canAnalyze && !result && !hasCompareResults && (
            <button
              onClick={compareMode ? analyzeCompare : analyzeSingle}
              disabled={loading}
              className="flex h-11 w-full max-w-2xl items-center justify-center gap-2 rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {compareMode ? "Comparing…" : "Analyzing…"}
                </>
              ) : (
                compareMode ? "Compare 3 Models" : "Analyze"
              )}
            </button>
          )}

          {loading && !compareMode && (
            <div className="h-0.5 w-full max-w-2xl overflow-hidden rounded-full bg-secondary">
              <div className="h-full animate-pulse bg-muted-foreground/30" style={{ width: "60%" }} />
            </div>
          )}

          {result && !compareMode && <AnalysisResult data={result} />}
          {compareMode && hasCompareResults && <ModelComparison results={compareResults} />}
        </div>
      </motion.div>
    </div>
  );
}
