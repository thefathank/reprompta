

## Current Flow vs Desired Flow

**Current:** Landing → "Start analyzing" → Auth page (must sign up/login) → Analyze page (gated by `RequireAuth`)

**Desired:** Landing → "Start analyzing" → Analyze page (no login needed) → First analysis works free → On second attempt, show signup + payment gateway

## Plan

### 1. Remove auth gate from Analyze route
In `src/App.tsx`, unwrap `<Analyze />` from `<RequireAuth>` so anonymous users can access `/analyze`.

### 2. Update "Start analyzing" link on landing page
In `src/pages/Index.tsx`, change the CTA link to always point to `/analyze` (currently goes to `/auth` for logged-out users).

### 3. Track free usage via localStorage for anonymous users
Since anonymous users have no database profile, track their usage count in `localStorage` (e.g. key `reprompta_free_uses`, increment after each successful analysis).

### 4. Rework the Analyze page for anonymous flow
In `src/pages/Analyze.tsx`:
- Allow anonymous uploads — the `analyze-media` edge function doesn't require auth (it uses the Lovable AI gateway, not user tokens).
- For file upload to storage: use a temporary approach — upload without user ID prefix, or call the edge function with an inline base64/URL approach. Since the storage bucket is public and the edge function accepts a `mediaUrl`, we can upload anonymously or skip storage for anonymous users and send the file directly.
- After a successful analysis: increment `localStorage` counter.
- On second attempt (counter >= 1): instead of running analysis, show a **signup + pricing dialog** that blocks further use. This dialog will have:
  - "Create an account to keep analyzing" messaging
  - Sign-up form (inline or link to `/auth`)
  - Plan options (Free tier gone — show Basic and Pro)
  - "Sign in" link for returning users

### 5. Update the analyze-media edge function
Currently the edge function doesn't verify auth — it just needs `mediaUrl` and `mediaType`. No changes needed here. But the Analyze page currently requires `user` for storage upload and DB insert. For anonymous users:
- Skip saving to `analyses` table (no user ID)
- Skip incrementing profile usage counters
- Skip storage upload — instead, convert the file to a data URL or use a temporary public upload path

### 6. Create a gateway dialog component
A new `SignupGateway` dialog/modal shown when anonymous users hit their limit:
- Explains the value prop
- Inline auth form (email + password) or "Go to sign in" button
- Pricing cards (Basic $4.99/mo, Pro $19/mo)
- After successful signup, redirect back to `/analyze` where they can continue (now as a logged-in free user with 1 lifetime analysis already used)

### 7. Navbar adjustments
Show "Analyze" link for everyone (not just logged-in users). Keep "History" only for logged-in users.

### Technical Details

**Anonymous file handling:** For anonymous users, we'll read the file as a base64 data URL client-side and pass it directly to the edge function instead of uploading to storage first. The edge function already accepts image URLs — we'll add support for base64 data URIs or upload to a temporary path using the anon key (the bucket is public).

**localStorage key:** `reprompta_free_analyses` — integer counter, checked before each analysis attempt.

**Auth flow after gateway:** When user signs up through the gateway, `onAuthStateChange` fires, the Analyze page detects the new user, and normal gated flow resumes. Their localStorage free use carries over conceptually (they've already used their 1 free analysis).

**Files to modify:**
- `src/App.tsx` — remove RequireAuth from Analyze route
- `src/pages/Index.tsx` — CTA always links to `/analyze`
- `src/pages/Analyze.tsx` — major rework for anonymous flow, localStorage tracking, gateway trigger
- `src/components/Navbar.tsx` — show Analyze link for all users
- **New:** `src/components/SignupGateway.tsx` — the upgrade/signup modal

