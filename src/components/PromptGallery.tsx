import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Copy, Check, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { prompts, modelInfo } from "@/data/prompts";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const allModels = [...new Set(prompts.map((p) => p.model))];
const allTags = [...new Set(prompts.flatMap((p) => p.tags))];
const allTechniques = [...new Set(prompts.flatMap((p) => p.techniques ?? []))];

export default function PromptGallery() {
  const [search, setSearch] = useState("");
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeTechnique, setActiveTechnique] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 6;

  const handleCopy = useCallback((prompt: { text: string; tags: string[] }, idx: number) => {
    const copyText = [prompt.text, ...prompt.tags].join(" ");
    navigator.clipboard.writeText(copyText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, []);
  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      if (activeModel && p.model !== activeModel) return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (activeTechnique && !(p.techniques ?? []).includes(activeTechnique)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.text.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.techniques ?? []).some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, activeModel, activeTag, activeTechnique]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Reset page when filters change
  const prevFiltersRef = `${search}|${activeModel}|${activeTag}|${activeTechnique}`;
  const [prevFilters, setPrevFilters] = useState(prevFiltersRef);
  if (prevFiltersRef !== prevFilters) {
    setPrevFilters(prevFiltersRef);
    setPage(0);
  }

  const clearFilters = () => {
    setSearch("");
    setActiveModel(null);
    setActiveTag(null);
    setActiveTechnique(null);
  };

  const hasFilters = search || activeModel || activeTag || activeTechnique;

  return (
    <section className="border-t border-border px-6 py-16 lg:px-16">
      <div className="w-full">
        <p className="mb-4 font-mono text-xs text-muted-foreground">04</p>
        <h2 className="mb-3 text-lg font-semibold">Prompt library</h2>
        <p className="mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
          Browse example prompts across models. Filter by model, tag, or search by keyword.
        </p>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts…"
            className="w-full rounded-lg border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
        </div>

        {/* Model filters */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs font-medium text-muted-foreground">Model:</span>
          {allModels.map((model) => (
            <button
              key={model}
              onClick={() => setActiveModel(activeModel === model ? null : model)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeModel === model
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {model}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs font-medium text-muted-foreground">Tag:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTag === tag
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Technique filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <span className="mr-1 inline-flex items-center gap-1 self-center text-xs font-medium text-muted-foreground">
            <Lightbulb className="h-3 w-3" /> Technique:
          </span>
          {allTechniques.map((tech) => (
            <button
              key={tech}
              onClick={() => setActiveTechnique(activeTechnique === tech ? null : tech)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTechnique === tech
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Active filter indicator */}
        {hasFilters && (
          <div className="mb-6 flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-secondary/80"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          </div>
        )}

        {/* Prompt grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {paged.map((prompt, i) => {
              const globalIdx = page * PAGE_SIZE + i;
              return (
              <motion.div
                key={prompt.model + globalIdx}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="surface-glass rounded-xl border border-border/40 p-5 group relative cursor-pointer"
                onClick={() => setSelectedPrompt(globalIdx)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(prompt, globalIdx); }}
                  className="absolute right-3 top-3 rounded-md bg-secondary/80 p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100"
                  aria-label="Copy prompt"
                >
                  {copiedIdx === globalIdx ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <p className="text-sm leading-relaxed text-foreground line-clamp-4 pr-8">
                  {prompt.text}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                    {prompt.model}
                  </span>
                  {prompt.tags.map((tag) => (
                    <span key={tag} className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                  {(prompt.techniques ?? []).map((tech) => (
                    <span key={tech} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <Lightbulb className="h-2.5 w-2.5" />{tech}
                    </span>
                  ))}
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No prompts match your filters.
          </p>
        )}
      </div>

      {/* Full prompt dialog */}
      <Dialog open={selectedPrompt !== null} onOpenChange={(open) => !open && setSelectedPrompt(null)}>
        <DialogContent className="max-w-lg">
          {selectedPrompt !== null && (() => {
            const prompt = filtered[selectedPrompt];
            if (!prompt) return null;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold">Prompt details</DialogTitle>
                  <DialogDescription className="sr-only">Full prompt text and metadata</DialogDescription>
                </DialogHeader>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {prompt.text}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <span className="cursor-help rounded bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                        {prompt.model}
                      </span>
                    </HoverCardTrigger>
                    {modelInfo[prompt.model] && (
                      <HoverCardContent side="top" className="w-64 text-sm">
                        <p className="font-semibold text-foreground">{prompt.model}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {modelInfo[prompt.model].description}
                        </p>
                        {modelInfo[prompt.model].url && (
                          <a
                            href={modelInfo[prompt.model].url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
                          >
                            Learn more →
                          </a>
                        )}
                      </HoverCardContent>
                    )}
                  </HoverCard>
                  {prompt.tags.map((tag) => (
                    <span key={tag} className="rounded bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                  {(prompt.techniques ?? []).map((tech) => (
                    <span key={tech} className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <Lightbulb className="h-2.5 w-2.5" />{tech}
                    </span>
                  ))}
                  <button
                    onClick={() => handleCopy(prompt, selectedPrompt)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {copiedIdx === selectedPrompt ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedIdx === selectedPrompt ? "Copied" : "Copy"}
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
