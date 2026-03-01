

## Plan: Update Live Stripe Product & Price IDs

### What
Replace all test-mode Stripe product and price IDs with the new live-mode IDs across the codebase.

### Changes

**1. `src/lib/subscription.ts`** — Update `TIERS` config
- Basic: `product_id` → `prod_U4MJwRZbJp7Nid`, `price_id` → `price_1T6Db6Dab7guoXOTw2qzpWhg`
- Pro: `product_id` → `prod_U4MKifk1TpNOWD`, `price_id` → `price_1T6DbSDab7guoXOTqb7hBGFM`

**2. `src/components/SignupGateway.tsx`** — Update `PLANS` array
- Basic `priceId` → `price_1T6Db6Dab7guoXOTw2qzpWhg`
- Pro `priceId` → `price_1T6DbSDab7guoXOTqb7hBGFM`

**3. `supabase/functions/check-subscription/index.ts`** — Update dev override
- Dev override Pro product_id → `prod_U4MKifk1TpNOWD`

No backend or database changes required.

