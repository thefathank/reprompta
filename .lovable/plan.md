

## Add "Analyze Another" CTA after first free analysis

Currently, after the first free analysis completes, the result is shown but there's no clear prompt to try again. The uploader stays hidden behind the `!result` condition, so users have no obvious next step. We need to add a compelling CTA below the result that encourages them to upload another image — which will then trigger the paywall.

### Changes to `src/pages/Analyze.tsx`

1. After the `AnalysisResult` component renders (line ~456), add a prominent "Analyze Another Image" section for anonymous users who have used their free analysis:
   - A motivating message like "Curious about another image? See what prompt was used."
   - A button labeled "Analyze Another Image" that resets the current result and file state, bringing back the uploader
   - When they upload and click Analyze again, the existing `getAnonUsage() >= 1` check kicks in and shows the `SignupGateway`

2. The button's onClick will: `setResult(null); setFile(null);` — clearing the state so the uploader reappears. The next attempt will hit the paywall naturally.

3. For logged-in users, show a simpler "Analyze Another" button that also resets state (no paywall messaging needed).

### No other files need changes
The paywall logic already works — this is purely about adding a nudge in the post-result UI to guide users into the second attempt.

