import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Check } from "lucide-react";

interface SignupGatewayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLANS = [
  {
    name: "Basic",
    price: "$4.99",
    period: "/mo",
    features: ["10 image analyses/mo", "1 video analysis/mo", "Saved history"],
    priceId: "price_1T6Db6Dab7guoXOTw2qzpWhg",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: [
      "Unlimited image analyses",
      "5 video analyses/mo",
      "Model comparison",
      "Batch upload & bulk export",
    ],
    priceId: "price_1T6DbSDab7guoXOTqb7hBGFM",
    highlight: true,
  },
];

export function SignupGateway({ open, onOpenChange }: SignupGatewayProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/pricing?welcome=1` },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We sent a confirmation link to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onOpenChange(false);
        toast({
          title: "Welcome back! 🎉",
          description: "Pick a plan to start analyzing.",
        });
        navigate("/pricing");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    // User needs to be signed in first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign up first",
        description: "Create an account, then select a plan.",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { price_id: priceId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-accent" />
            Keep analyzing
          </DialogTitle>
          <DialogDescription>
            Your free analysis is used up. Create an account and pick a plan to continue reverse engineering prompts.
          </DialogDescription>
        </DialogHeader>

        {/* Auth form */}
        <form onSubmit={handleAuth} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="gw-email" className="text-xs">Email</Label>
            <Input
              id="gw-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gw-password" className="text-xs">Password</Label>
            <Input
              id="gw-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button type="button" onClick={() => setMode("signin")} className="text-foreground underline underline-offset-2">
                  Sign in
                </button>
              </>
            ) : (
              <>Need an account?{" "}
                <button type="button" onClick={() => setMode("signup")} className="text-foreground underline underline-offset-2">
                  Sign up
                </button>
              </>
            )}
          </p>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">then pick a plan</span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-3 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <button
              key={plan.name}
              onClick={() => handleCheckout(plan.priceId)}
              className={`flex flex-col rounded-lg border p-4 text-left transition-colors hover:border-accent/40 ${
                plan.highlight ? "border-accent/30 bg-accent/5" : "border-border"
              }`}
            >
              <span className="text-sm font-semibold">{plan.name}</span>
              <span className="mt-1 text-2xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
              </span>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
