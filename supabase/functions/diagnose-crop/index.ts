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
    const { crop, imageBase64, imageMediaType } = body;

    const apiKey = Deno.env.get("VITE_GEMINI_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      throw new Error("Gemini API key is missing in Supabase Edge Function secrets.");
    }

    if (!imageBase64) {
      throw new Error("No image data received.");
    }

    const systemPrompt = `You are an expert senior agricultural plant pathologist for South Africa. Analyze this crop leaf specimen image very carefully.
Target Crop selected by user: "${crop || 'unknown'}". 

Provide a precise, unique diagnosis based strictly on the visual evidence in the uploaded photo. Do not output generic placeholders.

Return your response STRICTLY as a valid JSON object without markdown formatting blocks (no \`\`\`json). Use these exact keys:
{
  "crop": "Verified crop name",
  "disease_name": "Exact disease name, pest species, or nutrient deficiency observed",
  "scientific_name": "Accurate binomial Latin scientific name",
  "confidence": 92,
  "severity": "Low",
  "pathogen_type": "Fungal",
  "symptoms_observed": ["Specific symptom 1", "Specific symptom 2", "Specific symptom 3"],
  "organic_treatment": "Practical organic or cultural control method.",
  "chemical_treatment": "Specific chemical active ingredient registered under South Africa's Act 36 of 1947.",
  "preventative_measures": "Long-term agronomic prevention strategy.",
  "safety_note": "Mandatory safety disclaimer regarding Act 36 handling and PPE."
}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: imageMediaType || "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean and sanitize the JSON string to prevent unterminated string errors
    const cleanText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanText);
    } catch (_e) {
      // Fallback sanitizer for unescaped newlines/quotes inside string values
      const sanitized = cleanText
        .replace(/[\u0000-\u001F]+/g, " ")
        .replace(/\\n/g, " ")
        .replace(/\\"/g, '"');
      parsedJson = JSON.parse(sanitized);
    }

    return new Response(
      JSON.stringify({
        ...parsedJson,
        response: rawText,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("DIAGNOSIS_REAL_ERROR:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});