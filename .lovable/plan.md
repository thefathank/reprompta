## Plan: Make Reprompta fully free

Remove all paid tier gating so every authenticated user gets unlimited access to all features (history, model comparison, batch, export, video analysis, large image quotas). Keep auth (signup/login) so users still have accounts and history. Strip out subscription UI, upgrade prompts, and the Pricing page from navigation. Leave Stripe edge functions in place but unused — easy to re-enable later.

### Frontend changes

**`src/lib/subscription.ts`**
- Collapse `TIERS` so `free` has unlimited everything: `images: Infinity`, `videos: Infinity`, `history: true`, `compare: true`, `batch: true`, `export: true`. Keep the type shape so existing imports keep working. Remove `basic`/`pro` entries (or keep as aliases of free).
- `getTierByProductId` and `getTierKey` always return the free/unlimited tier.

**`src/pages/Analyze.tsx`**
- Remove usage bars, monthly limit checks, anon-localStorage gating, and the SignupGateway modal trigger.
- Keep the analyze flow itself (file upload → edge function → result). Anonymous users keep the existing 3/24h IP rate limit on the backend; authenticated users get unrestricted.
- Remove the "upgrade" dialogs for video / compare / batch / export.

**`src/components/SignupGateway.tsx`**
- No longer rendered. Leave file in place but unused (or delete — will delete to keep tree clean).

**`src/components/Navbar.tsx`**
- Remove the "Pricing" link and any "Upgrade" CTA.
- Remove the `PaymentFailedBanner` mount if present in the layout.

**`src/components/PaymentFailedBanner.tsx`**
- Stop rendering anywhere. Delete the file.

**`src/pages/Pricing.tsx`** and **`src/pages/PaymentSuccess.tsx`**
- Replace Pricing with a simple "Reprompta is now 100% free" page (or redirect to `/analyze`).
- PaymentSuccess: redirect to `/analyze` (kept as a route in case old Stripe links land there).

**`src/pages/HistoryPage.tsx`**
- Remove the free-tier soft-gate dialog. History is available to all authenticated users.

**`src/components/MediaUploader.tsx`**
- Remove any tier-based copy/upgrade hints; keep the compression + upload logic intact.

**`src/App.tsx`**
- Keep `/pricing` and `/payment-success` routes pointing to the simplified pages so old links don't 404.

### Backend changes

**`supabase/functions/analyze-media/index.ts`**
- Remove server-side tier enforcement block (the Stripe lookup, monthly reset, image/video quota checks, and usage increment/rollback). Authenticated users are unrestricted.
- Keep the anonymous IP rate limit (3 / 24h) and the 20MB data URI cap — these protect against abuse and AI cost spikes.
- Keep model whitelist and CORS as-is.

**`supabase/functions/check-subscription/index.ts`**
- Short-circuit: always return `{ subscribed: true, product_id: null, payment_failed: false, subscription_end: null }` for any authenticated user. Avoids breaking any leftover client calls without needing to remove them all in one pass.

**`create-checkout` / `customer-portal`**
- Leave deployed but unused. No code calls them after this change.

### What is NOT changing

- Auth (email/password + Google) stays.
- Profiles table, history table, storage bucket, RLS policies — unchanged.
- Stripe secrets and edge functions stay in place so payments can be re-enabled later by reverting these UI changes.
- Mobile image compression (recently added) stays.
- Anonymous 3-per-day IP rate limit on `analyze-media` stays — this is abuse protection, not monetization.

### Notes / trade-offs

- **AI cost**: with no quotas on logged-in users, every analysis hits the Lovable AI gateway and consumes Cloud AI balance. Worth knowing before flipping the switch — if usage spikes, you may want to re-introduce a generous monthly cap later.
- **Existing paying customers**: this plan does NOT cancel active Stripe subscriptions. If anyone is currently subscribed, you'll want to cancel/refund them in the Stripe dashboard separately.
- **Data preserved**: `image_analyses_used` / `video_analyses_used` columns stay on `profiles` (just unused). No migration needed.

Confirm and I'll implement.