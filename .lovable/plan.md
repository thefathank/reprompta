

## Remove prompt card animation from Auth page

### Change
In `src/pages/Auth.tsx`, remove the cycling prompt card section (the `AnimatePresence` block with the prompt cards) and its associated state (`promptIdx`, the `useEffect` timer, and the `prompts` import). Keep the mouse-following glow and ambient orbs for visual continuity.

### Files modified
- `src/pages/Auth.tsx` — remove `promptIdx` state, `useEffect` timer, `prompts` import, and the entire "Cycling prompt card" `div` block (~lines 80–107)

