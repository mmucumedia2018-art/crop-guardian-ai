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
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert agricultural pathologist AI. Analyse the provided image of a crop leaf and determine if the plant is healthy or diseased.

You MUST respond by calling the diagnose_crop tool with your findings. Be accurate and practical in your recommendations.

If the image is not a plant/leaf, set is_healthy to true with crop "Unknown" and explain in the description that the image does not appear to be a crop leaf.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please analyse this crop leaf image for diseases. Identify the crop type, any disease present, its severity, and provide practical treatment and prevention advice suitable for a smallholder farmer.",
                },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "diagnose_crop",
                description:
                  "Return the crop disease diagnosis results.",
                parameters: {
                  type: "object",
                  properties: {
                    crop: {
                      type: "string",
                      description:
                        "The identified crop type (e.g. Tomato, Maize, Rice, Potato)",
                    },
                    is_healthy: {
                      type: "boolean",
                      description: "Whether the plant appears healthy",
                    },
                    disease_name: {
                      type: "string",
                      description:
                        "Name of the detected disease, or 'None' if healthy",
                    },
                    confidence: {
                      type: "string",
                      enum: ["High", "Moderate", "Low"],
                      description: "Confidence level of the diagnosis",
                    },
                    severity: {
                      type: "string",
                      enum: ["Severe", "Moderate", "Mild", "None"],
                      description: "Severity of the disease",
                    },
                    description: {
                      type: "string",
                      description:
                        "A clear, farmer-friendly description of the disease and what causes it (2-3 sentences)",
                    },
                    treatment: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "3-5 practical treatment steps for a smallholder farmer",
                    },
                    prevention: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "2-4 prevention tips for future growing seasons",
                    },
                  },
                  required: [
                    "crop",
                    "is_healthy",
                    "disease_name",
                    "confidence",
                    "severity",
                    "description",
                    "treatment",
                    "prevention",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "diagnose_crop" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured results. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const diagnosis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ diagnosis }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-disease error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
