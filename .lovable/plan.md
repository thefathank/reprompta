

# AI Prompt Reverse Engineer

A tool that analyzes AI-generated images and videos to recover the original prompt, settings, and style information — with user accounts and saved history.

## Pages & Navigation

1. **Landing Page** — Hero section explaining the tool, CTA to upload or sign up
2. **Auth Pages** — Sign up / Login with email & password
3. **Analyzer Page** (main tool) — Upload media, get full prompt breakdown
4. **History Page** — Browse and search past analyses

## Core Feature: Media Analysis

- **Upload area** with drag-and-drop support for images (JPG, PNG, WEBP) and videos (MP4, WEBM)
- After upload, an AI model (via Lovable AI) analyzes the media and returns:
  - **Recovered prompt** — the estimated text prompt
  - **Model guess** — e.g. Midjourney, DALL·E, Stable Diffusion, Sora, Runway
  - **Settings** — aspect ratio, style preset, CFG scale, steps, etc.
  - **Style tags** — art style, lighting, composition keywords
  - **Copy-ready prompts** — formatted for different AI tools (Midjourney, DALL·E, ComfyUI, etc.)
- One-click copy buttons for each output section
- Loading state with progress indicator during analysis

## User Accounts & History

- Email/password auth with Supabase
- User profiles table
- **Analyses table** storing: uploaded media URL, recovered prompt, full breakdown JSON, timestamp
- History page with thumbnail previews, searchable by prompt keywords
- Ability to delete past analyses

## Design

- Dark theme by default (fits creative/AI tooling aesthetic)
- Clean, modern UI with card-based result layout
- Responsive for desktop and mobile

## Backend

- Lovable Cloud + Supabase for auth, database, and file storage
- Edge function calling Lovable AI (Gemini vision model) to analyze uploaded media
- Storage bucket for uploaded images/videos

