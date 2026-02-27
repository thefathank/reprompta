import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Trash2, Image, Film, Copy, Check } from "lucide-react";
import { AnalysisResult } from "@/components/AnalysisResult";

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

export default function HistoryPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
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
      setAnalyses((data as any[]) || []);
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

  const filtered = analyses.filter((a) =>
    !search || (a.recovered_prompt?.toLowerCase().includes(search.toLowerCase()) ||
    a.file_name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="mb-2 text-3xl font-bold">History</h1>
      <p className="mb-6 text-muted-foreground">Your past analyses</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by prompt or filename..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          {search ? "No results found." : "No analyses yet. Go analyze some media!"}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id}>
              <Card
                className="cursor-pointer transition-colors hover:border-primary/30"
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {a.media_type === "image" ? (
                      <img src={a.media_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Film className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.recovered_prompt || "No prompt"}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.file_name} · {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {a.model_guess && <Badge variant="outline" className="shrink-0">{a.model_guess}</Badge>}
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); deleteAnalysis(a.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
              {expanded === a.id && (
                <div className="mt-2 ml-4">
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
  );
}
