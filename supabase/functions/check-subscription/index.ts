import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

// Reprompta is fully free — every authenticated user gets unlimited access.
// This function is kept as a no-op so existing client calls don't error.
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData?.user?.id) {
        // Clear any stale payment_failed flag from before the app went free.
        await supabaseClient
          .from("profiles")
          .update({ payment_failed: false })
          .eq("user_id", userData.user.id);
      }
    }

    return new Response(JSON.stringify({
      subscribed: true,
      product_id: null,
      subscription_end: null,
      payment_failed: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (_error) {
    // Even on failure, respond with the free-unlimited shape so the client UI works.
    return new Response(JSON.stringify({
      subscribed: true,
      product_id: null,
      subscription_end: null,
      payment_failed: false,
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 200,
    });
  }
});
