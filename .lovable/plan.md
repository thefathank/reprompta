

## Fix video analysis to send actual video content

### Problem
The edge function only sends `image_url` for images. For videos, it only sends the URL as text — the model never actually sees the video frames.

### Solution
Add a `video_url` content block (OpenRouter-compatible format) for video media, so Gemini actually processes the video frames.

### Changes

**`supabase/functions/analyze-media/index.ts`** (lines 51-56):
- Add an `else if (mediaType === "video")` branch that pushes a `video_url` content block:
  ```ts
  } else if (mediaType === "video") {
    userContent.push({
      type: "video_url",
      video_url: { url: mediaUrl },
    });
  }
  ```
- This uses the same public URL from storage, so no base64 encoding needed.

That's the only change required — the rest of the function (system prompt, tools, response parsing) already handles both media types correctly.

