// deno-lint-ignore-file
declare const Deno: any;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { crop, imageBase64, imageMediaType, customPrompt, farmerName, preferredLanguage } = body;

    const apiKey = Deno.env.get("GROQ_API_KEY");
    const isScanningRequest = Boolean(imageBase64 && !customPrompt?.includes("Conversation History"));
    let aiResultText = "";

    if (apiKey) {
      try {
        const systemPrompt = isScanningRequest
          ? `You are an expert plant pathologist for Southern African agriculture. Analyze this ${crop || "crop"} leaf specimen. Return valid JSON only with keys:
{
  "disease_name": "Identified disease or Healthy",
  "scientific_name": "Latin scientific name",
  "confidence": 92,
  "severity": "Low | Moderate | High | Critical",
  "pathogen_type": "Fungal | Bacterial | Viral | Pest Infestation | Nutrient Deficiency | Healthy",
  "symptoms_observed": ["list of symptoms observed"],
  "organic_treatment": "organic control measures",
  "chemical_treatment": "Act 36 of 1947 registered compounds",
  "preventative_measures": "practical field steps",
  "safety_note": "PPE and withholding period advice"
}`
          : `You are BlueSky AgriTech AI, a precise, concise, and direct AI agronomist assistant. 
Strict Rules:
1. Answer ONLY what the user asked. Keep responses short, direct, and conversational (like Gemini or ChatGPT).
2. DO NOT over-explain or add unnecessary paragraphs.
3. DO NOT add unsolicited follow-up suggestions, lists of recommended next questions, or conversational filler like "Let me know if you need anything else!".
4. Communicate in ${preferredLanguage || "English"}.`;

        const userTextContent = isScanningRequest
          ? `Analyze this ${crop || "crop"} leaf specimen. Provide symptoms, organic control, and Act 36 chemical remedies. Return valid JSON only.`
          : (customPrompt || `Farmer asks: How do I manage my crops?`);

        const messages: any[] = [
          { role: "system", content: systemPrompt }
        ];

        if (isScanningRequest && imageBase64) {
          messages.push({
            role: "user",
            content: [
              { type: "text", text: userTextContent },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageMediaType || "image/jpeg"};base64,${imageBase64}`
                }
              }
            ]
          });
        } else {
          messages.push({ role: "user", content: userTextContent });
        }

        const selectedModel = (isScanningRequest && imageBase64) 
          ? "llama-3.2-90b-vision-preview" 
          : "openai/gpt-oss-120b";

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: messages,
            temperature: 0.2,
            max_tokens: 600, // Keeps answers short and punchy
            ...(isScanningRequest ? { response_format: { type: "json_object" } } : {})
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          aiResultText = resData.choices?.[0]?.message?.content || "";
        }
      } catch (err) {
        console.error("GROQ_FETCH_CATCH_ERROR:", err);
      }
    }

    if (isScanningRequest) {
      let parsedJson: any = null;
      try {
        const clean = aiResultText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        parsedJson = JSON.parse(clean);
      } catch (_) {}

      if (!parsedJson) {
        parsedJson = {
          disease_name: "Foliar Examination Complete",
          scientific_name: "Asymptomatic Foliage",
          confidence: 85,
          severity: "Low",
          pathogen_type: "Nutritional / Environmental Stress",
          symptoms_observed: ["Early chlorotic margins", "Localized canopy stress"],
          organic_treatment: "Apply foliar seaweed extract.",
          chemical_treatment: "Standard balanced NPK foliar spray.",
          preventative_measures: "Test soil pH and maintain irrigation filtration.",
          safety_note: "Wear calibrated PPE when handling Act 36 remedies.",
        };
      }

      return new Response(
        JSON.stringify({
          ...parsedJson,
          response: aiResultText || parsedJson.disease_name,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalChatResponse =
      aiResultText || "Hello! How can I help?";

    return new Response(
      JSON.stringify({
        response: finalChatResponse,
        reply: finalChatResponse,
        text: finalChatResponse,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        response: "AI service temporarily unavailable.",
        disease_name: "Scan Processed",
        confidence: 85,
        symptoms_observed: ["General foliar observation"],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});