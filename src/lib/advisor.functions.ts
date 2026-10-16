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

// Perplexity models, tried in order; falls through if one is unavailable.
const MODELS = ["sonar", "sonar-pro"];

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["PERPLEXITY_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, message: "The AI advisor is not configured yet." };
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

    const msgs: { role: string; content: string }[] = data.messages
      .filter((m) => m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));

    if (data.imageBase64) {
      // Perplexity sonar is text-only; let the farmer describe the photo instead.
      const last = msgs[msgs.length - 1];
      if (last?.role === "user") {
        last.content = `${last.content || "Please advise on my crop."} (Note: I attached a crop photo, but photo analysis is not available on this advisor — please ask me to describe the symptoms if needed.)`;
      }
    }
    if (msgs.length === 0) return { ok: false as const, message: "Please type a question." };

    for (const model of MODELS) {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...msgs],
        }),
      });

      if (!response.ok) {
        console.error("AI advisor error", model, response.status, await response.text());
        if (response.status === 429) {
          return { ok: false as const, message: "The advisor is busy right now. Please try again in a moment." };
        }
        if (response.status === 401 || response.status === 403) {
          return { ok: false as const, message: "The AI advisor key is invalid. Please check the Perplexity API key." };
        }
        continue; // try next model
      }

      const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const reply = payload.choices?.[0]?.message?.content?.trim();
      if (reply) return { ok: true as const, reply };
    }
    return { ok: false as const, message: "The advisor could not answer that. Please retry." };
  });
