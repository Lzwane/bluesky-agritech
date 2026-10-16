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

// Tried in order; falls through to the next only if a model is unavailable or errors.
const MODELS = ["google/gemini-3.5-flash", "google/gemini-3-flash-preview", "google/gemini-2.5-flash"];

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, message: "The AI advisor is not configured yet." };
    }

    const systemPrompt = [
      "You are the AI Farm Advisor for BlueSky AgriTech's AI Crop Detective, a friendly South African agricultural expert.",
      "Give practical, localised guidance on planting, irrigation, fertilisation, pests, diseases and harvest timing for South African conditions.",
      "Keep answers short, conversational and to the point. If the user greets casually, reply casually.",
      "Do not use markdown asterisks or hashtags. If an image is attached, analyse it carefully.",
      "If a question needs a lab test or extension officer, say so plainly.",
      data.farmerName ? `The farmer's name is ${data.farmerName}.` : "",
      `Reply in the user's selected language (ISO code: ${data.language}). If unsure, reply in English.`,
    ].join(" ");

    const msgs: any[] = data.messages
      .filter((m) => m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));
    if (data.imageBase64) {
      const last = msgs[msgs.length - 1];
      const text = last?.role === "user" ? last.content : "Please analyse this crop photo.";
      if (last?.role === "user") msgs.pop();
      msgs.push({
        role: "user",
        content: [
          { type: "text", text: text || "Please analyse this crop photo." },
          {
            type: "image_url",
            image_url: { url: `data:${data.imageMediaType || "image/jpeg"};base64,${data.imageBase64}` },
          },
        ],
      });
    }
    if (msgs.length === 0) return { ok: false as const, message: "Please type a question." };

    for (const model of MODELS) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, ...msgs] }),
      });

      if (!response.ok) {
        console.error("AI advisor error", model, response.status, await response.text());
        if (response.status === 429) {
          return { ok: false as const, message: "The advisor is busy right now. Please try again in a moment." };
        }
        if (response.status === 402 || response.status === 403) {
          return { ok: false as const, message: "AI usage is currently unavailable for this workspace." };
        }
        continue; // try next model
      }

      const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const reply = payload.choices?.[0]?.message?.content?.trim();
      if (reply) return { ok: true as const, reply };
    }
    return { ok: false as const, message: "The advisor could not answer that. Please retry." };
  });
