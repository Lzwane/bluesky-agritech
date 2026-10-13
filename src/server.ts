import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { renderErrorPage } from "./lib/error-page";

const startHandler = createStartHandler(defaultStreamHandler);

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    try {
      return await startHandler(request);
    } catch (error: any) {
      console.error("========================================");
      console.error("❌ 500 INTERNAL SERVER ERROR CAUSE:");
      console.error("Message:", error?.message);
      console.error("Stack Trace:", error?.stack);
      console.error("========================================");

      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};