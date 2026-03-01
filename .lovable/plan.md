

## Plan: Add conditional mobile image compression

Add a `compressImage` utility that runs only on mobile and only for images over 7MB. It draws the image onto a canvas and exports as JPEG at 85% quality. Falls back to the original file if anything goes wrong.

### Changes

**`src/lib/compress.ts`** (new file)
- Export `compressImageIfNeeded(file: File): Promise<File>`
- Detect mobile via `window.innerWidth < 768` (matches existing `MOBILE_BREAKPOINT`)
- Skip if not mobile, not an image, or file ≤ 7MB — return original
- Load image into an `<img>`, draw onto a `<canvas>` at original dimensions, export via `canvas.toBlob("image/jpeg", 0.85)`
- Wrap in try/catch — on any failure, return the original file
- If compressed blob is larger than original (edge case), return original

**`src/components/MediaUploader.tsx`**
- Import `compressImageIfNeeded` from `@/lib/compress`
- In `handleFile`, after all validation passes and before calling `onFileSelect(file)`:
  - If type is `"image"`, set `checking` state with label "Optimizing…", call `const final = await compressImageIfNeeded(file)`, then use `final` for preview and `onFileSelect`
- Update the checking state text to show "Optimizing image…" when compressing (reuse existing `Loader2` spinner)

No new dependencies needed — uses native Canvas API.

