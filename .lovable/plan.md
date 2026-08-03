## Plan: Remove Stripe entirely

Reprompta is already fully free — no UI charges anything. This removes the leftover Stripe plumbing so the app no longer has any payment capability or stored payment credentials.

### Delete edge functions
- `supabase/functions/create-checkout/` — deleted and undeployed.
- `supabase/functions/customer-portal/` — deleted and undeployed.
- `supabase/functions/check-subscription/` — deleted and undeployed (it currently just returns a hardcoded "subscribed" response).

### Config
- `supabase/config.toml`: remove the `[functions.create-checkout]`, `[functions.customer-portal]`, `[functions.check-subscription]`, and `[functions.stripe-webhook]` blocks. Keep `analyze-media`.

### Frontend cleanup
- `src/lib/auth.tsx`: remove `checkSubscription`, the `subscription` state, the 60-second polling interval, and the `check-subscription` invoke. The auth context exposes only `session`, `user`, `loading`, `signUp`, `signIn`, `signOut`.
- `src/lib/subscription.ts`: delete the file. Any component still importing `TIERS` / `getTierByProductId` / `SubscriptionState` gets those imports and usages removed — all features are already unconditionally unlocked, so nothing changes behaviorally.
- Sweep for any remaining `useAuth().subscription` reads and drop them.

### Secrets
- Delete `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the `Stripe` secret from backend secrets.
- Disconnect the Stripe connector from the project.

### Notes
- Any Stripe subscriptions that already exist are not affected by this — cancelling or refunding them has to be done from the Stripe dashboard directly. Worth doing before removing the connection if anyone is still being billed.
- Auth, history, storage, and analysis are untouched.
- Re-adding payments later means re-enabling the integration from scratch.
