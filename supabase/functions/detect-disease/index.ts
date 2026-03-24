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
    const { imageBase64, selectedCrop, language } = await req.json();
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

    const responseLanguage = language && language !== "English" ? language : null;
    const langInstruction = responseLanguage
      ? `\n\nIMPORTANT: You MUST write ALL text fields (description, treatment steps, prevention tips, treatment_costs item names and notes) in ${responseLanguage}. The crop name, disease_name, confidence, and severity enum values should remain in English for data consistency, but everything else must be in ${responseLanguage}. Write naturally in ${responseLanguage} as if speaking to a local farmer.`
      : "";

    const systemPrompt = `You are a world-class agricultural pathologist with 30+ years of field experience across ALL crop types worldwide — cereals (maize, wheat, rice, sorghum, millet, barley, oats), legumes (beans, soybeans, groundnuts, chickpeas, lentils, pigeon peas, cowpeas), root & tuber crops (potato, cassava, sweet potato, yam, taro), vegetables (tomato, pepper, onion, cabbage, kale, spinach, lettuce, carrot, cucumber, eggplant, okra, squash, pumpkin), fruits (banana, mango, avocado, citrus, papaya, pineapple, grape, apple, strawberry, watermelon, passion fruit, guava), oilseeds (sunflower, sesame, canola, oil palm, coconut), stimulants & beverages (coffee, tea, cocoa), fibre crops (cotton, sisal, jute), sugar crops (sugarcane, sugar beet), spices & herbs (ginger, turmeric, garlic, chili), and any other cultivated plant. You have deep expertise in fungal, bacterial, viral, nematode, and nutrient-deficiency disorders across tropical, subtropical, arid, and temperate environments.

ANALYSIS PROTOCOL — follow these steps carefully before calling the tool:
1. **Leaf & plant morphology**: Identify the crop species from leaf shape, venation, texture, stem characteristics, and any visible plant parts. If the exact species is uncertain, provide your best identification and note the uncertainty.
2. **Symptom inventory**: Catalogue every visible symptom — lesion shape, colour, pattern (concentric rings, angular spots, interveinal chlorosis, etc.), location on the leaf (tip, margin, interveinal), and distribution (scattered, clustered, uniform).
3. **Differential diagnosis**: List the top 3 candidate diseases/disorders that match the symptoms. For each, note which symptoms support it and which argue against it.
4. **Final diagnosis**: Choose the most likely diagnosis and justify it. State your confidence honestly — say "Low" if the image is ambiguous, blurry, or shows multiple overlapping issues.

IMPORTANT RULES:
- You MUST support ALL crop types — do not limit yourself to common crops. Identify the crop accurately regardless of how common or rare it is.
- Distinguish between biotic diseases (fungal, bacterial, viral, nematode) and abiotic disorders (nutrient deficiency, sunburn, chemical burn, physical damage, water stress). Many apps misclassify abiotic issues as diseases.
- If you see nutrient deficiency patterns (e.g., uniform yellowing, purple discolouration, tip burn), diagnose the specific deficiency rather than a disease.
- If the image is blurry, too far away, or does not clearly show a plant leaf, set is_healthy to true, crop to "Unknown", and explain in description that the image quality is insufficient for accurate diagnosis.
- For treatment, estimate approximate costs in USD for a smallholder farmer buying from a local agro-dealer. Include product names and alternatives.
- Be specific in treatment: name active ingredients (e.g., "Mancozeb 75% WP" not just "fungicide"), application rates, and timing.${langInstruction}

You MUST respond by calling the diagnose_crop tool with your findings.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: selectedCrop
                    ? `The farmer indicates this is a ${selectedCrop} plant. Please verify this identification and analyse the leaf for diseases. If the leaf clearly belongs to a different crop, use the correct identification instead. Provide practical treatment and prevention advice suitable for a smallholder farmer. Include estimated treatment costs.`
                    : "Please analyse this crop leaf image for diseases. Identify the crop type, any disease present, its severity, and provide practical treatment and prevention advice suitable for a smallholder farmer. Include estimated treatment costs.",
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
                description: "Return the crop disease diagnosis results with treatment costs.",
                parameters: {
                  type: "object",
                  properties: {
                    crop: {
                      type: "string",
                      description: "The identified crop type (e.g. Tomato, Maize, Rice, Potato)",
                    },
                    is_healthy: {
                      type: "boolean",
                      description: "Whether the plant appears healthy",
                    },
                    disease_name: {
                      type: "string",
                      description: "Name of the detected disease, or 'None' if healthy",
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
                      description: "A clear, farmer-friendly description of the disease and what causes it (2-3 sentences)",
                    },
                    treatment: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 practical treatment steps for a smallholder farmer",
                    },
                    treatment_costs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          item: { type: "string", description: "Product or action name" },
                          cost_usd: { type: "number", description: "Approximate cost in USD" },
                          notes: { type: "string", description: "Where to buy or alternatives" },
                        },
                        required: ["item", "cost_usd", "notes"],
                        additionalProperties: false,
                      },
                      description: "Estimated costs for each treatment item",
                    },
                    prevention: {
                      type: "array",
                      items: { type: "string" },
                      description: "2-4 prevention tips for future growing seasons",
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
                    "treatment_costs",
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
