import { useAuth } from "@/lib/auth";
import { TIERS, getTierKey } from "@/lib/subscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Check, Sparkles, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const plans = [
  {
    key: "free",
    price: "$0",
    period: "",
    allowance: "1 image analysis total",
    features: ["Single image analysis", "Prompt recovery", "Model identification", "Copy-ready prompts"],
    excluded: ["No saved history", "No video analysis", "No batch upload", "No model comparison"],
  },
  {
    key: "basic",
    price: "$4.99",
    period: "/month",
    allowance: "10 images + 1 video per month",
    features: ["10 image analyses/month", "1 video analysis/month", "Saved history", "Search & filter", "One-click copy formats", "Confidence scoring"],
    excluded: ["No batch upload", "No model comparison"],
  },
  {
    key: "pro",
    price: "$19",
    period: "/month",
    allowance: "Unlimited images + 5 videos per month",
    features: ["Unlimited image analyses", "5 video analyses/month", "Everything in Basic", "Batch upload", "Model comparison", "Bulk export"],
    excluded: [],
  },
];

export default function Pricing() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const currentTierKey = getTierKey(subscription.productId);
  const isWelcome = searchParams.get("welcome") === "1";

  // Clear the welcome param from URL after showing
  useEffect(() => {
    if (isWelcome) {
      const timeout = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isWelcome, setSearchParams]);

  const handleSubscribe = async (priceId: string, tierKey: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoadingPlan(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setLoadingPlan("manage");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen px-6 pt-24 pb-16 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl"
      >
        <div className="text-center">
          {isWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-sm font-medium text-accent"
            >
              <PartyPopper className="h-4 w-4" />
              Welcome! Pick a plan to start analyzing.
            </motion.div>
          )}
          <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Choose the plan that fits your workflow.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const tier = TIERS[plan.key];
            const isCurrent = currentTierKey === plan.key;
            const isPro = plan.key === "pro";

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative flex flex-col rounded-xl border p-6 ${
                  isPro
                    ? "border-accent/30 card-glow"
                    : "border-border rim-light"
                }`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-3 left-4 bg-accent text-accent-foreground">
                    Current Plan
                  </Badge>
                )}
                {isPro && !isCurrent && (
                  <Badge className="absolute -top-3 left-4 bg-accent text-accent-foreground">
                    <Sparkles className="mr-1 h-3 w-3" /> Most Popular
                  </Badge>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-semibold">{tier.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-foreground">
                    {plan.allowance}
                  </p>
                </div>

                <div className="flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.excluded.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                      <span className="mt-0.5 h-3.5 w-3.5 shrink-0 text-center">—</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  {isCurrent ? (
                    subscription.subscribed ? (
                      <button
                        onClick={handleManage}
                        disabled={loadingPlan === "manage"}
                        className="flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-medium transition-colors hover:bg-secondary"
                      >
                        {loadingPlan === "manage" ? "Loading…" : "Manage Subscription"}
                      </button>
                    ) : (
                      <div className="flex h-10 w-full items-center justify-center rounded-md bg-secondary text-sm font-medium text-muted-foreground">
                        Current Plan
                      </div>
                    )
                  ) : tier.price_id ? (
                    <button
                      onClick={() => handleSubscribe(tier.price_id!, plan.key)}
                      disabled={loadingPlan === plan.key}
                      className={`flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
                        isPro
                          ? "bg-accent text-accent-foreground"
                          : "bg-foreground text-background"
                      }`}
                    >
                      {loadingPlan === plan.key ? "Loading…" : "Subscribe"}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(user ? "/analyze" : "/auth")}
                      className="flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-medium transition-colors hover:bg-secondary"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
