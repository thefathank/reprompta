

## Stripe Subscription Integration -- 3 Tiers

### Products & Prices to Create in Stripe
- **Basic** -- $4.99/month (10 images + 1 video/month)
- **Pro** -- $19.00/month (unlimited images, 5 videos/month, batch, comparison, export)

Free tier has no Stripe product -- it's the default state (1 total analysis, no history, no video).

### Edge Functions to Create

**1. `check-subscription`**
- Looks up Stripe customer by user email, checks active subscription
- Returns `{ subscribed, product_id, subscription_end }`
- Used on auth state change + page load + periodic refresh

**2. `create-checkout`**
- Accepts `price_id` in body
- Creates Stripe checkout session in `mode: "subscription"`
- Returns checkout URL for redirect

**3. `customer-portal`**
- Creates Stripe billing portal session for managing/canceling subscription
- Returns portal URL

### Auth Context Changes (`src/lib/auth.tsx`)
- Add subscription state: `{ subscribed, productId, subscriptionEnd, isLoading }`
- Call `check-subscription` on auth state change and on mount
- Expose `subscription` object and a `checkSubscription()` refresh method

### Usage Tracking
- Add columns to `profiles` table via migration:
  - `image_analyses_used` (int, default 0)
  - `video_analyses_used` (int, default 0)
  - `usage_reset_at` (timestamptz, default now())
- The `analyze-media` edge function (or a new `track-usage` wrapper) will check and increment counters before running analysis
- Reset counters monthly (check `usage_reset_at` vs current month)

### Tier Config (frontend constant)
```text
FREE:  { product_id: null, images: 1 (lifetime), videos: 0, history: false, compare: false }
BASIC: { product_id: "prod_xxx", price_id: "price_xxx", images: 10/mo, videos: 1/mo, history: true, compare: false }
PRO:   { product_id: "prod_yyy", price_id: "price_yyy", images: Infinity, videos: 5/mo, history: true, compare: true }
```

### Gating Logic in Analyze Page
- Before analysis: check tier limits against usage counters
- Show remaining quota: "3 of 10 images used this month"
- If limit hit: show upgrade prompt instead of analyze button
- Compare Models toggle: only visible/enabled for Pro tier
- Video upload: disabled on Free tier

### New Pricing Page (`src/pages/Pricing.tsx`)
- 3-column layout: Free / Basic / Pro
- Bold allowance text: **"10 images + 1 video per month"**
- Current plan highlighted with badge
- CTA buttons: "Get Started" (free), "Subscribe" (basic/pro)
- Route: `/pricing`, added to navbar

### History Page Gating
- Free tier: redirect to pricing or show "upgrade to access history"
- Basic/Pro: full access (already works)

### Navbar Update
- Add "Pricing" link
- Show current plan badge or "Upgrade" link for free users

### Files to Create/Modify
- **Create**: `supabase/functions/check-subscription/index.ts`
- **Create**: `supabase/functions/create-checkout/index.ts`
- **Create**: `supabase/functions/customer-portal/index.ts`
- **Create**: `src/pages/Pricing.tsx`
- **Create**: `src/lib/subscription.ts` (tier config, types, hook)
- **Modify**: `src/lib/auth.tsx` (add subscription state)
- **Modify**: `src/pages/Analyze.tsx` (usage gating, quota display)
- **Modify**: `src/pages/HistoryPage.tsx` (free tier gate)
- **Modify**: `src/components/Navbar.tsx` (pricing link, plan badge)
- **Modify**: `src/App.tsx` (add /pricing route)
- **Migration**: Add usage columns to `profiles` table

