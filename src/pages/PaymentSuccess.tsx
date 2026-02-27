import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getTierByProductId } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const { user, subscription, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      await checkSubscription();
      attempts++;
      // Keep polling until subscribed or max attempts
      if (!subscription.subscribed && attempts < maxAttempts) {
        setTimeout(poll, 2000);
      } else {
        setRefreshing(false);
      }
    };

    poll();
  }, []);

  // Stop refreshing once subscription is confirmed
  useEffect(() => {
    if (subscription.subscribed) setRefreshing(false);
  }, [subscription.subscribed]);

  const tier = getTierByProductId(subscription.productId);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        {refreshing ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <h1 className="mt-6 text-2xl font-bold tracking-tight">Confirming your subscription…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This usually takes just a moment.
            </p>
          </>
        ) : subscription.subscribed ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">You're on {tier.name}!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your subscription is active. Start analyzing with your new limits.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-8 flex h-11 items-center rounded-md bg-accent px-8 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start Analyzing
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't confirm your subscription. It may take a moment to process — try refreshing.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setRefreshing(true); checkSubscription().then(() => setRefreshing(false)); }}
                className="flex h-10 items-center rounded-md border border-border px-6 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="flex h-10 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Back to Pricing
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

