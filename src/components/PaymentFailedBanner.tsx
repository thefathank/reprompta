import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export function PaymentFailedBanner() {
  const { subscription, user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!subscription.paymentFailed) return null;

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 bg-destructive/10 border-b border-destructive/20 px-4 py-2.5 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
      <span className="text-destructive font-medium">
        Your last payment failed. Please update your payment method to keep your subscription active.
      </span>
      <button
        onClick={handleManage}
        disabled={loading}
        className="ml-2 rounded-md bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Loading…" : "Update Payment"}
      </button>
    </div>
  );
}
