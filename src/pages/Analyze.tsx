import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/MediaUploader";
import { AnalysisResult } from "@/components/AnalysisResult";
import { ModelComparison, type ModelResult } from "@/components/ModelComparison";
import { SignupGateway } from "@/components/SignupGateway";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getTierByProductId, getTierKey } from "@/lib/subscription";
import { useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// --- Types ---

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

// --- Constants ---

const LOCAL_KEY = "reprompta_free_analyses";

const COMPARE_MODELS = [
  { model: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { model: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { model: "google/gemini-3-flash-preview", label: "Gemini 3 Flash" },
];

// --- Helpers ---

function getAnonUsage(): number {
  try {
    return parseInt(localStorage.getItem(LOCAL_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementAnonUsage() {
  try {
    localStorage.setItem(LOCAL_KEY, String(getAnonUsage() + 1));
  } catch {}
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- Sub-components ---

function UsageBar({ label, used, total, suffix }: { label: string; used: number; total: number; suffix: string }) {
  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const isNearLimit = pct >= 80;
  const isAtLimit = pct >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-foreground"}`}>
          {remaining} of {total} remaining
          <span className="ml-1 font-normal text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtLimit ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : "bg-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// --- Main ---

export default function Analyze() {
  const { user, subscription, checkSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState<ModelResult[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);

  const isAnon = !user;
  const tier = getTierByProductId(subscription.productId);
  const tierKey = getTierKey(subscription.productId);

  // Refresh subscription on checkout success
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      checkSubscription();
    }
  }, [searchParams, checkSubscription]);

  // Fetch usage for logged-in users
  const fetchUsage = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("image_analyses_used, video_analyses_used, usage_reset_at")
      .eq("user_id", user.id)
      .single();
    if (data) {
      const resetDate = new Date(data.usage_reset_at);
      const now = new Date();
      if (resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear()) {
        await supabase
          .from("profiles")
          .update({ image_analyses_used: 0, video_analyses_used: 0, usage_reset_at: now.toISOString() })
          .eq("user_id", user.id);
        setUsage({ image_analyses_used: 0, video_analyses_used: 0, usage_reset_at: now.toISOString() });
      } else {
        setUsage(data as UsageData);
      }
    }
  }, [user]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const isImage = file?.type.startsWith("image");
  const isVideo = file?.type.startsWith("video");

  const imagesUsed = usage?.image_analyses_used ?? 0;
  const videosUsed = usage?.video_analyses_used ?? 0;

  // Check if analysis is allowed
  const canAnalyze = (() => {
    if (isAnon) return getAnonUsage() < 1;
    if (!usage) return true;
    if (tier.lifetime) return imagesUsed < tier.images;
    if (isVideo) return videosUsed < tier.videos;
    return tier.images === Infinity || imagesUsed < tier.images;
  })();

  // --- Upload helpers ---

  const uploadFileForUser = async (): Promise<{ publicUrl: string; mediaType: string } | null> => {
    if (!file || !user) return null;
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("media-uploads").upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from("media-uploads").getPublicUrl(filePath);
    return { publicUrl, mediaType: file.type.startsWith("image") ? "image" : "video" };
  };

  const getMediaForAnon = async (): Promise<{ mediaUrl: string; mediaType: string }> => {
    if (!file) throw new Error("No file");
    const dataUrl = await fileToDataUrl(file);
    return { mediaUrl: dataUrl, mediaType: file.type.startsWith("image") ? "image" : "video" };
  };

  const incrementUsage = async (mediaType: string) => {
    if (!user) return;
    const field = mediaType === "image" ? "image_analyses_used" : "video_analyses_used";
    const current = mediaType === "image" ? imagesUsed : videosUsed;
    await supabase.from("profiles").update({ [field]: current + 1 }).eq("user_id", user.id);
    setUsage((prev) => prev ? { ...prev, [field]: current + 1 } : prev);
  };

  // --- Analysis ---

  const analyzeSingle = async () => {
    if (!file) return;

    // Gate check for anonymous users
    if (isAnon && getAnonUsage() >= 1) {
      setShowGateway(true);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      let mediaUrl: string;
      let mediaType: string;

      if (isAnon) {
        const media = await getMediaForAnon();
        mediaUrl = media.mediaUrl;
        mediaType = media.mediaType;
      } else {
        const upload = await uploadFileForUser();
        if (!upload) return;
        mediaUrl = upload.publicUrl;
        mediaType = upload.mediaType;
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-media", {
        body: { mediaUrl, mediaType },
      });
      if (fnError) throw fnError;
      const analysis = fnData as AnalysisData;

      // Save for logged-in users only
      if (user) {
        await supabase.from("analyses").insert([{
          user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          file_name: file.name,
          recovered_prompt: analysis.recovered_prompt,
          model_guess: analysis.model_guess,
          settings: analysis.settings as any,
          style_tags: analysis.style_tags,
          copy_ready_prompts: analysis.copy_ready_prompts as any,
          full_breakdown: analysis as any,
        }]);
        await incrementUsage(mediaType);
      } else {
        incrementAnonUsage();
      }

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
      ...m, data: null, error: null, loading: true, durationMs: null,
    }));
    setCompareResults(initial);

    try {
      const upload = await uploadFileForUser();
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

  // --- Handle analyze click ---
  const handleAnalyze = () => {
    if (isAnon && getAnonUsage() >= 1) {
      setShowGateway(true);
      return;
    }
    if (compareMode) analyzeCompare();
    else analyzeSingle();
  };

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

        {/* Usage bars — only for logged-in users */}
        {!isAnon && usage && (
          <div className="mt-4 max-w-sm space-y-3">
            {tier.images !== Infinity ? (
              <UsageBar label="Images" used={imagesUsed} total={tier.images} suffix={tier.lifetime ? "total" : "this month"} />
            ) : (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Images</span>
                <span className="font-medium text-foreground">Unlimited</span>
              </div>
            )}
            {tier.videos > 0 && (
              <UsageBar label="Videos" used={videosUsed} total={tier.videos} suffix="this month" />
            )}
          </div>
        )}

        {/* Anonymous usage hint */}
        {isAnon && (
          <p className="mt-4 text-xs text-muted-foreground">
            {getAnonUsage() < 1
              ? "Try one free analysis — no account required."
              : "Sign up to keep analyzing."}
          </p>
        )}

        {/* Compare toggle — only for logged-in users */}
        {!isAnon && (
          <div className="mt-6 flex items-center gap-3">
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={(v) => {
                if (!tier.compare) {
                  setShowUpgradeDialog(true);
                  return;
                }
                setCompareMode(v);
                setResult(null);
                setCompareResults([]);
              }}
              disabled={loading}
            />
            <Label htmlFor="compare-mode" className="text-sm font-medium flex items-center gap-1.5">
              Compare models
              {!tier.compare && <Lock className="h-3 w-3 text-muted-foreground" />}
            </Label>
          </div>
        )}

        {/* Upgrade dialog for compare */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Upgrade to Pro
              </DialogTitle>
              <DialogDescription>
                Model comparison lets you run your analysis across 3 AI models side-by-side. Upgrade to Pro to unlock this feature.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowUpgradeDialog(false)}
                className="flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Maybe later
              </button>
              <a
                href="/pricing"
                className="flex h-10 items-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                View Plans
              </a>
            </div>
          </DialogContent>
        </Dialog>

        {/* Signup gateway for anonymous users */}
        <SignupGateway open={showGateway} onOpenChange={setShowGateway} />

        {/* Video gate for free tier */}
        {!isAnon && tierKey === "free" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Video analysis is available on paid plans.
          </p>
        )}

        <div className="mt-8 space-y-6">
          <div className="max-w-2xl">
            <MediaUploader
              onFileSelect={setFile}
              disabled={loading}
              acceptVideo={!isAnon && tierKey !== "free"}
            />
          </div>

          {file && !canAnalyze && !isAnon && (
            <div className="flex max-w-2xl flex-col items-center gap-3 rounded-lg border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-sm font-medium">You've reached your analysis limit</p>
              <a
                href="/pricing"
                className="flex h-10 items-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Upgrade Plan
              </a>
            </div>
          )}

          {file && (canAnalyze || isAnon) && !result && !hasCompareResults && (
            <button
              onClick={handleAnalyze}
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

          {result && !compareMode && (
            <>
              <AnalysisResult data={result} />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="max-w-2xl rounded-lg border border-accent/20 bg-accent/5 p-6 text-center"
              >
                {isAnon ? (
                  <>
                    <p className="text-sm font-medium">Curious about another image?</p>
                    <p className="mt-1 text-xs text-muted-foreground">See what prompt was used to create it.</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Ready to analyze another file?</p>
                )}
                <button
                  onClick={() => { setResult(null); setFile(null); }}
                  className="mt-4 inline-flex h-10 items-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Analyze Another Image
                </button>
              </motion.div>
            </>
          )}
          {compareMode && hasCompareResults && <ModelComparison results={compareResults} />}
        </div>
      </motion.div>
    </div>
  );
}
