import { motion } from "framer-motion";
import { AnalysisResult } from "./AnalysisResult";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisData {
  recovered_prompt: string;
  model_guess: string;
  settings: Record<string, string>;
  style_tags: string[];
  copy_ready_prompts: Record<string, string>;
}

export interface ModelResult {
  model: string;
  label: string;
  data: AnalysisData | null;
  error: string | null;
  loading: boolean;
  durationMs: number | null;
}

export function ModelComparison({ results }: { results: ModelResult[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {results.map((r) => (
        <motion.div
          key={r.model}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="truncate font-semibold">{r.label}</span>
                {r.durationMs !== null && (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-normal text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {(r.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
              </CardTitle>
              <p className="font-mono text-[10px] text-muted-foreground">{r.model}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {r.loading && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              )}
              {r.error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{r.error}</p>
                </div>
              )}
              {r.data && <AnalysisResult data={r.data} />}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
