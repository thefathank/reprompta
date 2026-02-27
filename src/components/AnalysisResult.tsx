import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Analysis {
  recovered_prompt: string;
  model_guess: string;
  confidence_score?: number;
  settings: Record<string, string>;
  style_tags: string[];
  copy_ready_prompts: Record<string, string>;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export function AnalysisResult({ data }: { data: Analysis }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Recovered Prompt */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Recovered Prompt
          </p>
          <CopyBtn text={data.recovered_prompt} />
        </div>
        <div className="rim-light rounded-md p-5">
          <p className="font-mono text-sm leading-relaxed text-foreground">
            {data.recovered_prompt}
          </p>
        </div>
      </div>

      {/* Confidence + Model + Settings row */}
      <div className="flex flex-wrap gap-2">
        {data.confidence_score != null && (
          <span
            className={cn(
              "rounded px-3 py-1.5 text-xs font-semibold",
              data.confidence_score >= 80
                ? "bg-accent/20 text-accent"
                : data.confidence_score >= 50
                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {data.confidence_score}% confidence
          </span>
        )}
        <span className="rounded bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
          {data.model_guess}
        </span>
        {Object.entries(data.settings).map(([k, v]) => (
          <span key={k} className="rounded bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
            {k}: {v}
          </span>
        ))}
      </div>

      {/* Style Tags */}
      {data.style_tags.length > 0 && (
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Style Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {data.style_tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Copy-Ready Prompts */}
      {Object.keys(data.copy_ready_prompts).length > 0 && (
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Copy-Ready Prompts
          </p>
          <div className="space-y-3">
            {Object.entries(data.copy_ready_prompts).map(([tool, prompt]) => (
              <div key={tool} className="rim-light flex items-start gap-3 rounded-md p-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {tool}
                  </p>
                  <p className="font-mono text-xs leading-relaxed text-foreground">{prompt}</p>
                </div>
                <CopyBtn text={prompt} />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
