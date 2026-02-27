

## Plan: Scale up recovered_prompt cards on both pages

### Current state
- **Index.tsx**: Card container is `w-[500px]`, card height area `260px`, prompt text truncated to 3 lines, prompts use short ellipsized text
- **Auth.tsx**: Card container is `w-[460px]`, single cycling card, prompt text truncated to 3 lines

### Changes

#### 1. Expand prompt text content
Replace the short, ellipsized prompt strings with full-length sample prompts (3-5 sentences each) so the cards have real readable content.

#### 2. Index.tsx — scale up the card stack
- Increase card container width from `w-[500px]` to `w-[720px]`
- Increase card stack height from `260px` to `420px`
- Remove `line-clamp-3` so full prompt text is visible
- Increase inner padding from `p-7` to `p-9`, and inner content padding from `px-4 py-3` to `px-6 py-5`
- Bump text size from `text-sm` to `text-base`
- Increase tag/badge size slightly
- Adjust card stack offsets (`y`, `x`, `scale`) proportionally for the larger size

#### 3. Auth.tsx — scale up the cycling card
- Increase container width from `w-[460px]` to `w-[700px]`
- Remove `line-clamp-3` to show full prompt text
- Match the same padding and text size increases as Index
- Adjust positioning (`translate-x`, `translate-y`) so it remains balanced behind the form

#### Files modified
- `src/pages/Index.tsx`
- `src/pages/Auth.tsx`

