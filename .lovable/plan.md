

## Plan: Make the card stack visually read as a pile of cards

### Problem
Currently only the active card is fully visible and behind-cards fade out too aggressively (0.5 → 0.25 → 0), making it look like a single card cycling rather than a stack. The offset spacing (18px y, 6px x) is too subtle to convey depth.

### Changes — `src/pages/Index.tsx`

1. **Increase visible card count from 3 to 4** — show `offset <= 3` instead of `offset <= 2`
2. **Increase stacking offsets** — more vertical and horizontal spread so behind-cards are clearly peeking out:
   - `y: offset * 24` (was `18`)
   - `x: offset * 10` (was `6`)
3. **Increase rotation spread** — behind cards fan out more noticeably: `offset === 1 → 2°`, `offset === 2 → 3.5°`, `offset === 3 → 4.5°`
4. **Raise behind-card opacity** — so text/structure is partially visible on stacked cards:
   - offset 0: `1`
   - offset 1: `0.6` (was `0.5`)
   - offset 2: `0.35` (was `0.25`)
   - offset 3: `0.18` (new)
5. **Reduce scale step** — `1 - offset * 0.03` (was `0.04`) so behind cards stay larger and more readable as cards

### Files modified
- `src/pages/Index.tsx`

