

## A/B Model Comparison for Media Analysis

### Approach
Add a "Compare Models" mode that runs the same image through multiple models in parallel and displays results side-by-side, so you can visually judge which model produces the best prompt recovery.

### Changes

**1. Edge function: `supabase/functions/analyze-media/index.ts`**
- Accept an optional `model` parameter in the request body (defaults to `google/gemini-2.5-flash`)
- Pass that model string to the gateway call instead of hardcoding it
- No other logic changes needed

**2. New component: `src/components/ModelComparison.tsx`**
- Displays a side-by-side (or stacked) view of analysis results from multiple models
- Each card shows the model name, recovered prompt, style tags, and copy-ready prompts
- Includes a label showing latency (time taken) for each model call

**3. Update `src/pages/Analyze.tsx`**
- Add a toggle/switch: "Single analysis" vs "Compare models"
- In compare mode, fire 3 parallel calls to `analyze-media` with different model values:
  - `google/gemini-2.5-flash` (current default)
  - `google/gemini-2.5-pro` (higher quality, slower)
  - `google/gemini-3-flash-preview` (newest default)
- Show all results side-by-side using the new `ModelComparison` component
- Track and display response time for each model
- Single mode stays unchanged (uses whichever model you settle on after testing)

### Models to compare
- **Gemini 2.5 Flash** -- current, cheapest, fastest
- **Gemini 2.5 Pro** -- best reasoning, most expensive (~10x cost)
- **Gemini 3 Flash Preview** -- newest, recommended default, similar cost to 2.5 Flash

### UX
- Compare mode uploads the file once, then fires 3 parallel edge function calls
- Results render as 3 columns (desktop) or stacked cards (mobile)
- Each card header shows: model name + response time in seconds
- After comparing, you can permanently switch the default model in the edge function

### Technical details
- The edge function change is minimal: read `model` from body, fall back to a default
- No database schema changes needed -- the `analyses` table already stores `full_breakdown` as JSON
- In compare mode, results are not saved to the database (comparison is ephemeral)
- Rate limit note: 3 parallel calls count against your per-minute limit; if one hits 429, that card shows an error while others succeed

