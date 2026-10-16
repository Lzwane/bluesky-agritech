import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .min(1)
    .max(30),
  language: z.string().max(10).default("en"),
  farmerName: z.string().max(100).optional(),
  imageBase64: z.string().max(12_000_000).optional(),
  imageMediaType: z.string().max(50).optional(),
});

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["GEMINI_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, message: "The AI advisor is not configured yet. Missing Gemini API key." };
    }

    const systemPrompt = [
      "You are the AI Farm Advisor for BlueSky AgriTech's AI Crop Detective, a friendly South African agricultural expert.",
      "Give practical, localised guidance on planting, irrigation, fertilisation, pests, diseases and harvest timing for South African conditions.",
      "Keep answers short, conversational and to the point. If the user greets casually, reply casually.",
      "Do not use markdown asterisks or hashtags.",
      "If a question needs a lab test or extension officer, say so plainly.",
      data.farmerName ? `The farmer's name is ${data.farmerName}.` : "",
      `Reply in the user's selected language (ISO code: ${data.language}). If unsure, reply in English.`,
    ].join(" ");

    const formattedHistory = data.messages
      .filter((m) => m.content.trim())
      .map((m) => `${m.role === "user" ? "Farmer" : "Advisor"}: ${m.content}`)
      .join("\n\n");

    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${formattedHistory}\n\nAdvisor:`;

    const parts: any[] = [{ text: fullPrompt }];

    if (data.imageBase64 && data.imageBase64.trim()) {
      parts.push({
        inline_data: {
          mime_type: data.imageMediaType || "image/jpeg",
          data: data.imageBase64,
        },
      });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini AI advisor error status", response.status, errText);
        if (response.status === 429) {
          return { ok: false as const, message: "The advisor is busy right now. Please try again in a moment." };
        }
        return { ok: false as const, message: `The AI advisor encountered an error (${response.status}).` };
      }

      const payload = (await response.json()) as any;
      const reply = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (reply) {
        return { ok: true as const, reply };
      }

      return { ok: false as const, message: "The advisor received an empty response. Please retry." };
    } catch (err: any) {
      console.error("Gemini server function exception:", err);
      return { ok: false as const, message: "Failed to connect to Gemini AI advisor." };
    }
  });