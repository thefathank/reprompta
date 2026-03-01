

## Plan: Reduce Prompt Library footprint with pagination

Currently all ~30 prompts render at once in a 3-column grid, making the section very tall. The fix: **paginate the grid to show 6 prompts per page** (2 rows of 3), with simple Previous/Next controls below.

### Changes

**`src/components/PromptGallery.tsx`**
- Add `page` state (starts at 0), reset to 0 whenever filters or search change
- Slice `filtered` to show only 6 items per page: `filtered.slice(page * 6, page * 6 + 6)`
- Render a small pagination bar below the grid with Previous/Next buttons and a "Page X of Y" label (using the existing `Pagination` UI components or simple buttons)
- Reduce vertical padding on the section (`py-28` → `py-16`) for a tighter feel

No new files or dependencies needed.

