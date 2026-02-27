

## Fix: Prompt text bleeding during card transitions

### Root cause
All prompt cards are rendered simultaneously and repositioned via spring animations. During the transition, the outgoing card's text is still visible while it animates to its new position, causing a brief overlap where both texts are readable.

The spring transition (`stiffness: 200, damping: 22`) is relatively bouncy/slow, so the z-index and opacity changes don't resolve instantly — the old "active" card fades out while the new one fades in, creating a visible text bleed.

### Fix
Add `overflow-hidden` to each card's inner content area and use `layout` or `AnimatePresence` — but the simplest effective fix is:

1. **Use `key={promptIdx + '-' + i}` or re-key based on offset** — not ideal since all cards persist.
2. **Better approach**: Make the z-index transition instant (not spring-animated) and ensure opacity snaps faster for the departing card.

Specifically in `src/pages/Index.tsx`:
- Split the `animate` into two separate transition configs using `motion.div`'s `transition` prop with per-property control
- Make `opacity` use a tween with very short duration (~0.15s) instead of the spring, so the old active card fades out quickly before the new one fully appears
- Keep `y`, `x`, `scale`, `rotate` on the spring for smooth physical movement

```tsx
transition={{
  y: { type: "spring", stiffness: 200, damping: 22 },
  x: { type: "spring", stiffness: 200, damping: 22 },
  scale: { type: "spring", stiffness: 200, damping: 22 },
  rotate: { type: "spring", stiffness: 200, damping: 22 },
  opacity: { duration: 0.15, ease: "easeOut" },
  zIndex: { duration: 0 },
}}
```

### Files modified
- `src/pages/Index.tsx` — update the card `motion.div` transition prop

