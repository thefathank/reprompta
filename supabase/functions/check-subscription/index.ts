import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed =
    origin.endsWith(".lovable.app") || origin.endsWith(".lovableproject.com") || origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://reprompta.lovable.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Dev override: grant Pro access without Stripe subscription
    const DEV_PRO_EMAILS = ["harmistead@gmail.com"];
    if (DEV_PRO_EMAILS.includes(user.email)) {
      logStep("Dev override: granting Pro access", { email: user.email });
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "prod_U4MKifk1TpNOWD",
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        payment_failed: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      await supabaseClient
        .from("profiles")
        .update({ payment_failed: false })
        .eq("user_id", user.id);
      return new Response(JSON.stringify({ subscribed: false, payment_failed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      const periodEnd = subscription.current_period_end;
      if (typeof periodEnd === "number") {
        subscriptionEnd = new Date(periodEnd * 1000).toISOString();
      } else if (periodEnd) {
        subscriptionEnd = new Date(periodEnd).toISOString();
      }
      productId = subscription.items.data[0].price.product;
      logStep("Active subscription found", { productId, subscriptionEnd });
    } else {
      logStep("No active subscription");
    }

    const pastDueSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "past_due",
      limit: 1,
    });
    const paymentFailed = pastDueSubs.data.length > 0;
    logStep("Payment status", { paymentFailed });

    await supabaseClient
      .from("profiles")
      .update({ payment_failed: paymentFailed })
      .eq("user_id", user.id);

    if (!hasActiveSub) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("image_analyses_used, video_analyses_used")
        .eq("user_id", user.id)
        .single();

      if (profile && (profile.image_analyses_used > 0 || profile.video_analyses_used > 0)) {
        await supabaseClient
          .from("profiles")
          .update({
            image_analyses_used: 0,
            video_analyses_used: 0,
            usage_reset_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        logStep("Usage counters reset for unsubscribed user");
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      payment_failed: paymentFailed,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
