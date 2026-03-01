import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Allowed models whitelist
const ALLOWED_MODELS = new Set([
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-3-flash-preview",
  "google/gemini-3-pro-preview",
]);

// Max data URI size: 20MB
const MAX_DATA_URI_SIZE = 20 * 1024 * 1024;

// Anonymous rate limit: max requests per 24h window
const ANON_MAX_REQUESTS = 3;
const ANON_WINDOW_HOURS = 24;

function getClientIp(req: Request): string {
  // Check common proxy headers
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Parse & validate input ---
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mediaUrl, mediaType, model } = body;

    if (!mediaUrl || !mediaType) {
      return new Response(JSON.stringify({ error: "mediaUrl and mediaType are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate mediaType
    if (mediaType !== "image" && mediaType !== "video") {
      return new Response(JSON.stringify({ error: "mediaType must be 'image' or 'video'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate model against whitelist
    const selectedModel = model || "google/gemini-2.5-flash";
    if (!ALLOWED_MODELS.has(selectedModel)) {
      return new Response(JSON.stringify({ error: "Invalid model specified" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate mediaUrl format
    const isDataUri = mediaUrl.startsWith("data:");
    if (isDataUri) {
      // Validate data URI format and size
      if (!/^data:(image|video)\/[\w.+-]+;base64,/.test(mediaUrl)) {
        return new Response(JSON.stringify({ error: "Invalid data URI format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (mediaUrl.length > MAX_DATA_URI_SIZE) {
        return new Response(JSON.stringify({ error: "Media too large. Maximum 20MB." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Validate URL format - must be HTTPS
      try {
        const parsed = new URL(mediaUrl);
        if (parsed.protocol !== "https:") {
          return new Response(JSON.stringify({ error: "mediaUrl must use HTTPS" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: "Invalid mediaUrl format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let isAuthenticated = false;

    if (authHeader?.startsWith("Bearer ")) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabase.auth.getClaims(token);

      if (!error && data?.claims?.sub) {
        userId = data.claims.sub;
        isAuthenticated = true;
      }
    }

    // For unauthenticated requests: only allow data URIs (client-side uploads)
    // and restrict to default model only
    if (!isAuthenticated) {
      if (!isDataUri) {
        return new Response(JSON.stringify({ error: "Authentication required for URL-based analysis" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (model && model !== "google/gemini-2.5-flash") {
        return new Response(JSON.stringify({ error: "Authentication required for model selection" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // --- Server-side IP rate limiting for anonymous users ---
      const clientIp = getClientIp(req);
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Clean up stale entries periodically (best-effort)
      await adminClient.rpc("cleanup_stale_rate_limits").catch(() => {});

      const windowCutoff = new Date(Date.now() - ANON_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

      // Check existing rate limit record
      const { data: existing } = await adminClient
        .from("anon_rate_limits")
        .select("id, request_count, window_start")
        .eq("ip_address", clientIp)
        .single();

      if (existing) {
        if (existing.window_start > windowCutoff) {
          // Still within window
          if (existing.request_count >= ANON_MAX_REQUESTS) {
            return new Response(JSON.stringify({
              error: "Rate limit exceeded. Sign up for more analyses.",
            }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          // Increment counter
          await adminClient
            .from("anon_rate_limits")
            .update({ request_count: existing.request_count + 1 })
            .eq("id", existing.id);
        } else {
          // Window expired — reset
          await adminClient
            .from("anon_rate_limits")
            .update({ request_count: 1, window_start: new Date().toISOString() })
            .eq("id", existing.id);
        }
      } else {
        // First request from this IP
        await adminClient
          .from("anon_rate_limits")
          .insert({ ip_address: clientIp, request_count: 1, window_start: new Date().toISOString() });
      }
    }

    // --- AI Analysis ---
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI image/video analysis tool. Your job is to reverse engineer the prompt that was used to generate the given AI-created media.

Analyze the media and return a JSON object using this tool call with the following fields:
- recovered_prompt: The estimated full text prompt used to generate this media
- model_guess: Your best guess of the AI model used (e.g. "Midjourney v6", "DALL·E 3", "Stable Diffusion XL", "Sora", "Runway Gen-3", "Flux", etc.)
- confidence_score: A number from 0 to 100 representing how confident you are in your analysis. Consider: how clearly AI-generated the media is, how identifiable the model/style is, how specific vs generic the recovered prompt is. 90+ = very confident, 70-89 = fairly confident, 50-69 = moderate, below 50 = low confidence.
- settings: An object with estimated generation settings like aspect_ratio, style_preset, cfg_scale, steps, seed (use string values)
- style_tags: An array of style/aesthetic keywords (art style, lighting, composition, mood, color palette)
- copy_ready_prompts: An object with the prompt formatted for different AI tools:
  - "Midjourney": formatted with Midjourney syntax (e.g. /imagine prompt: ... --ar 16:9 --v 6)
  - "DALL-E": formatted for DALL·E
  - "Stable Diffusion": formatted with SD syntax (positive prompt, with quality tags)
  - "ComfyUI": formatted for ComfyUI workflows

Be thorough and specific. Analyze composition, lighting, style, color palette, subject matter, and technical details.`;

    const userContent: any[] = [
      {
        type: "text",
        text: `Analyze this AI-generated ${mediaType} and reverse engineer its prompt.`,
      },
    ];

    if (mediaType === "image") {
      userContent.push({
        type: "image_url",
        image_url: { url: mediaUrl },
      });
    } else if (mediaType === "video") {
      userContent.push({
        type: "video_url",
        video_url: { url: mediaUrl },
      });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "return_analysis",
          description: "Return the complete analysis of the AI-generated media",
          parameters: {
            type: "object",
            properties: {
              recovered_prompt: { type: "string", description: "The estimated full text prompt" },
              model_guess: { type: "string", description: "Best guess of the AI model used" },
              confidence_score: { type: "number", description: "Confidence score from 0-100 in the analysis quality" },
              settings: {
                type: "object",
                additionalProperties: { type: "string" },
                description: "Estimated generation settings",
              },
              style_tags: {
                type: "array",
                items: { type: "string" },
                description: "Style/aesthetic keywords",
              },
              copy_ready_prompts: {
                type: "object",
                properties: {
                  Midjourney: { type: "string" },
                  "DALL-E": { type: "string" },
                  "Stable Diffusion": { type: "string" },
                  ComfyUI: { type: "string" },
                },
                required: ["Midjourney", "DALL-E", "Stable Diffusion", "ComfyUI"],
                additionalProperties: false,
              },
            },
            required: ["recovered_prompt", "model_guess", "confidence_score", "settings", "style_tags", "copy_ready_prompts"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-media error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
