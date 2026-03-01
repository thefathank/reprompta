

## Issue Found

The `SignupGateway` sends `{ priceId, returnUrl }` in the request body, but the `create-checkout` edge function destructures `{ price_id }` — a naming mismatch. This means clicking a plan in the gateway will always fail with "price_id is required".

## Plan

### 1. Fix the property name mismatch in SignupGateway
In `src/components/SignupGateway.tsx` line 91, change the body from `{ priceId, returnUrl }` to `{ price_id: priceId }`. The `returnUrl` is unused by the edge function anyway (it hardcodes `/payment-success`).

### 2. No other changes needed
- The `create-checkout` function already redirects to `/payment-success` on success.
- The `/payment-success` page already polls `check-subscription` and shows the activated plan.
- The `AuthProvider` already refreshes subscription state on auth changes and periodically.
- The Analyze page already reads `subscription.productId` to determine tier and unlock features.

The flow after the fix:
1. User signs up in gateway
2. User clicks a plan card → `create-checkout` receives correct `price_id` → returns Stripe checkout URL
3. User completes Stripe checkout → redirected to `/payment-success`
4. `/payment-success` polls subscription status → confirms plan → user clicks "Start Analyzing" → back to `/analyze` with full access

