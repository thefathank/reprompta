

## Plan: Expand prompt on click in Prompt Gallery

When a user clicks a prompt card, open a Dialog showing the full prompt text (currently truncated via `line-clamp-4`), along with the model badge, tags, and the copy button.

### Changes

**`src/components/PromptGallery.tsx`**
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` from `@/components/ui/dialog`
- Add `selectedPrompt` state (`number | null`)
- Make each prompt card clickable (set `selectedPrompt` on click, exclude the copy button via `stopPropagation`)
- Render a Dialog that shows:
  - Full prompt text (no `line-clamp`)
  - Model badge with existing HoverCard
  - Tags
  - Copy button
- Add `cursor-pointer` to prompt cards

No new files or dependencies needed — uses the existing Dialog and HoverCard components.

