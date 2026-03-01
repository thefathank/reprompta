

## Plan: Add Model Info Tooltips to Prompt Cards

### What
Add a hover tooltip/popover to each model badge in the prompt gallery cards. It will show a short description of what the model excels at and a link to the model's official site.

### Changes

**1. Expand prompt data (`src/data/prompts.ts`)**
- Add a `modelInfo` map (or extend the prompt objects) with `description` and `url` fields for each model:
  - Midjourney v6 — scene composition and stylistic control → midjourney.com
  - DALL·E 3 — photorealism with text understanding → openai.com/dall-e-3
  - Stable Diffusion XL — open-source with fine-grained parameter control → stability.ai
  - Runway Gen-3 — cinematic video generation → runwayml.com
  - Veo 3 — video with audio and slow-motion → deepmind.google/veo
  - Nano Banana — stylized and whimsical image generation → (no official site, will note "Community model")
  - Sora — long-take cinematic video → openai.com/sora
  - Flux 1.1 Pro — high-fidelity photography and macro detail → blackforestlabs.ai
  - Ideogram 2.0 — typography-heavy design and posters → ideogram.ai
  - Firefly 3 — photorealistic composites → adobe.com/firefly

**2. Update `PromptGallery.tsx`**
- Import `HoverCard`, `HoverCardTrigger`, `HoverCardContent` from the existing UI components (already installed).
- Wrap the model badge `<span>` in a `HoverCardTrigger`. On hover, show a `HoverCardContent` with:
  - Model name (bold)
  - One-line description of strengths
  - "Learn more →" link opening in a new tab
- The hover card fits the existing dark/glass aesthetic without extra styling work.

### No backend or database changes required.

