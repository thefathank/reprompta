import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/MediaUploader";
import { AnalysisResult } from "@/components/AnalysisResult";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

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
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisData | null>(null);

  const analyze = async () => {
    if (!file || !user) return;
    setLoading(true);
    setProgress(10);
    setResult(null);

    try {
      // Upload to storage
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;
      setProgress(20);

      const { error: uploadError } = await supabase.storage
        .from("media-uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setProgress(40);

      const { data: { publicUrl } } = supabase.storage
        .from("media-uploads")
        .getPublicUrl(filePath);

      // Call edge function
      setProgress(60);
      const mediaType = file.type.startsWith("image") ? "image" : "video";

      const { data: fnData, error: fnError } = await supabase.functions.invoke("analyze-media", {
        body: { mediaUrl: publicUrl, mediaType },
      });

      if (fnError) throw fnError;
      setProgress(90);

      const analysis = fnData as AnalysisData;

      // Save to database
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
      setProgress(100);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Analyze Media</h1>
        <p className="mt-2 text-muted-foreground">Upload an AI-generated image or video to reverse engineer its prompt</p>
      </div>

      <div className="space-y-6">
        <MediaUploader onFileSelect={setFile} disabled={loading} />

        {file && !result && (
          <Button onClick={analyze} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        )}

        {loading && <Progress value={progress} className="h-2" />}

        {result && <AnalysisResult data={result} />}
      </div>
    </div>
  );
}
