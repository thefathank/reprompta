import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/MediaUploader";
import { AnalysisResult } from "@/components/AnalysisResult";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AnalysisData {
  recovered_prompt: string;
  model_guess: string;
  settings: Record<string, string>;
  style_tags: string[];
  copy_ready_prompts: Record<string, string>;
}

export default function Analyze() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);

  const analyze = async () => {
    if (!file || !user) return;
    setLoading(true);
    setResult(null);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("media-uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media-uploads")
        .getPublicUrl(filePath);

      const mediaType = file.type.startsWith("image") ? "image" : "video";

      const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-media", {
        body: { mediaUrl: publicUrl, mediaType },
      });

      if (fnError) throw fnError;

      const analysis = fnData as AnalysisData;

      await supabase.from("analyses").insert([{
        user_id: user.id,
        media_url: publicUrl,
        media_type: mediaType,
        file_name: file.name,
        recovered_prompt: analysis.recovered_prompt,
        model_guess: analysis.model_guess,
        settings: analysis.settings as any,
        style_tags: analysis.style_tags,
        copy_ready_prompts: analysis.copy_ready_prompts as any,
        full_breakdown: analysis as any,
      }]);

      setResult(analysis);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 pt-24 pb-16 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl font-bold tracking-tight">Analyze</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload an AI-generated image or video to recover its prompt.
        </p>

        <div className="mt-10 space-y-6">
          <MediaUploader onFileSelect={setFile} disabled={loading} />

          {file && !result && (
            <button
              onClick={analyze}
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>
          )}

          {loading && (
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full animate-pulse bg-muted-foreground/30" style={{ width: "60%" }} />
            </div>
          )}

          {result && <AnalysisResult data={result} />}
        </div>
      </motion.div>
    </div>
  );
}
