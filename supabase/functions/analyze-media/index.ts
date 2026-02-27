import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaUrl, mediaType, model } = await req.json();

    if (!mediaUrl || !mediaType) {
      return new Response(JSON.stringify({ error: "mediaUrl and mediaType are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI image/video analysis tool. Your job is to reverse engineer the prompt that was used to generate the given AI-created media.

Analyze the media and return a JSON object using this tool call with the following fields:
- recovered_prompt: The estimated full text prompt used to generate this media
- model_guess: Your best guess of the AI model used (e.g. "Midjourney v6", "DALL·E 3", "Stable Diffusion XL", "Sora", "Runway Gen-3", "Flux", etc.)
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
        text: `Analyze this AI-generated ${mediaType} and reverse engineer its prompt. The media URL is: ${mediaUrl}`,
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
            required: ["recovered_prompt", "model_guess", "settings", "style_tags", "copy_ready_prompts"],
            additionalProperties: false,
          },
        },
      },
    ];

    const selectedModel = model || "google/gemini-2.5-flash";

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
