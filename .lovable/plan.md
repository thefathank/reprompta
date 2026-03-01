

## Plan: Include tags in copied prompt text

When copying a prompt (from either the card or the detail dialog), append the tags (aspect ratios, style flags, camera specs, etc.) to the prompt text so the copied output is ready to paste into an AI tool.

### Changes

**`src/components/PromptGallery.tsx`**
- Update `handleCopy` to accept the full prompt object instead of just `text`
- Build the copied string as: `prompt.text + " " + prompt.tags.join(" ")`
- Update both call sites (card copy button and dialog copy button) to pass the prompt object

Example copied output:
> `A cyberpunk cityscape at dusk, neon reflections... --ar 16:9 --style raw`

