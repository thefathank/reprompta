import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Wand2, Cpu, Settings, Palette } from "lucide-react";
import { useState } from "react";

interface Analysis {
  recovered_prompt: string;
  model_guess: string;
  settings: Record<string, string>;
  style_tags: string[];
  copy_ready_prompts: Record<string, string>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-7 w-7 shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function AnalysisResult({ data }: { data: Analysis }) {
  return (
    <div className="space-y-4">
      {/* Recovered Prompt */}
      <Card className="border-primary/30">
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Wand2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Recovered Prompt</CardTitle>
          <div className="ml-auto"><CopyButton text={data.recovered_prompt} /></div>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm leading-relaxed">{data.recovered_prompt}</p>
        </CardContent>
      </Card>

      {/* Model Guess */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Cpu className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">Model Guess</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-sm">{data.model_guess}</Badge>
        </CardContent>
      </Card>

      {/* Settings */}
      {Object.keys(data.settings).length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(data.settings).map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-lg bg-secondary px-3 py-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Style Tags */}
      {data.style_tags.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Style Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.style_tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copy-Ready Prompts */}
      {Object.keys(data.copy_ready_prompts).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Copy-Ready Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.copy_ready_prompts).map(([tool, prompt]) => (
              <div key={tool} className="flex items-start gap-3 rounded-lg bg-secondary p-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{tool}</p>
                  <p className="font-mono text-xs leading-relaxed">{prompt}</p>
                </div>
                <CopyButton text={prompt} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
